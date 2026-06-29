<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'     => ['required', 'string', 'min:1', 'max:255'],
            'language' => ['sometimes', 'string', 'in:fr,en,ar,auto'],
        ];
    }

    public function messages(): array
    {
        return [
            'name.required' => 'Le nom du projet est obligatoire.',
            'name.max'      => 'Le nom ne peut pas dépasser 255 caractères.',
            'language.in'   => 'La langue doit être fr, en, ar ou auto.',
        ];
    }
}