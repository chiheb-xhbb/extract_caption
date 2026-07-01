<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ExportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'project_id'   => $this->project_id,
            'type'         => $this->type,
            'file_path'    => $this->file_path,
            'download_url' => $this->file_path ? Storage::disk('public')->url($this->file_path) : null,
            'status'       => $this->status,
            'created_at'   => $this->created_at->toISOString(),
        ];
    }
}
