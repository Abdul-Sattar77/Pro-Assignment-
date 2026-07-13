<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * User JSON contract consumed by the frontend. camelCase keys, uuid as the
 * public id, and flattened role/permission slugs for RBAC gates.
 *
 * @mixin User
 */
final class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'email' => $this->email,
            'isActive' => $this->is_active,
            'availability' => $this->availability,
            'expertise' => $this->expertise,
            'notes' => $this->notes,
            'averageRating' => $this->average_rating,
            'totalEarnings' => $this->total_earnings,
            'roles' => $this->getRoleNames()->values(),
            // Included only when eager-loaded (detail/auth responses) to avoid
            // N+1 permission lookups on list endpoints.
            'permissions' => $this->when(
                $this->relationLoaded('permissions'),
                fn () => $this->getAllPermissions()->pluck('name')->values(),
            ),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
