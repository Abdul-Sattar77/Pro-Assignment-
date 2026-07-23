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
            // Any file type is accepted (PDF, Office, images, video, audio,
            // archives, etc.). Only a size cap is enforced.
            'file' => [
                'required',
                'file',
                'max:102400', // 100 MB (accommodates video)
            ],
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
