<?php

declare(strict_types=1);

namespace App\Models;

use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Model;

/**
 * A public enquiry submitted from the landing page contact/inquiry form.
 */
final class Inquiry extends Model
{
    use HasUuid;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'is_handled',
    ];

    protected function casts(): array
    {
        return ['is_handled' => 'boolean'];
    }
}
