<?php

declare(strict_types=1);

namespace App\Http\Requests\Assignments;

use App\Models\Assignment;
use Illuminate\Foundation\Http\FormRequest;

final class AssignWriterRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Assignment|null $assignment */
        $assignment = $this->route('assignment');

        return $assignment !== null
            && ($this->user()?->can('assign', $assignment) ?? false);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'writerId' => ['required', 'uuid'],
        ];
    }
}
