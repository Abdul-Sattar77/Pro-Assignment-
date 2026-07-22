<?php

declare(strict_types=1);

namespace App\Http\Requests\Assignments;

use App\Enums\AssignmentPriority;
use App\Models\Assignment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\In;

final class UpdateAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Assignment|null $assignment */
        $assignment = $this->route('assignment');

        return $assignment !== null
            && ($this->user()?->can('update', $assignment) ?? false);
    }

    protected function prepareForValidation(): void
    {
        $pm = $this->input('projectManagerId') ?? $this->input('project_manager_id');
        if ($pm === 'unassigned' || $pm === '') {
            $this->merge([
                'projectManagerId' => null,
                'project_manager_id' => null,
            ]);
        }
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:180'],
            'subject' => ['sometimes', 'string', 'max:120'],
            'description' => ['sometimes', 'string', 'max:10000'],
            'deadline' => ['sometimes', 'date', 'after:now'],
            'priority' => ['sometimes', 'string', new In(AssignmentPriority::values())],
            'word_count' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:100000'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'client_price' => ['sometimes', 'numeric', 'min:0'],
            'writer_cost' => ['sometimes', 'numeric', 'min:0'],
            'discount' => ['sometimes', 'numeric', 'min:0'],
            'net_profit' => ['sometimes', 'numeric'],
            'projectManagerId' => ['sometimes', 'nullable', 'uuid', Rule::exists('users', 'uuid')],
            'project_manager_id' => ['sometimes', 'nullable', 'uuid', Rule::exists('users', 'uuid')],
        ];
    }
}
