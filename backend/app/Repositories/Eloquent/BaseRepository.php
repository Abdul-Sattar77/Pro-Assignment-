<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Repositories\Contracts\RepositoryInterface;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;

/**
 * Shared Eloquent implementation of common data-access operations. Concrete
 * repositories extend this, bind a model in their constructor, and narrow the
 * return types to their model via a specific contract. No business logic here.
 *
 * NOTE (future multi-tenancy): the single place to inject a tenant scope is a
 * global scope on the model or the query() hook here — see docs/architecture/03.
 */
abstract class BaseRepository implements RepositoryInterface
{
    public function __construct(protected Model $model) {}

    /**
     * Fresh query builder for this repository's model. Single hook point for
     * cross-cutting query concerns (e.g. a future tenant scope).
     *
     * @return Builder<Model>
     */
    protected function query(): Builder
    {
        return $this->model->newQuery();
    }

    public function find(int|string $id): ?Model
    {
        return $this->query()->find($id);
    }

    public function findByUuid(string $uuid): ?Model
    {
        return $this->query()->where('uuid', $uuid)->first();
    }

    /** @return Collection<int, Model> */
    public function all(): Collection
    {
        return $this->query()->get();
    }

    public function create(array $data): Model
    {
        return $this->query()->create($data);
    }

    public function update(Model $model, array $data): Model
    {
        $model->update($data);

        return $model->refresh();
    }

    public function delete(Model $model): bool
    {
        return (bool) $model->delete();
    }
}
