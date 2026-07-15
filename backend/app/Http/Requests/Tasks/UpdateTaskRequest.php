<?php

declare(strict_types=1);

namespace App\Http\Requests\Tasks;

use App\Enums\TaskPriority;
use App\Enums\TaskStatus;
use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Task|null $task */
        $task = $this->route('task');

        return $task !== null
            && ($this->user()?->can('update', $task) ?? false);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:10000'],
            'assignmentId' => ['sometimes', 'nullable', 'string', 'exists:assignments,uuid'],
            'assignedUserId' => ['sometimes', 'nullable', 'string', 'exists:users,uuid'],
            'priority' => ['sometimes', Rule::in(TaskPriority::values())],
            'status' => ['sometimes', Rule::in(TaskStatus::values())],
            'dueDate' => ['sometimes', 'nullable', 'date'],
            'notes' => ['sometimes', 'nullable', 'string', 'max:10000'],
        ];
    }
}
