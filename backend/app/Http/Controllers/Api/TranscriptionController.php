<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\TranscribeRequest;
use App\Http\Resources\ProjectResource;
use App\Models\Project;
use App\Services\TranscriptionService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class TranscriptionController extends Controller
{
    public function __construct(
        private readonly TranscriptionService $transcriptionService
    ) {}

    public function transcribe(TranscribeRequest $request, int $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);

        try {
            $transcribed = $this->transcriptionService->transcribe($project);
            return (new ProjectResource($transcribed))->response();
        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
