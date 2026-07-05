<?php

declare(strict_types=1);

namespace App\Exceptions;

use App\Enums\AssignmentStatus;

/**
 * Thrown when a workflow action is attempted in a state that does not allow
 * it. Maps to 409 INVALID_STATE (docs/api/api-standards.md §6).
 */
final class InvalidAssignmentStateException extends DomainException
{
    public static function transition(AssignmentStatus $from, AssignmentStatus $to): self
    {
        return new self(
            sprintf(
                'This order is "%s" and cannot move to "%s".',
                $from->label(),
                $to->label(),
            ),
            'INVALID_STATE',
        );
    }
}
