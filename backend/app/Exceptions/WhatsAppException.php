<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;
use Throwable;

/**
 * A Graph API call was rejected. Carries Meta's own error code so callers can
 * distinguish a re-engagement-window rejection (131047) from a genuine fault
 * and surface the right message to the rep.
 */
final class WhatsAppException extends RuntimeException
{
    /** Meta: "Message failed to send because more than 24 hours have passed". */
    public const RE_ENGAGEMENT_REQUIRED = '131047';

    public function __construct(
        string $message,
        public readonly ?string $errorCode = null,
        public readonly int $status = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    /** Did Meta reject this because the 24h service window has closed? */
    public function requiresTemplate(): bool
    {
        return $this->errorCode === self::RE_ENGAGEMENT_REQUIRED;
    }
}
