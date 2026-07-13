<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Users;

use App\Http\Controllers\Controller;
use App\Http\Requests\Users\StoreUserRequest;
use App\Http\Requests\Users\UpdateUserRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Users\UserService;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * User management endpoints (admin provisioning). Thin: authorize → validate →
 * one service call → resource. Route-model binding resolves {user} by uuid.
 */
final class UserController extends Controller
{
    use AuthorizesRequests;

    public function __construct(private readonly UserService $service) {}

    public function index(Request $request): JsonResponse
    {
        if (!$request->user()->can('users.view') && !$request->user()->can('tasks.manage') && !$request->user()->can('assignments.assign')) {
            $this->authorize('viewAny', User::class);
        }

        /** @var array<string, mixed> $filter */
        $filter = (array) $request->query('filter', []);

        $search = $request->query('search');
        $sort = $request->query('sort', '-created_at');
        $perPage = $request->query('per_page', '15');

        $paginator = $this->service->list(
            [
                'search' => is_string($search) ? $search : null,
                'role' => is_string($filter['role'] ?? null) ? $filter['role'] : null,
                'status' => is_string($filter['status'] ?? null) ? $filter['status'] : null,
            ],
            is_string($sort) ? $sort : '-created_at',
            is_numeric($perPage) ? (int) $perPage : 15,
        );

        // Roles are eager-loaded by the repository (paginate → with('roles')).
        return ApiResponse::collection(
            UserResource::collection($paginator->getCollection()),
            $paginator,
        );
    }

    public function store(StoreUserRequest $request): JsonResponse
    {
        /** @var array{name: string, email: string, password: string, roles: array<int, string>, is_active?: bool} $data */
        $data = $request->validated();

        $user = $this->service->create($data);

        return ApiResponse::resource(UserResource::make($user->load('roles', 'permissions')), 201);
    }

    public function show(User $user): JsonResponse
    {
        $this->authorize('view', $user);

        return ApiResponse::resource(UserResource::make($user->load('roles', 'permissions')));
    }

    public function update(UpdateUserRequest $request, User $user): JsonResponse
    {
        /** @var array{name?: string, email?: string, password?: string|null, roles?: array<int, string>, is_active?: bool} $data */
        $data = $request->validated();

        /** @var User $actor */
        $actor = $request->user();

        $updated = $this->service->update($actor, $user, $data);

        return ApiResponse::resource(UserResource::make($updated->load('roles', 'permissions')));
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        $this->authorize('delete', $user);

        /** @var User $actor */
        $actor = $request->user();

        $this->service->delete($actor, $user);

        return ApiResponse::noContent();
    }
}
