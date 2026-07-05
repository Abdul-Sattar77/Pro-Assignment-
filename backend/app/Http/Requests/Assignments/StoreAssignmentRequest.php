<?php

declare(strict_types=1);

namespace App\Http\Requests\Assignments;

use App\Models\Assignment;
use Illuminate\Foundation\Http\FormRequest;

final class StoreAssignmentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Assignment::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:180'],
            'subject' => ['required', 'string', 'max:120'],
            'description' => ['required', 'string', 'max:10000'],
            'deadline' => ['required', 'date', 'after:+2 hours'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'deadline.after' => 'The deadline must be at least a couple of hours from now.',
        ];
    }
}
