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
            // Any file type is accepted (PDF, Office, images, video, audio,
            // archives, etc.). Only a size cap is enforced.
            'file' => [
                'required',
                'file',
                'max:102400', // 100 MB (accommodates video)
            ],
            // Optional per-file note ("Add Notes Per File").
            'note' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'file.max' => 'Files must be 100 MB or smaller.',
        ];
    }
}
