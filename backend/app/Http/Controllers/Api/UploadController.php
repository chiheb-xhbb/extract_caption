<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UploadVideoRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\UploadService;
use Illuminate\Http\JsonResponse;

class UploadController extends Controller
{
    public function __construct(
        private readonly UploadService $uploadService
    ) {}

    public function upload(UploadVideoRequest $request, int $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);
        $updated = $this->uploadService->uploadVideo($project, $request->file('video'));
        return (new ProjectResource($updated))->response();
    }
}
