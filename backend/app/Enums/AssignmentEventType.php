<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Timeline event types recorded on every workflow action — powers the
 * assignment Activity Timeline and (later) notifications.
 */
enum AssignmentEventType: string
{
    case Created = 'created';
    case WriterAssigned = 'writer_assigned';
    case WriterAccepted = 'writer_accepted';
    case WriterRejected = 'writer_rejected';
    case WorkSubmitted = 'work_submitted';
    case ReturnedToWriter = 'returned_to_writer';
    case Delivered = 'delivered';
    case RevisionRequested = 'revision_requested';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Created => 'Order placed',
            self::WriterAssigned => 'Writer assigned',
            self::WriterAccepted => 'Writer accepted',
            self::WriterRejected => 'Writer declined',
            self::WorkSubmitted => 'Work submitted',
            self::ReturnedToWriter => 'Returned to writer',
            self::Delivered => 'Delivered to client',
            self::RevisionRequested => 'Revision requested',
            self::Completed => 'Approved & completed',
            self::Cancelled => 'Cancelled',
        };
    }
}
