<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;

/**
 * Eloquent implementation of the user data-access contract. Uses User::query()
 * directly so the User type flows through to every single-model return.
 */
final class UserRepository extends BaseRepository implements UserRepositoryInterface
{
    public function __construct(User $model)
    {
        parent::__construct($model);
    }

    public function find(int|string $id): ?User
    {
        return User::query()->find($id);
    }

    public function findByUuid(string $uuid): ?User
    {
        return User::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): User
    {
        return User::query()->create($data);
    }

    public function findByEmail(string $email): ?User
    {
        return User::query()->where('email', $email)->first();
    }
}
