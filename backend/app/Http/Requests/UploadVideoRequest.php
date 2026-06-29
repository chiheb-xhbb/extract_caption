<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UploadVideoRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $maxSize = config('upload.max_size', 512000);

        return [
            'video' => [
                'required',
                'file',
                'mimes:mp4,mov,avi,mkv,webm',
                "max:{$maxSize}",
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'video.required' => 'Aucun fichier vidéo fourni.',
            'video.file'     => 'Le fichier uploadé est invalide.',
            'video.mimes'    => 'Format accepté : mp4, mov, avi, mkv, webm.',
            'video.max'      => 'La vidéo ne doit pas dépasser 500MB.',
        ];
    }
}