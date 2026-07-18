<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property string $uuid
 * @property int|null $assignment_id
 * @property int|null $invoice_id
 * @property int|null $user_id
 * @property float $amount
 * @property string $payment_method
 * @property PaymentType $payment_type
 * @property int|null $proof_file_id
 * @property PaymentStatus $status
 * @property Carbon|null $verified_at
 * @property int|null $verified_by
 * @property string|null $notes
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property Carbon|null $deleted_at
 */
#[Fillable(['assignment_id', 'invoice_id', 'user_id', 'amount', 'payment_method', 'payment_type', 'proof_file_id', 'status', 'verified_at', 'verified_by', 'notes'])]
class Payment extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'payment_type' => PaymentType::class,
            'status' => PaymentStatus::class,
            'verified_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Assignment, $this> */
    public function assignment(): BelongsTo
    {
        return $this->belongsTo(Assignment::class, 'assignment_id');
    }

    /** @return BelongsTo<Invoice, $this> */
    public function invoice(): BelongsTo
    {
        return $this->belongsTo(Invoice::class, 'invoice_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** @return BelongsTo<File, $this> */
    public function proofFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'proof_file_id');
    }

    /** @return BelongsTo<User, $this> */
    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /** Audit trail logging. */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['assignment_id', 'invoice_id', 'user_id', 'amount', 'payment_method', 'payment_type', 'proof_file_id', 'status', 'verified_at', 'verified_by', 'notes'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('payment');
    }
}
