<?php

declare(strict_types=1);

namespace App\Http\Requests\Assignments;

use App\Models\Assignment;
use Illuminate\Foundation\Http\FormRequest;

use Illuminate\Validation\Rule;

final class AssignManagerRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Assignment|null $assignment */
        $assignment = $this->route('assignment');

        return $assignment !== null
            && ($this->user()?->can('assignManager', $assignment) ?? false);
    }

    protected function prepareForValidation(): void
    {
        $manager = $this->input('managerId') ?? $this->input('manager_id');
        if ($manager === 'unassigned' || $manager === '') {
            $this->merge([
                'managerId' => null,
                'manager_id' => null,
            ]);
        }
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'managerId' => ['nullable', 'uuid', Rule::exists('users', 'uuid')],
            'manager_id' => ['nullable', 'uuid', Rule::exists('users', 'uuid')],
        ];
    }
}
