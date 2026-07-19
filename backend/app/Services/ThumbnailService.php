<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ThumbnailService
{
    /**
     * Extract a single frame from the project's video and store it as a JPEG.
     *
     * Returns the relative disk path on success, or null on any failure
     * so that a bad FFmpeg environment never breaks the upload flow.
     */
    public function generate(Project $project): ?string
    {
        if (!$project->video_path) {
            return null;
        }

        $disk      = Storage::disk('public');
        $videoAbs  = $disk->path($project->video_path);

        if (!file_exists($videoAbs)) {
            Log::warning('thumbnail.video_not_found', [
                'project_id' => $project->id,
                'path'       => $videoAbs,
            ]);
            return null;
        }

        $relOut = 'thumbnails/' . $project->id . '.jpg';
        $absOut = $disk->path($relOut);

        // Ensure the thumbnails directory exists
        $dir = dirname($absOut);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }

        // Seek to 1 s, grab 1 frame, quality 2 (scale 1–31, lower = better)
        $cmd = sprintf(
            'ffmpeg -y -ss 1 -i %s -vframes 1 -q:v 2 %s 2>&1',
            escapeshellarg($videoAbs),
            escapeshellarg($absOut)
        );

        exec($cmd, $output, $exitCode);

        if ($exitCode !== 0) {
            Log::warning('thumbnail.ffmpeg_failed', [
                'project_id' => $project->id,
                'exit_code'  => $exitCode,
                'output'     => implode("\n", $output),
            ]);
            return null;
        }

        if (!file_exists($absOut) || filesize($absOut) === 0) {
            Log::warning('thumbnail.output_empty', [
                'project_id' => $project->id,
            ]);
            return null;
        }

        Log::info('thumbnail.generated', [
            'project_id' => $project->id,
            'path'       => $relOut,
        ]);

        return $relOut;
    }
}
