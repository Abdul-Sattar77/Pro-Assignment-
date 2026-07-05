<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\User;

/**
 * Data-access contract for users. Narrows the single-model return types to User
 * (covariant). `all()` keeps the base Collection<int, Model> type — Eloquent's
 * Collection is invariant in its element type, so it cannot be narrowed.
 */
interface UserRepositoryInterface extends RepositoryInterface
{
    public function find(int|string $id): ?User;

    public function findByUuid(string $uuid): ?User;

    /** @param  array<string, mixed>  $data */
    public function create(array $data): User;

    public function findByEmail(string $email): ?User;
}
