<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Calendar event type classifications.
 */
enum CalendarEventType: string
{
    case AssignmentDeadline = 'assignment_deadline';
    case WriterDeadline = 'writer_deadline';
    case PaymentDue = 'payment_due';
    case Meeting = 'meeting';
    case Custom = 'custom';

    public function label(): string
    {
        return match ($this) {
            self::AssignmentDeadline => 'Assignment Deadline',
            self::WriterDeadline => 'Writer Deadline',
            self::PaymentDue => 'Payment Due',
            self::Meeting => 'Meeting',
            self::Custom => 'Custom',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $type): string => $type->value, self::cases());
    }
}
