<?php

declare(strict_types=1);

namespace App\Exceptions;

/**
 * General-purpose domain rule violation with a caller-supplied machine code.
 * Use for one-off business rules; create a dedicated subclass when a rule
 * family grows (e.g. assignment state transitions).
 */
final class DomainRuleException extends DomainException {}
