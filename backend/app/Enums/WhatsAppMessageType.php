<?php

declare(strict_types=1);

namespace App\Enums;

/**
 * Message payload kinds the inbox understands. Mirrors Meta's `type` field;
 * anything Meta sends that is not listed here is stored as `Unsupported` with
 * the raw envelope kept in `payload`, so nothing is ever silently dropped.
 */
enum WhatsAppMessageType: string
{
    case Text = 'text';
    case Image = 'image';
    case Document = 'document';
    case Audio = 'audio';
    case Video = 'video';
    case Sticker = 'sticker';
    case Location = 'location';
    case Contacts = 'contacts';
    case Template = 'template';
    case System = 'system';
    case Unsupported = 'unsupported';

    /** Map a raw Meta `type` string onto the enum, never throwing. */
    public static function fromMeta(?string $type): self
    {
        return self::tryFrom((string) $type) ?? self::Unsupported;
    }

    /** Does this kind carry a downloadable media object? */
    public function hasMedia(): bool
    {
        return in_array($this, [
            self::Image, self::Document, self::Audio, self::Video, self::Sticker,
        ], true);
    }

    /** Short preview label used in conversation lists. */
    public function previewLabel(): string
    {
        return match ($this) {
            self::Text => '',
            self::Image => '📷 Photo',
            self::Document => '📄 Document',
            self::Audio => '🎤 Voice message',
            self::Video => '🎬 Video',
            self::Sticker => '🌟 Sticker',
            self::Location => '📍 Location',
            self::Contacts => '👤 Contact',
            self::Template => '',
            self::System => 'System update',
            self::Unsupported => 'Unsupported message',
        };
    }
}
