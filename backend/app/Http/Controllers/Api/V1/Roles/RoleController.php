<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Roles;

use App\Http\Controllers\Controller;
use App\Http\Resources\PermissionResource;
use App\Http\Resources\RoleResource;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

final class RoleController extends Controller
{
    private const CORE_ROLES = [
        'admin',
        'project_manager',
        'writer',
        'client',
    ];

    public function index(Request $request): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('admin')) {
            return ApiResponse::error('FORBIDDEN', 'Only administrators can view roles.', 403);
        }

        $roles = Role::query()->with('permissions')->get();

        return ApiResponse::resource(RoleResource::collection($roles));
    }

    public function permissions(Request $request): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('admin')) {
            return ApiResponse::error('FORBIDDEN', 'Only administrators can view permissions catalog.', 403);
        }

        $permissions = Permission::all();

        return ApiResponse::resource(PermissionResource::collection($permissions));
    }

    public function store(Request $request): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('admin')) {
            return ApiResponse::error('FORBIDDEN', 'Only administrators can create roles.', 403);
        }

        $data = $request->validate([
            'name' => [
                'required',
                'string',
                'max:255',
                'unique:roles,name',
                Rule::notIn(self::CORE_ROLES),
            ],
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ]);

        $role = Role::create([
            'name' => strtolower($data['name']),
            'guard_name' => 'web',
        ]);

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return ApiResponse::resource(RoleResource::make($role->load('permissions')), 201);
    }

    public function show(Request $request, Role $role): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('admin')) {
            return ApiResponse::error('FORBIDDEN', 'Only administrators can view roles details.', 403);
        }

        return ApiResponse::resource(RoleResource::make($role->load('permissions')));
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('admin')) {
            return ApiResponse::error('FORBIDDEN', 'Only administrators can update roles.', 403);
        }

        $isCore = in_array($role->name, self::CORE_ROLES, true);

        $rules = [
            'permissions' => ['nullable', 'array'],
            'permissions.*' => ['string', 'exists:permissions,name'],
        ];

        // Custom roles can be renamed
        if (!$isCore) {
            $rules['name'] = [
                'required',
                'string',
                'max:255',
                Rule::unique('roles', 'name')->ignore($role->id),
                Rule::notIn(self::CORE_ROLES),
            ];
        }

        $data = $request->validate($rules);

        if (!$isCore && isset($data['name'])) {
            $role->name = strtolower($data['name']);
            $role->save();
        }

        if (isset($data['permissions'])) {
            $role->syncPermissions($data['permissions']);
        }

        return ApiResponse::resource(RoleResource::make($role->refresh()->load('permissions')));
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        $actor = $request->user();
        if ($actor === null || !$actor->hasRole('admin')) {
            return ApiResponse::error('FORBIDDEN', 'Only administrators can delete roles.', 403);
        }

        if (in_array($role->name, self::CORE_ROLES, true)) {
            return ApiResponse::error('FORBIDDEN', 'Core system roles cannot be deleted.', 403);
        }

        // Validate that no users are currently assigned to this role
        if ($role->users()->exists()) {
            return ApiResponse::error('ROLE_IN_USE', 'Cannot delete role while it is still assigned to active users.', 400);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted successfully.']);
    }
}
