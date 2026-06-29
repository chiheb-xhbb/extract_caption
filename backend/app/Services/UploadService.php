<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class UploadService
{
    public function uploadVideo(Project $project, UploadedFile $file): Project
    {
        if ($project->video_path && Storage::exists($project->video_path)) {
            Storage::delete($project->video_path);
        }

        $filename = uniqid('video_') . '.' . $file->getClientOriginalExtension();
        $path     = $file->storeAs('uploads', $filename);

        $project->update([
            'video_path' => $path,
            'video_name' => $file->getClientOriginalName(),
            'status'     => 'pending',
        ]);

        return $project->fresh();
    }
}