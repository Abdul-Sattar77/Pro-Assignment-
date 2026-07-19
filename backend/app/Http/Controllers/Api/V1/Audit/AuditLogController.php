<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Audit;

use App\Http\Controllers\Controller;
use App\Http\Resources\ActivityResource;
use App\Repositories\Contracts\ActivityRepositoryInterface;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

final class AuditLogController extends Controller
{
    public function __construct(
        private readonly ActivityRepositoryInterface $repository,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('admin')) {
            return ApiResponse::error('FORBIDDEN', 'Only administrators have access to view audit logs.', 403);
        }

        $filters = [
            'log_name' => $request->query('log_name'),
            'causer_id' => $request->query('causer_id'),
            'search' => $request->query('search'),
        ];

        $perPage = $request->query('per_page', '30');
        $paginator = $this->repository->getFiltered(
            $filters,
            is_numeric($perPage) ? (int) $perPage : 30,
        );

        return ApiResponse::collection(
            ActivityResource::collection($paginator->getCollection()),
            $paginator,
        );
    }
}
