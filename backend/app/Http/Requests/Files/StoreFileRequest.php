<?php

declare(strict_types=1);

namespace App\Http\Requests\Files;

use App\Models\Assignment;
use Illuminate\Foundation\Http\FormRequest;

final class StoreFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $assignment = $this->route('assignment');

        return $user !== null
            && $assignment instanceof Assignment
            && $user->can('view', $assignment)
            && $user->can('files.upload');
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
                'max:25600', // 25 MB
                'mimes:pdf,doc,docx,ppt,pptx,xls,xlsx,zip,jpg,jpeg,png,gif,webp,mp3,wav,m4a,txt',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.max' => 'Files must be 25 MB or smaller.',
            'file.mimes' => 'That file type is not supported.',
        ];
    }
}
