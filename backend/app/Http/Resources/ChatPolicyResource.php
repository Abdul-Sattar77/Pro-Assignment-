<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ChatPolicy;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ChatPolicy
 */
final class ChatPolicyResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'roleA' => $this->role_a,
            'roleB' => $this->role_b,
            'allowed' => $this->allowed,
            'locked' => $this->locked,
        ];
    }
}
