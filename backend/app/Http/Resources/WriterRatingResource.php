<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\WriterRating;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * WriterRating JSON resource representation.
 *
 * @mixin WriterRating
 */
final class WriterRatingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'writerId' => $this->writer?->uuid,
            'writerName' => $this->writer?->name,
            'clientName' => $this->client?->name,
            'assignmentId' => $this->assignment?->uuid,
            'assignmentTitle' => $this->assignment?->title,
            'quality' => $this->quality,
            'timeliness' => $this->timeliness,
            'communication' => $this->communication,
            'overallRating' => (float) $this->overall_rating,
            'comment' => $this->comment,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
