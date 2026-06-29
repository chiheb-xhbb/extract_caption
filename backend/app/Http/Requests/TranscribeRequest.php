<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TranscribeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'language' => ['sometimes', 'string', 'in:fr,en,ar,auto'],
        ];
    }
}