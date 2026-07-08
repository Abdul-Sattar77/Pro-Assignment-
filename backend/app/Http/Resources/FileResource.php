<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\File;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * File metadata contract. The binary is fetched separately from the
 * authorized download endpoint (never a public URL). `canDelete` reflects the
 * current viewer's policy so the UI shows the remove control only when valid.
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
        /** @var User|null $viewer */
        $viewer = $request->user();

        return [
            'id' => $this->uuid,
            'name' => $this->original_name,
            'category' => $this->category->value,
            'categoryLabel' => $this->category->label(),
            'mime' => $this->mime,
            'size' => $this->size,
            'uploadedBy' => $this->whenLoaded('uploader', fn () => $this->uploader?->name),
            'canDelete' => $viewer !== null && $viewer->can('delete', $this->resource),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
