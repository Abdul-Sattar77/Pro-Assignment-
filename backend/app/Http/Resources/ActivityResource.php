<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\Activitylog\Models\Activity;

/**
 * Activity log resource model transformation.
 *
 * @mixin Activity
 */
final class ActivityResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => (string) $this->id,
            'logName' => $this->log_name,
            'description' => $this->description,
            'subjectType' => $this->subject_type,
            'subjectId' => $this->subject_id,
            'causer' => $this->causer === null ? null : [
                'id' => $this->causer->uuid,
                'name' => $this->causer->name,
                'email' => $this->causer->email,
            ],
            'properties' => $this->properties,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
