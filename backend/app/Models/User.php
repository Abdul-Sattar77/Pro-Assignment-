<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\AssignmentStatus;
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

#[Fillable(['name', 'email', 'password', 'is_active', 'university', 'department', 'study_year', 'availability', 'expertise', 'writer_profile', 'notes'])]
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
            'writer_profile' => 'array',
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

    /** @return HasMany<WriterRating, $this> */
    public function writerRatings(): HasMany
    {
        return $this->hasMany(WriterRating::class, 'writer_id');
    }

    /** @return HasMany<WriterRating, $this> */
    public function clientRatings(): HasMany
    {
        return $this->hasMany(WriterRating::class, 'client_id');
    }

    /** @return HasMany<Complaint, $this> */
    public function complaints(): HasMany
    {
        return $this->hasMany(Complaint::class, 'client_id');
    }

    /** @return HasMany<DocumentTemplate, $this> */
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

    /** Number of assignments currently on this writer's plate (active states). */
    public function getCurrentWorkloadAttribute(): int
    {
        return Assignment::query()
            ->where('writer_id', $this->id)
            ->whereIn('status', [
                AssignmentStatus::Assigned->value,
                AssignmentStatus::InProgress->value,
                AssignmentStatus::RevisionRequested->value,
                AssignmentStatus::Submitted->value,
            ])
            ->count();
    }
}
