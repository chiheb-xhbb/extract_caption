<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\MergeCaptionsRequest;
use App\Http\Requests\UpdateCaptionRequest;
use App\Http\Resources\CaptionResource;
use App\Models\Caption;
use App\Models\Project;
use App\Services\CaptionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CaptionController extends Controller
{
    public function __construct(
        private readonly CaptionService $captionService
    ) {}

    public function index(int $projectId): AnonymousResourceCollection
    {
        $project  = Project::findOrFail($projectId);
        $captions = $project->captions()->with('words')->get();
        return CaptionResource::collection($captions);
    }

    public function update(UpdateCaptionRequest $request, int $projectId, int $captionId): JsonResponse
    {
        $project = Project::findOrFail($projectId);
        $caption = Caption::where('project_id', $project->id)->findOrFail($captionId);
        $updated = $this->captionService->updateCaption($caption, $request->validated());
        return response()->json(new CaptionResource($updated));
    }

    public function destroy(int $projectId, int $captionId): JsonResponse
    {
        $project = Project::findOrFail($projectId);
        $caption = Caption::where('project_id', $project->id)->findOrFail($captionId);
        $this->captionService->deleteCaption($caption);
        return response()->json(['message' => 'Sous-titre supprimé avec succès.']);
    }

    public function merge(MergeCaptionsRequest $request, int $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);
        $merged  = $this->captionService->mergeCaptions($project, $request->validated('caption_ids'));
        return response()->json(new CaptionResource($merged));
    }
}