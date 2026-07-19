<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class UploadService
{
    public function __construct(
        private readonly ThumbnailService $thumbnailService
    ) {}

    public function uploadVideo(Project $project, UploadedFile $file): Project
    {
        $disk = Storage::disk('public');

        // Clean up the previous video (and its thumbnail) if one exists
        if ($project->video_path && $disk->exists($project->video_path)) {
            $disk->delete($project->video_path);
        }
        if ($project->thumbnail_path && $disk->exists($project->thumbnail_path)) {
            $disk->delete($project->thumbnail_path);
        }

        $filename = uniqid('video_') . '.' . $file->getClientOriginalExtension();
        $path     = $file->storeAs('uploads', $filename, 'public');

        $project->update([
            'video_path'     => $path,
            'video_name'     => $file->getClientOriginalName(),
            'thumbnail_path' => null,   // clear stale thumbnail while we generate
            'status'         => 'pending',
        ]);

        // Generate thumbnail — failures are silently swallowed
        try {
            $thumbPath = $this->thumbnailService->generate($project);
            if ($thumbPath) {
                $project->update(['thumbnail_path' => $thumbPath]);
            }
        } catch (\Throwable $e) {
            Log::warning('upload.thumbnail_failed', [
                'project_id' => $project->id,
                'message'    => $e->getMessage(),
            ]);
        }

        return $project->fresh();
    }
}

