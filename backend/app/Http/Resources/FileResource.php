<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\File;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * File metadata contract.
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
        $bytes = (int) ($this->size ?? 0);

        return [
            'id' => $this->uuid,
            'name' => $this->original_name,
            'filename' => $this->original_name,
            'originalName' => $this->original_name,
            'note' => $this->note ?? $this->notes,
            'notes' => $this->notes ?? $this->note,
            'version' => $this->version ?? 1,
            'category' => $this->category?->value ?? 'general',
            'categoryLabel' => $this->category?->label() ?? 'General',
            'mime' => $this->mime ?? 'application/octet-stream',
            'mimeType' => $this->mime ?? 'application/octet-stream',
            'size' => $bytes,
            'humanSize' => $this->formatBytes($bytes),
            'uploadedBy' => $this->whenLoaded('uploader', fn () => $this->uploader?->name),
            'uploader' => $this->whenLoaded('uploader', fn () => $this->uploader ? [
                'id' => $this->uploader->uuid,
                'name' => $this->uploader->name,
                'email' => $this->uploader->email,
            ] : null),
            'assignment' => $this->whenLoaded('assignment', fn () => $this->assignment ? [
                'id' => $this->assignment->uuid,
                'title' => $this->assignment->title,
            ] : null),
            'assignmentId' => $this->whenLoaded('assignment', fn () => $this->assignment?->uuid),
            'assignmentTitle' => $this->whenLoaded('assignment', fn () => $this->assignment?->title),
            'canDelete' => $viewer !== null && $viewer->can('delete', $this->resource),
            'createdAt' => $this->created_at?->toIso8601String() ?? now()->toIso8601String(),
            'uploadedAt' => $this->created_at?->toIso8601String() ?? now()->toIso8601String(),
        ];
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes <= 0) {
            return '0 B';
        }
        $units = ['B', 'KB', 'MB', 'GB'];
        $i = (int) floor(log($bytes, 1024));
        $i = min($i, count($units) - 1);

        return round($bytes / pow(1024, $i), 1) . ' ' . $units[$i];
    }
}
