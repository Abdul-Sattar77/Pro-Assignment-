<?php

declare(strict_types=1);

namespace App\Services\Users;

use App\Enums\Role;
use App\Exceptions\DomainRuleException;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

/**
 * Business logic for user management (admin provisioning). Enforces the
 * invariants the HTTP layer must never own:
 *  - an actor cannot deactivate or delete their own account
 *  - the system always keeps at least one active admin
 */
final class UserService
{
    public function __construct(private readonly UserRepositoryInterface $users) {}

    /**
     * @param  array{search?: string|null, role?: string|null, status?: string|null}  $filters
     * @return LengthAwarePaginator<int, User>
     */
    public function list(array $filters, string $sort, int $perPage): LengthAwarePaginator
    {
        return $this->users->paginate($filters, $sort, min($perPage, 100));
    }

    /**
     * @param  array{name: string, email: string, password: string, roles: array<int, string>, is_active?: bool, availability?: string, expertise?: string|null, notes?: string|null}  $data
     */
    public function create(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $user = $this->users->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'],
                'is_active' => $data['is_active'] ?? true,
                'availability' => $data['availability'] ?? 'available',
                'expertise' => $data['expertise'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            $user->syncRoles($data['roles']);

            return $user;
        });
    }

    /**
     * @param  array{name?: string, email?: string, password?: string|null, roles?: array<int, string>, is_active?: bool, availability?: string, expertise?: string|null, notes?: string|null}  $data
     */
    public function update(User $actor, User $user, array $data): User
    {
        $this->guardSelfDeactivation($actor, $user, $data);
        $this->guardLastAdmin($user, $data);

        return DB::transaction(function () use ($user, $data): User {
            $attributes = array_filter(
                [
                    'name' => $data['name'] ?? null,
                    'email' => $data['email'] ?? null,
                    'password' => $data['password'] ?? null,
                ],
                static fn (mixed $value): bool => $value !== null,
            );

            if (array_key_exists('is_active', $data)) {
                $attributes['is_active'] = $data['is_active'];
            }

            if (array_key_exists('availability', $data)) {
                $attributes['availability'] = $data['availability'];
            }

            if (array_key_exists('expertise', $data)) {
                $attributes['expertise'] = $data['expertise'];
            }

            if (array_key_exists('notes', $data)) {
                $attributes['notes'] = $data['notes'];
            }

            if (array_key_exists('client_flags', $data)) {
                $attributes['client_flags'] = $data['client_flags'];
            } elseif (array_key_exists('clientFlags', $data)) {
                $attributes['client_flags'] = $data['clientFlags'];
            }

            if ($attributes !== []) {
                $user->update($attributes);
            }

            if (isset($data['roles'])) {
                $user->syncRoles($data['roles']);
            }

            return $user->refresh();
        });
    }

    public function delete(User $actor, User $user): void
    {
        if ($actor->is($user)) {
            throw new DomainRuleException(
                'You cannot delete your own account.',
                'CANNOT_DELETE_SELF',
            );
        }

        if ($this->isLastActiveAdmin($user)) {
            throw new DomainRuleException(
                'At least one active admin is required.',
                'LAST_ADMIN_PROTECTED',
            );
        }

        $this->users->delete($user);
    }

    /** @param  array<string, mixed>  $data */
    private function guardSelfDeactivation(User $actor, User $user, array $data): void
    {
        $deactivating = array_key_exists('is_active', $data) && $data['is_active'] === false;

        if ($deactivating && $actor->is($user)) {
            throw new DomainRuleException(
                'You cannot deactivate your own account.',
                'CANNOT_DEACTIVATE_SELF',
            );
        }
    }

    /** @param  array<string, mixed>  $data */
    private function guardLastAdmin(User $user, array $data): void
    {
        if (!$this->isLastActiveAdmin($user)) {
            return;
        }

        $deactivating = array_key_exists('is_active', $data) && $data['is_active'] === false;
        $losingAdminRole = isset($data['roles'])
            && is_array($data['roles'])
            && !in_array(Role::Admin->value, $data['roles'], true);

        if ($deactivating || $losingAdminRole) {
            throw new DomainRuleException(
                'At least one active admin is required.',
                'LAST_ADMIN_PROTECTED',
            );
        }
    }

    private function isLastActiveAdmin(User $user): bool
    {
        return $user->is_active
            && $user->hasRole(Role::Admin->value)
            && $this->users->countActiveWithRoleExcept(Role::Admin->value, (int) $user->getKey()) === 0;
    }
}
