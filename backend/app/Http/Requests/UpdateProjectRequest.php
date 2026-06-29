<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['sometimes', 'string', 'min:1', 'max:255'],
            'language' => ['sometimes', 'string', 'in:fr,en,ar,auto'],
        ];
    }
}