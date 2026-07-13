<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Lead source channels.
 */
enum LeadSource: string
{
    case Instagram = 'instagram';
    case WhatsApp = 'whatsapp';
    case Referral = 'referral';
    case Other = 'other';

    public function label(): string
    {
        return match ($this) {
            self::Instagram => 'Instagram',
            self::WhatsApp => 'WhatsApp',
            self::Referral => 'Referral',
            self::Other => 'Other',
        };
    }

    /**
     * @return array<int, string>
     */
    public static function values(): array
    {
        return array_map(static fn (self $source): string => $source->value, self::cases());
    }
}
