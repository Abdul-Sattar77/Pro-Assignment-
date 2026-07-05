<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * The assignment workflow state machine — single source of truth for allowed
 * transitions. Services MUST check canTransitionTo() before any status change
 * (docs/architecture/02-system-architecture.md §2, approved workflow).
 *
 * pending_assignment → assigned → in_progress → submitted → delivered → completed
 *          ↑              │ (reject)               │ (return)   │
 *          └──────────────┘          in_progress ←─┘            └→ revision_requested → submitted
 */
enum AssignmentStatus: string
{
    case PendingAssignment = 'pending_assignment';
    case Assigned = 'assigned';
    case InProgress = 'in_progress';
    case Submitted = 'submitted';
    case Delivered = 'delivered';
    case RevisionRequested = 'revision_requested';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    /**
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::PendingAssignment => [self::Assigned, self::Cancelled],
            self::Assigned => [self::InProgress, self::PendingAssignment, self::Cancelled],
            self::InProgress => [self::Submitted, self::Cancelled],
            self::Submitted => [self::Delivered, self::InProgress, self::Cancelled],
            self::Delivered => [self::Completed, self::RevisionRequested],
            self::RevisionRequested => [self::Submitted, self::Cancelled],
            self::Completed, self::Cancelled => [],
        };
    }

    public function canTransitionTo(self $target): bool
    {
        return in_array($target, $this->allowedTransitions(), true);
    }

    public function isTerminal(): bool
    {
        return $this->allowedTransitions() === [];
    }

    public function label(): string
    {
        return match ($this) {
            self::PendingAssignment => 'Awaiting assignment',
            self::Assigned => 'Writer assigned',
            self::InProgress => 'In progress',
            self::Submitted => 'Submitted for review',
            self::Delivered => 'Delivered to client',
            self::RevisionRequested => 'Revision requested',
            self::Completed => 'Completed',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $status): string => $status->value, self::cases());
    }
}
