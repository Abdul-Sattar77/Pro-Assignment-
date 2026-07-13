<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\File;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

/**
 * Interface FileRepositoryInterface.
 *
 * @extends RepositoryInterface
 */
interface FileRepositoryInterface extends RepositoryInterface
{
    public function find(int|string $id): ?File;

    public function findByUuid(string $uuid): ?File;

    public function create(array $data): File;

    /**
     * Get files matching filters scoped strictly by roles.
     *
     * @param  array<string, mixed>  $filters
     * @return Collection<int, File>
     */
    public function getFilteredFor(User $actor, array $filters): Collection;
}
