<?php

declare(strict_types=1);

namespace App\Enums;

/** Which way an email travelled. */
enum EmailDirection: string
{
    /** Customer -> the shared mailbox. */
    case Inbound = 'inbound';

    /** Shared mailbox -> customer (sent by a rep, or from Gmail directly). */
    case Outbound = 'outbound';
}
