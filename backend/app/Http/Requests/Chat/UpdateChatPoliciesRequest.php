<?php

declare(strict_types=1);

namespace App\Http\Requests\Chat;

use App\Enums\Role;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateChatPoliciesRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var User|null $user */
        $user = $this->user();

        return $user !== null && $user->hasRole(Role::Admin->value);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $roles = [
            Role::Admin->value,
            Role::ProjectManager->value,
            Role::Writer->value,
            Role::Client->value,
        ];

        return [
            'policies' => ['required', 'array'],
            'policies.*.role_a' => ['required', 'string', Rule::in($roles)],
            'policies.*.role_b' => ['required', 'string', Rule::in($roles)],
            'policies.*.allowed' => ['required', 'boolean'],
        ];
    }
}
