<?php

declare(strict_types=1);

namespace App\Http\Requests\Assignments;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Shared body for workflow actions that carry an optional note
 * (accept/reject/submit/return/deliver/cancel). Per-action authorization is
 * enforced in the controller via policy + the service's state rules.
 */
final class WorkflowNoteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'note' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ];
    }

    public function note(): ?string
    {
        $note = $this->validated('note');

        return is_string($note) && $note !== '' ? $note : null;
    }
}
