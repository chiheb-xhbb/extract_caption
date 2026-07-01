<?php

namespace App\Services;

use App\Models\Project;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Storage;

class ProjectService
{
    public function getAllProjects(): Collection
    {
        return Project::orderBy('created_at', 'desc')->get();
    }

    public function getProjectWithRelations(int $projectId): Project
    {
        return Project::with(['captions.words', 'exports'])
            ->findOrFail($projectId);
    }

    public function createProject(array $validated): Project
    {
        return Project::create([
            'name'     => $validated['name'],
            'language' => $validated['language'] ?? 'fr',
            'status'   => 'pending',
        ]);
    }

    public function updateProject(Project $project, array $validated): Project
    {
        $project->update($validated);
        return $project->fresh();
    }

    public function deleteProject(Project $project): void
    {
        $disk = Storage::disk('public');

        if ($project->video_path && $disk->exists($project->video_path)) {
            $disk->delete($project->video_path);
        }

        $project->delete();
    }
}
