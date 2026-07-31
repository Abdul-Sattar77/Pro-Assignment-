<?php

declare(strict_types=1);

namespace App\Http\Requests\Files;

use App\Models\Assignment;
use App\Rules\SafeUpload;
use Illuminate\Foundation\Http\FormRequest;

final class StoreFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        if ($user === null) {
            return false;
        }

        $assignment = $this->route('assignment');
        if ($assignment instanceof Assignment) {
            return $user->can('view', $assignment) && $user->can('files.upload');
        }

        return true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            // Broad file support (PDF, Office, images, video, audio, archives)
            // with a size cap and a denylist for executable/script types.
            'file' => [
                'required',
                'file',
                'max:102400', // 100 MB (accommodates video)
                new SafeUpload(),
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
