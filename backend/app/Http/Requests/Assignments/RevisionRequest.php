<?php

declare(strict_types=1);

namespace App\Http\Requests\Assignments;

use App\Models\Assignment;
use Illuminate\Foundation\Http\FormRequest;

final class RevisionRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Assignment|null $assignment */
        $assignment = $this->route('assignment');

        return $assignment !== null
            && ($this->user()?->can('requestRevision', $assignment) ?? false);
    }

    /**
     * A revision must explain what to change.
     *
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'note' => ['required', 'string', 'min:10', 'max:2000'],
        ];
    }
}
