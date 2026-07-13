<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AssignmentPriority;
use App\Enums\AssignmentStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;

/**
 * @property AssignmentStatus   $status
 * @property AssignmentPriority $priority
 * @property Carbon             $deadline
 * @property int|null           $word_count
 * @property string|null        $notes
 * @property float              $client_price
 * @property float              $writer_cost
 * @property float              $discount
 * @property float              $net_profit
 */
#[Fillable(['title', 'subject', 'description', 'deadline', 'status', 'priority', 'word_count', 'notes', 'client_price', 'writer_cost', 'discount', 'net_profit', 'client_id', 'project_manager_id', 'writer_id'])]
class Assignment extends Model
{
    use HasUuid;
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'deadline'     => 'datetime',
            'status'       => AssignmentStatus::class,
            'priority'     => AssignmentPriority::class,
            'word_count'   => 'integer',
            'client_price' => 'decimal:2',
            'writer_cost'  => 'decimal:2',
            'discount'     => 'decimal:2',
            'net_profit'   => 'decimal:2',
        ];
    }

    /** @return BelongsTo<User, $this> */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    /** @return BelongsTo<User, $this> */
    public function projectManager(): BelongsTo
    {
        return $this->belongsTo(User::class, 'project_manager_id');
    }

    /** @return BelongsTo<User, $this> */
    public function writer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'writer_id');
    }

    /** @return HasMany<AssignmentEvent, $this> */
    public function events(): HasMany
    {
        return $this->hasMany(AssignmentEvent::class)->latest('id');
    }

    /** @return HasMany<AssignmentAttachment, $this> */
    public function attachments(): HasMany
    {
        return $this->hasMany(AssignmentAttachment::class)->latest('id');
    }
}
