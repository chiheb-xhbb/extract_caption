<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'video_name' => $this->video_name,
            'video_url'  => $this->video_path ? Storage::url($this->video_path) : null,
            'duration'   => $this->duration,
            'language'   => $this->language,
            'status'     => $this->status,
            'captions'   => CaptionResource::collection($this->whenLoaded('captions')),
            'exports'    => ExportResource::collection($this->whenLoaded('exports')),
            'created_at' => $this->created_at->toISOString(),
            'updated_at' => $this->updated_at->toISOString(),
        ];
    }
}