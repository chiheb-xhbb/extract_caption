<?php

namespace App\Services;

use App\Models\Caption;
use App\Models\Project;
use Illuminate\Support\Facades\DB;

class CaptionService
{
    public function updateCaption(Caption $caption, array $validated): Caption
    {
        $caption->update($validated);
        return $caption->fresh('words');
    }

    public function deleteCaption(Caption $caption): void
    {
        DB::transaction(function () use ($caption) {
            $project = $caption->project;
            $caption->delete();
            $this->reindexCaptions($project);
        });
    }

    public function mergeCaptions(Project $project, array $captionIds): Caption
    {
        return DB::transaction(function () use ($project, $captionIds) {
            $captions = Caption::where('project_id', $project->id)
                ->whereIn('id', $captionIds)
                ->orderBy('start')
                ->get();

            if ($captions->count() < 2) {
                throw new \InvalidArgumentException(
                    'Au moins 2 sous-titres sont requis pour fusionner.'
                );
            }

            $mergedText  = $captions->pluck('text')->implode(' ');
            $mergedStart = $captions->first()->start;
            $mergedEnd   = $captions->last()->end;

            $primary = $captions->first();
            $primary->update([
                'text'  => $mergedText,
                'start' => $mergedStart,
                'end'   => $mergedEnd,
            ]);

            $captions->skip(1)->each->delete();
            $this->reindexCaptions($project);

            return $primary->fresh('words');
        });
    }

    private function reindexCaptions(Project $project): void
    {
        $project->captions()
            ->orderBy('start')
            ->get()
            ->each(function (Caption $caption, int $index) {
                $caption->update(['order' => $index + 1]);
            });
    }
}