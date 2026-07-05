<?php

declare(strict_types=1);

namespace App\Exceptions;

use RuntimeException;

/**
 * Base class for domain rule violations thrown by services (e.g. an invalid
 * assignment state transition). Mapped centrally to an HTTP status + stable
 * machine error code by the exception handler (docs/api/api-standards.md §6).
 */
abstract class DomainException extends RuntimeException
{
    /**
     * @param  array<string, array<int, string>>  $details
     */
    public function __construct(
        string $message,
        public readonly string $errorCode = 'DOMAIN_ERROR',
        public readonly int $status = 409,
        public readonly array $details = [],
    ) {
        parent::__construct($message);
    }
}
