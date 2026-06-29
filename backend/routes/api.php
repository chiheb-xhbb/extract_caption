
<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\TranscriptionController;
use App\Http\Controllers\Api\CaptionController;
use App\Http\Controllers\Api\ExportController;

Route::prefix('projects')->group(function () {

    // Projects CRUD
    Route::get('/',          [ProjectController::class, 'index']);
    Route::post('/',         [ProjectController::class, 'store']);
    Route::get('/{id}',      [ProjectController::class, 'show']);
    Route::put('/{id}',      [ProjectController::class, 'update']);
    Route::delete('/{id}',   [ProjectController::class, 'destroy']);

    // Upload
    Route::post('/{id}/upload', [UploadController::class, 'upload']);

    // Transcription
    Route::post('/{id}/transcribe', [TranscriptionController::class, 'transcribe']);

    // Captions
    Route::get('/{id}/captions',                    [CaptionController::class, 'index']);
    Route::put('/{id}/captions/{captionId}',         [CaptionController::class, 'update']);
    Route::delete('/{id}/captions/{captionId}',      [CaptionController::class, 'destroy']);
    Route::post('/{id}/captions/merge',              [CaptionController::class, 'merge']);

    // Export
    Route::post('/{id}/export', [ExportController::class, 'export']);
});