<?php

declare(strict_types=1);

namespace App\Http\Requests\Files;

use App\Models\File;
use Illuminate\Foundation\Http\FormRequest;

final class StoreFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', File::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'file' => [
                'required',
                'file',
                'max:51200', // 50MB
                'mimes:pdf,doc,docx,xls,xlsx,ppt,pptx,txt,rtf,jpg,jpeg,png,gif,webp,zip,rar',
            ],
            'assignmentId' => [
                'nullable',
                'string',
                'exists:assignments,uuid',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.max' => 'The file size must not exceed 50 megabytes.',
            'file.mimes' => 'The selected file type is not supported.',
        ];
    }
}
