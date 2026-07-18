<?php

declare(strict_types=1);

namespace App\Http\Requests\Documents;

use Illuminate\Foundation\Http\FormRequest;

final class StoreDocumentTemplateRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Admins and PMs manage document templates.
        $user = $this->user();

        return $user !== null && ($user->hasRole('admin') || $user->hasRole('project_manager'));
    }

    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['nullable', 'string', 'max:5000'],
            'fileId' => ['nullable', 'string', 'exists:files,uuid'],
        ];
    }
}
