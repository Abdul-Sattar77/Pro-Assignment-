<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Base data-access contract. Services depend on repository interfaces (never on
 * Eloquent directly) so the domain stays testable and the persistence layer
 * swappable. Concrete contracts (e.g. UserRepositoryInterface) narrow these
 * return types to their model. Bindings live in RepositoryServiceProvider.
 */
interface RepositoryInterface
{
    public function find(int|string $id): ?Model;

    public function findByUuid(string $uuid): ?Model;

    /** @return Collection<int, Model> */
    public function all(): Collection;

    /** @param  array<string, mixed>  $data */
    public function create(array $data): Model;

    /** @param  array<string, mixed>  $data */
    public function update(Model $model, array $data): Model;

    public function delete(Model $model): bool;
}
