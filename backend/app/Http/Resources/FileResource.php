<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * File JSON resource.
 *
 * @mixin File
 */
final class FileResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'filename' => $this->filename,
            'originalName' => $this->original_name,
            'size' => $this->size,
            'humanSize' => $this->human_size,
            'mimeType' => $this->mime_type,
            'downloadUrl' => $this->download_url,
            'createdAt' => $this->created_at?->toIso8601String(),
            'assignment' => $this->whenLoaded('assignment', fn () => $this->assignment === null ? null : [
                'id' => $this->assignment->uuid,
                'title' => $this->assignment->title,
            ]),
            'uploader' => $this->whenLoaded('uploader', fn () => $this->uploader === null ? null : [
                'id' => $this->uploader->uuid,
                'name' => $this->uploader->name,
                'email' => $this->uploader->email,
            ]),
        ];
    }
}
