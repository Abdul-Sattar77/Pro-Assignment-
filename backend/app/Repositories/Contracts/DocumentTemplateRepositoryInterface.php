<?php

declare(strict_types=1);

namespace App\Repositories\Contracts;

use App\Models\DocumentTemplate;
use Illuminate\Pagination\LengthAwarePaginator;

interface DocumentTemplateRepositoryInterface
{
    public function findByUuid(string $uuid): ?DocumentTemplate;

    public function create(array $data): DocumentTemplate;

    public function update(DocumentTemplate $template, array $data): DocumentTemplate;

    public function delete(DocumentTemplate $template): void;

    public function getFiltered(array $filters, int $perPage = 15): LengthAwarePaginator;
}
