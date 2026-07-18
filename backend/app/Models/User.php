<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\PaymentStatus;
use App\Enums\PaymentType;
use App\Traits\HasUuid;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Permission\Traits\HasRoles;

#[Fillable(['name', 'email', 'password', 'is_active', 'university', 'department', 'study_year', 'availability', 'expertise', 'notes'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    use HasApiTokens;

    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use HasRoles;
    use HasUuid;
    use LogsActivity;
    use Notifiable;
    use SoftDeletes;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    /** Audit trail configuration (spatie/activitylog). */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'is_active', 'availability', 'expertise', 'notes'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('user');
    }

    public function writerRatings(): HasMany
    {
        return $this->hasMany(WriterRating::class, 'writer_id');
    }

    public function clientRatings(): HasMany
    {
        return $this->hasMany(WriterRating::class, 'client_id');
    }

    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'client_id');
    }

    public function templates(): HasMany
    {
        return $this->hasMany(DocumentTemplate::class, 'uploaded_by');
    }

    public function getAverageRatingAttribute(): float
    {
        return (float) ($this->writerRatings()->avg('overall_rating') ?? 0.0);
    }

    public function getTotalEarningsAttribute(): float
    {
        return (float) Payment::query()
            ->where('user_id', $this->id)
            ->where('payment_type', PaymentType::WriterPayout->value)
            ->where('status', PaymentStatus::Verified->value)
            ->sum('amount');
    }
}
