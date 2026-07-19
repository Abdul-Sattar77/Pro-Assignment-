<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\AssignmentAttachment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin AssignmentAttachment
 */
final class AssignmentAttachmentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'type' => $this->type,
            'originalName' => $this->original_name,
            'mimeType' => $this->mime_type,
            'size' => $this->size,
            'humanSize' => $this->human_size,
            'url' => $this->url,
            'uploadedBy' => $this->whenLoaded('uploader', fn () => [
                'id' => $this->uploader?->uuid,
                'name' => $this->uploader?->name,
            ]),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
