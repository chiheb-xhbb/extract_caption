<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\ExportRequest;
use App\Http\Resources\ExportResource;
use App\Models\Project;
use App\Services\ExportService;
use Illuminate\Http\JsonResponse;
use RuntimeException;

class ExportController extends Controller
{
    public function __construct(
        private readonly ExportService $exportService
    ) {}

    public function export(ExportRequest $request, int $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);

        try {
            $export = match($request->validated('type')) {
                'srt'        => $this->exportService->exportSrt($project),
                'mp4', 'mov' => $this->exportService->exportVideo($project),
            };

            return (new ExportResource($export))->response()->setStatusCode(201);

        } catch (RuntimeException $e) {
            return response()->json([
                'message' => $e->getMessage(),
            ], 422);
        }
    }
}
