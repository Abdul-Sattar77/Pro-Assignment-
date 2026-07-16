<?php

declare(strict_types=1);

namespace App\Enums;

/** Kind of a direct-chat message. */
enum ChatMessageType: string
{
    case Text = 'text';
    case File = 'file';
    case Voice = 'voice';
    case Image = 'image';
    case Video = 'video';

    /** @return array<int, string> */
    public static function values(): array
    {
        return array_map(static fn (self $c): string => $c->value, self::cases());
    }

    /** Pick a type from an uploaded file's mime. */
    public static function fromMime(?string $mime): self
    {
        if ($mime === null) {
            return self::File;
        }
        if (str_starts_with($mime, 'image/')) {
            return self::Image;
        }
        if (str_starts_with($mime, 'video/')) {
            return self::Video;
        }
        if (str_starts_with($mime, 'audio/')) {
            return self::Voice;
        }

        return self::File;
    }
}
