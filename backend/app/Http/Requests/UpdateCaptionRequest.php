<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCaptionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'text'  => ['sometimes', 'string', 'min:1'],
            'start' => ['sometimes', 'numeric', 'min:0'],
            'end'   => ['sometimes', 'numeric', 'min:0', 'gt:start'],
            'order' => ['sometimes', 'integer', 'min:1'],
        ];
    }

    public function messages(): array
    {
        return [
            'end.gt' => 'Le temps de fin doit être supérieur au temps de début.',
        ];
    }
}