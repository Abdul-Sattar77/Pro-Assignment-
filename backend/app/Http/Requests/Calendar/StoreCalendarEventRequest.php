<?php

declare(strict_types=1);

namespace App\Http\Requests\Calendar;

use App\Enums\CalendarEventStatus;
use App\Enums\CalendarEventType;
use App\Models\CalendarEvent;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreCalendarEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', CalendarEvent::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:2000'],
            'eventType' => [
                'required',
                Rule::in([CalendarEventType::Meeting->value, CalendarEventType::Custom->value]),
            ],
            'startDate' => ['required', 'date'],
            'endDate' => ['nullable', 'date', 'after_or_equal:startDate'],
            'assignmentId' => ['nullable', 'string', 'exists:assignments,uuid'],
            'taskId' => ['nullable', 'string', 'exists:tasks,uuid'],
            'userId' => ['nullable', 'string', 'exists:users,uuid'],
            'status' => ['nullable', Rule::in(CalendarEventStatus::values())],
        ];
    }
}
