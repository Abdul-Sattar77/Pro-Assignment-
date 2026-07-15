<?php

declare(strict_types=1);

namespace App\Http\Requests\Users;

use Illuminate\Foundation\Http\FormRequest;

final class StoreWriterRatingRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Clients, Project Managers, and Admins can rate a writer.
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'assignmentId' => ['required', 'string', 'exists:assignments,uuid'],
            'quality' => ['required', 'integer', 'min:1', 'max:5'],
            'timeliness' => ['required', 'integer', 'min:1', 'max:5'],
            'communication' => ['required', 'integer', 'min:1', 'max:5'],
            'comment' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
