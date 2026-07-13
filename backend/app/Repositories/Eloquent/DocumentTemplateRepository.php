<?php

declare(strict_types=1);

namespace App\Repositories\Eloquent;

use App\Models\DocumentTemplate;
use App\Repositories\Contracts\DocumentTemplateRepositoryInterface;
use Illuminate\Pagination\LengthAwarePaginator;

final class DocumentTemplateRepository implements DocumentTemplateRepositoryInterface
{
    public function findByUuid(string $uuid): ?DocumentTemplate
    {
        return DocumentTemplate::query()->where('uuid', $uuid)->first();
    }

    public function create(array $data): DocumentTemplate
    {
        return DocumentTemplate::query()->create($data);
    }

    public function delete(DocumentTemplate $template): void
    {
        $template->delete();
    }

    public function getFiltered(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        $query = DocumentTemplate::query()->with(['file', 'uploader']);

        if (isset($filters['category']) && $filters['category'] !== '') {
            $query->where('category', $filters['category']);
        }

        if (isset($filters['search']) && $filters['search'] !== '') {
            $search = '%' . $filters['search'] . '%';
            $query->where(function ($q) use ($search): void {
                $q->where('title', 'like', $search)
                  ->orWhere('description', 'like', $search);
            });
        }

        $sort = $filters['sort'] ?? '-created_at';
        $direction = str_starts_with($sort, '-') ? 'desc' : 'asc';
        $column = ltrim($sort, '-');

        if (in_array($column, ['created_at', 'title', 'category'], true)) {
            $query->orderBy($column, $direction);
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->paginate($perPage);
    }
}
