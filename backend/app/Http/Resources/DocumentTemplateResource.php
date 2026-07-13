<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\DocumentTemplate;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * DocumentTemplate JSON resource.
 *
 * @mixin DocumentTemplate
 */
final class DocumentTemplateResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'title' => $this->title,
            'category' => $this->category,
            'description' => $this->description,
            'file' => $this->file === null ? null : [
                'id' => $this->file->uuid,
                'originalName' => $this->file->original_name,
                'size' => $this->file->size,
                'humanSize' => $this->file->human_size,
                'mimeType' => $this->file->mime_type,
                'downloadUrl' => $this->file->download_url,
            ],
            'uploader' => $this->uploader === null ? null : [
                'id' => $this->uploader->uuid,
                'name' => $this->uploader->name,
            ],
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
