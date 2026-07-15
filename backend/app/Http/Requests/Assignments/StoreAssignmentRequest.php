<?php

declare(strict_types=1);

namespace App\Http\Requests\Assignments;

use App\Enums\AcademicLevel;
use App\Enums\AssignmentPriority;
use App\Enums\AssignmentType;
use App\Models\Assignment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

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
            // Assignment details
            'title' => ['required', 'string', 'max:180'],
            'subject' => ['required', 'string', 'max:120'],
            'type' => ['nullable', Rule::enum(AssignmentType::class)],
            'academic_level' => ['nullable', Rule::enum(AcademicLevel::class)],
            'course' => ['nullable', 'string', 'max:160'],
            'university' => ['nullable', 'string', 'max:160'],
            'word_count' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'referencing_style' => ['nullable', 'string', 'max:60'],
            'priority' => ['nullable', Rule::enum(AssignmentPriority::class)],
            'deadline' => ['required', 'date', 'after:+2 hours'],

            // Student contact details
            'contact_phone' => ['nullable', 'string', 'max:40'],
            'contact_whatsapp' => ['nullable', 'string', 'max:40'],

            // Additional information
            'description' => ['required', 'string', 'max:10000'],
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
