<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CaptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'project_id' => $this->project_id,
            'order'      => $this->order,
            'text'       => $this->text,
            'start'      => $this->start,
            'end'        => $this->end,
            'words'      => WordResource::collection($this->whenLoaded('words')),
        ];
    }
}