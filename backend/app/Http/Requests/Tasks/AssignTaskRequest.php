<?php

declare(strict_types=1);

namespace App\Http\Requests\Tasks;

use App\Models\Task;
use Illuminate\Foundation\Http\FormRequest;

final class AssignTaskRequest extends FormRequest
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
            'assignedUserId' => ['nullable', 'string', 'exists:users,uuid'],
        ];
    }
}
