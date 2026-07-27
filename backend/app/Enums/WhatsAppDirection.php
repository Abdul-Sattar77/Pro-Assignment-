<?php

declare(strict_types=1);

namespace App\Enums;

/** Which way a WhatsApp message travelled. */
enum WhatsAppDirection: string
{
    /** Customer -> portal (opens/refreshes the free 24h service window). */
    case Inbound = 'inbound';

    /** Portal -> customer (sent by a sales rep or admin). */
    case Outbound = 'outbound';
}
