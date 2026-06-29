<?php

namespace App\Services;

use App\Models\Caption;
use App\Models\Project;
use App\Models\Word;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class TranscriptionService
{
    public function transcribe(Project $project): Project
    {
        if (!$project->video_path || !Storage::exists($project->video_path)) {
            throw new RuntimeException('Aucune vidéo trouvée pour ce projet.');
        }

        $project->update(['status' => 'processing']);

        try {
            $aiResponse = $this->callWhisperService($project);
            $this->saveCaptionsAndWords($project, $aiResponse['captions']);

            $project->update([
                'status'   => 'done',
                'duration' => (int) $aiResponse['duration'],
                'language' => $aiResponse['language'],
            ]);

            return $project->fresh(['captions.words']);

        } catch (\Exception $e) {
            $project->update(['status' => 'error']);
            throw $e;
        }
    }

    private function callWhisperService(Project $project): array
    {
        $videoPath  = storage_path('app/' . $project->video_path);
        $aiUrl      = config('services.ai.url');

        $response = Http::timeout(300)
            ->attach('file', file_get_contents($videoPath), basename($videoPath))
            ->post("{$aiUrl}/transcribe?language={$project->language}");

        if (!$response->successful()) {
            throw new RuntimeException('Erreur du service IA : ' . $response->body());
        }

        return $response->json();
    }

    private function saveCaptionsAndWords(Project $project, array $captions): void
    {
        DB::transaction(function () use ($project, $captions) {
            $project->captions()->delete();

            foreach ($captions as $index => $captionData) {
                $caption = Caption::create([
                    'project_id' => $project->id,
                    'order'      => $index + 1,
                    'text'       => $captionData['text'],
                    'start'      => $captionData['start'],
                    'end'        => $captionData['end'],
                ]);

                if (!empty($captionData['words'])) {
                    $wordRecords = array_map(fn($word) => [
                        'caption_id' => $caption->id,
                        'word'       => $word['word'],
                        'start'      => $word['start'],
                        'end'        => $word['end'],
                        'created_at' => now(),
                        'updated_at' => now(),
                    ], $captionData['words']);

                    Word::insert($wordRecords);
                }
            }
        });
    }
}