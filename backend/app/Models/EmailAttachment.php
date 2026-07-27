<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A file attached to an email, mirrored onto the private disk.
 *
 * Kept in its own table because a single email can carry many attachments —
 * unlike a WhatsApp message, which carries at most one.
 *
 * @property int $id
 * @property string $uuid
 * @property string|null $gmail_attachment_id
 * @property string|null $filename
 * @property string|null $mime_type
 * @property int|null $size
 * @property string|null $disk
 * @property string|null $path
 */
#[Fillable([
    'message_id', 'gmail_attachment_id', 'filename',
    'mime_type', 'size', 'disk', 'path',
])]
class EmailAttachment extends Model
{
    use HasUuid;

    protected $table = 'email_attachments';

    protected function casts(): array
    {
        return ['size' => 'integer'];
    }

    /** @return BelongsTo<EmailMessage, $this> */
    public function message(): BelongsTo
    {
        return $this->belongsTo(EmailMessage::class, 'message_id');
    }

    /** Was the binary successfully mirrored, or only its metadata recorded? */
    public function isStored(): bool
    {
        return $this->path !== null && $this->disk !== null;
    }
}
