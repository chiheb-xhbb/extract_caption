<?php

namespace App\Services;

use App\Models\Caption;
use App\Models\Project;
use App\Models\Word;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class TranscriptionService
{
    public function transcribe(Project $project): Project
    {
        $startedAt = microtime(true);

        Log::info('transcription.start', [
            'project_id' => $project->id,
            'video_path' => $project->video_path,
            'language' => $project->language,
        ]);

        if (!$project->video_path || !Storage::exists($project->video_path)) {
            throw new RuntimeException('Aucune vidéo trouvée pour ce projet.');
        }

        $project->update(['status' => 'processing']);
        Log::info('transcription.status_processing_saved', [
            'project_id' => $project->id,
            'elapsed_ms' => $this->elapsedMs($startedAt),
        ]);

        try {
            $aiResponse = $this->callWhisperService($project);
            Log::info('transcription.ai_response_received', [
                'project_id' => $project->id,
                'captions' => count($aiResponse['captions'] ?? []),
                'duration' => $aiResponse['duration'] ?? null,
                'language' => $aiResponse['language'] ?? null,
                'elapsed_ms' => $this->elapsedMs($startedAt),
            ]);

            $this->saveCaptionsAndWords($project, $aiResponse['captions']);
            Log::info('transcription.captions_saved', [
                'project_id' => $project->id,
                'elapsed_ms' => $this->elapsedMs($startedAt),
            ]);

            $project->update([
                'status'   => 'completed',
                'duration' => (int) $aiResponse['duration'],
                'language' => $aiResponse['language'],
            ]);
            Log::info('transcription.project_completed_saved', [
                'project_id' => $project->id,
                'elapsed_ms' => $this->elapsedMs($startedAt),
            ]);

            return $project->fresh(['captions.words']);

        } catch (\Exception $e) {
            $project->update(['status' => 'error']);
            Log::error('transcription.failed', [
                'project_id' => $project->id,
                'elapsed_ms' => $this->elapsedMs($startedAt),
                'exception' => $e::class,
                'message' => $e->getMessage(),
            ]);

            throw $e;
        }
    }

    private function callWhisperService(Project $project): array
    {
        $videoPath = Storage::path($project->video_path);
        $aiUrl     = config('services.ai.url');

        if (!file_exists($videoPath)) {
            throw new RuntimeException(
                'Fichier vidéo introuvable sur le disque : ' . $videoPath
            );
        }

        $fileSize = filesize($videoPath);
        $requestStartedAt = microtime(true);

        Log::info('transcription.ai_http_start', [
            'project_id' => $project->id,
            'ai_url' => $aiUrl,
            'video_path' => $videoPath,
            'video_size_bytes' => $fileSize,
            'language' => $project->language,
        ]);

        $readStartedAt = microtime(true);
        $videoContents = file_get_contents($videoPath);
        Log::info('transcription.video_read', [
            'project_id' => $project->id,
            'bytes' => strlen($videoContents),
            'elapsed_ms' => $this->elapsedMs($readStartedAt),
        ]);

        $response = Http::timeout(300)
            ->attach('file', $videoContents, basename($videoPath))
            ->post("{$aiUrl}/transcribe?language={$project->language}");

        Log::info('transcription.ai_http_end', [
            'project_id' => $project->id,
            'status' => $response->status(),
            'successful' => $response->successful(),
            'response_bytes' => strlen($response->body()),
            'elapsed_ms' => $this->elapsedMs($requestStartedAt),
        ]);

        if (!$response->successful()) {
            throw new RuntimeException(
                'Erreur du service IA : ' . $response->body()
            );
        }

        return $response->json();
    }

    private function saveCaptionsAndWords(Project $project, array $captions): void
    {
        $transactionStartedAt = microtime(true);
        $wordCount = array_sum(array_map(
            fn (array $caption) => count($caption['words'] ?? []),
            $captions
        ));

        Log::info('transcription.db_transaction_start', [
            'project_id' => $project->id,
            'captions' => count($captions),
            'words' => $wordCount,
        ]);

        DB::transaction(function () use ($project, $captions) {
            $deleteStartedAt = microtime(true);
            $project->captions()->delete();
            Log::info('transcription.existing_captions_deleted', [
                'project_id' => $project->id,
                'elapsed_ms' => $this->elapsedMs($deleteStartedAt),
            ]);

            foreach ($captions as $index => $captionData) {
                $captionStartedAt = microtime(true);
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

                if (($index + 1) % 25 === 0 || $index === array_key_last($captions)) {
                    Log::info('transcription.caption_batch_saved', [
                        'project_id' => $project->id,
                        'caption_index' => $index + 1,
                        'caption_words' => count($captionData['words'] ?? []),
                        'caption_elapsed_ms' => $this->elapsedMs($captionStartedAt),
                    ]);
                }
            }
        });

        Log::info('transcription.db_transaction_end', [
            'project_id' => $project->id,
            'elapsed_ms' => $this->elapsedMs($transactionStartedAt),
        ]);
    }

    private function elapsedMs(float $startedAt): int
    {
        return (int) round((microtime(true) - $startedAt) * 1000);
    }
}
