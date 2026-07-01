<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProjectRequest;
use App\Http\Requests\UpdateProjectRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProjectController extends Controller
{
    public function __construct(
        private readonly ProjectService $projectService
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $projects = $this->projectService->getAllProjects();
        return ProjectResource::collection($projects);
    }

    public function store(StoreProjectRequest $request): JsonResponse
    {
        $project = $this->projectService->createProject($request->validated());
        return (new ProjectResource($project))->response()->setStatusCode(201);
    }

    public function show(int $id): JsonResponse
    {
        $project = $this->projectService->getProjectWithRelations($id);
        return (new ProjectResource($project))->response();
    }

    public function update(UpdateProjectRequest $request, int $id): JsonResponse
    {
        $project = Project::findOrFail($id);
        $updated = $this->projectService->updateProject($project, $request->validated());
        return (new ProjectResource($updated))->response();
    }

    public function destroy(int $id): JsonResponse
    {
        $project = Project::findOrFail($id);
        $this->projectService->deleteProject($project);
        return response()->json(['message' => 'Projet supprimé avec succès.']);
    }
}
