<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ExportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'type' => ['required', 'string', 'in:srt,mp4,mov'],
        ];
    }

    public function messages(): array
    {
        return [
            'type.required' => 'Le type d\'export est obligatoire.',
            'type.in'       => 'Le type doit être srt, mp4 ou mov.',
        ];
    }
}