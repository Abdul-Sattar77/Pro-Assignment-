<?php

declare(strict_types=1);

namespace App\Http\Requests\Calendar;

use App\Enums\CalendarEventStatus;
use App\Enums\CalendarEventType;
use App\Models\CalendarEvent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateCalendarEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var CalendarEvent|null $event */
        $event = $this->route('calendar');

        return $event !== null
            && ($this->user()?->can('update', $event) ?? false);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'eventType' => [
                'sometimes',
                Rule::in([CalendarEventType::Meeting->value, CalendarEventType::Custom->value]),
            ],
            'startDate' => ['sometimes', 'date'],
            'endDate' => ['sometimes', 'nullable', 'date', 'after_or_equal:startDate'],
            'assignmentId' => ['sometimes', 'nullable', 'string', 'exists:assignments,uuid'],
            'taskId' => ['sometimes', 'nullable', 'string', 'exists:tasks,uuid'],
            'userId' => ['sometimes', 'nullable', 'string', 'exists:users,uuid'],
            'status' => ['sometimes', Rule::in(CalendarEventStatus::values())],
        ];
    }
}
