<?php

namespace App\Services;

use App\Models\Export;
use App\Models\Project;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class ExportService
{
    public function exportSrt(Project $project): Export
    {
        $disk = Storage::disk('public');
        $captions = $project->captions()->orderBy('order')->get();

        if ($captions->isEmpty()) {
            throw new RuntimeException('Aucun sous-titre à exporter.');
        }

        $srtContent = $this->generateSrtContent($captions);
        $filename   = 'exports/project_' . $project->id . '_' . time() . '.srt';

        $disk->put($filename, $srtContent);

        return Export::create([
            'project_id' => $project->id,
            'type'       => 'srt',
            'file_path'  => $filename,
            'status'     => 'done',
        ]);
    }

    public function exportVideo(Project $project): Export
    {
        $disk = Storage::disk('public');

        if (!$project->video_path || !$disk->exists($project->video_path)) {
            throw new RuntimeException('Aucune vidéo trouvée pour ce projet.');
        }

        $captions = $project->captions()->orderBy('order')->get();

        if ($captions->isEmpty()) {
            throw new RuntimeException('Aucun sous-titre à incruster.');
        }

        $srtContent = $this->generateSrtContent($captions);
        $srtPath    = storage_path('app/temp/subtitles_' . $project->id . '_' . time() . '.srt');
        $outputName = 'exports/project_' . $project->id . '_final_' . time() . '.mp4';
        $videoOut   = $disk->path($outputName);
        $videoIn    = $disk->path($project->video_path);

        $this->ensureDirectoryExists(dirname($srtPath));
        $this->ensureDirectoryExists(dirname($videoOut));

        file_put_contents($srtPath, $srtContent);

        try {
            $this->runFfmpeg($videoIn, $srtPath, $videoOut);
        } finally {
            if (file_exists($srtPath)) {
                unlink($srtPath);
            }
        }

        return Export::create([
            'project_id' => $project->id,
            'type'       => 'mp4',
            'file_path'  => $outputName,
            'status'     => 'done',
        ]);
    }

    private function generateSrtContent($captions): string
    {
        $srt = '';

        foreach ($captions as $index => $caption) {
            $start = $this->secondsToSrtTimestamp($caption->start);
            $end   = $this->secondsToSrtTimestamp($caption->end);
            $srt  .= ($index + 1) . "\n";
            $srt  .= "{$start} --> {$end}\n";
            $srt  .= $caption->text . "\n\n";
        }

        return $srt;
    }

    private function runFfmpeg(string $videoIn, string $srtPath, string $videoOut): void
    {
        $srtEscaped = str_replace(['\\', ':'], ['/', '\\:'], $srtPath);

        $command = sprintf(
            'ffmpeg -i %s -vf "subtitles=\'%s\':force_style=\'FontName=Arial,FontSize=18,PrimaryColour=&HFFFFFF&,OutlineColour=&H000000&,Outline=2,Alignment=2\'" -c:a copy -y %s 2>&1',
            escapeshellarg($videoIn),
            $srtEscaped,
            escapeshellarg($videoOut)
        );

        exec($command, $output, $exitCode);

        if ($exitCode !== 0) {
            throw new RuntimeException(
                'FFmpeg export échoué : ' . implode("\n", $output)
            );
        }
    }

    private function secondsToSrtTimestamp(float $seconds): string
    {
        $hours        = (int) floor($seconds / 3600);
        $minutes      = (int) floor(($seconds % 3600) / 60);
        $secs         = (int) floor($seconds % 60);
        $milliseconds = (int) round(($seconds - floor($seconds)) * 1000);

        return sprintf('%02d:%02d:%02d,%03d', $hours, $minutes, $secs, $milliseconds);
    }

    private function ensureDirectoryExists(string $path): void
    {
        if (!file_exists($path)) {
            mkdir($path, 0755, true);
        }
    }
}
