<?php

declare(strict_types=1);

namespace App\Http\Requests\Files;

use App\Models\File;
use Illuminate\Foundation\Http\FormRequest;

final class UpdateFileRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var File|null $file */
        $file = $this->route('file');

        return $file !== null
            && ($this->user()?->can('update', $file) ?? false);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'filename' => [
                'required',
                'string',
                'min:1',
                'max:255',
            ],
        ];
    }
}
