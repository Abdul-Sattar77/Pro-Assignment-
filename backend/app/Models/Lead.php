<?php

declare(strict_types=1);

namespace App\Models;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Traits\HasUuid;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Carbon;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property string      $name
 * @property string|null $email
 * @property string|null $phone
 * @property LeadSource  $source
 * @property LeadStatus  $status
 * @property string|null $notes
 * @property string|null $lost_reason
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'email', 'phone', 'source', 'status', 'notes', 'lost_reason'])]
class Lead extends Model
{
    use HasUuid;
    use LogsActivity;
    use SoftDeletes;

    protected function casts(): array
    {
        return [
            'status' => LeadStatus::class,
            'source' => LeadSource::class,
        ];
    }

    /** Audit trail configuration (spatie/activitylog). */
    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['name', 'email', 'phone', 'source', 'status', 'notes', 'lost_reason'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges()
            ->useLogName('lead');
    }
}
