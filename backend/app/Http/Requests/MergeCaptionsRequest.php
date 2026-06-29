<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class MergeCaptionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'caption_ids'   => ['required', 'array', 'min:2'],
            'caption_ids.*' => ['required', 'integer', 'exists:captions,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'caption_ids.required' => 'Les IDs des sous-titres sont obligatoires.',
            'caption_ids.min'      => 'Au moins 2 sous-titres sont requis pour fusionner.',
            'caption_ids.*.exists' => 'Un des sous-titres sélectionnés n\'existe pas.',
        ];
    }
}