<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;
use Throwable;

/** A Gmail API call or OAuth token exchange failed. */
final class GmailException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly ?string $reason = null,
        public readonly int $status = 0,
        ?Throwable $previous = null,
    ) {
        parent::__construct($message, 0, $previous);
    }

    /**
     * Auth problems need a human to re-consent or re-grant delegation, so the
     * sync command surfaces them differently from transient API errors.
     */
    public function isAuthFailure(): bool
    {
        return in_array($this->status, [401, 403], true);
    }
}
