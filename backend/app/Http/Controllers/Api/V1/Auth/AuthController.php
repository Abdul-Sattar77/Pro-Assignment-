<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Auth\AuthService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * Sanctum cookie-based SPA authentication endpoints. Thin controller:
 * validate → delegate → return a resource. Business logic is in AuthService;
 * credential/session handling is the HTTP layer's responsibility.
 */
final class AuthController extends Controller
{
    public function __construct(private readonly AuthService $auth) {}

    public function register(RegisterRequest $request): JsonResponse
    {
        /** @var array{name: string, email: string, password: string, university: string, department: string, study_year: string} $data */
        $data = $request->safe()->only([
            'name', 'email', 'password', 'university', 'department', 'study_year',
        ]);

        $user = $this->auth->register($data);

        Auth::login($user);
        $request->session()->regenerate();

        return ApiResponse::resource(UserResource::make($user->load('roles', 'permissions')), 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        /** @var User $user */
        $user = Auth::user();

        if (!$user->is_active) {
            $this->flushSession($request);

            return ApiResponse::error('ACCOUNT_INACTIVE', 'Your account is inactive. Contact an administrator.', 403);
        }

        return ApiResponse::resource(UserResource::make($user->load('roles', 'permissions')));
    }

    public function logout(Request $request): JsonResponse
    {
        $this->flushSession($request);

        return ApiResponse::noContent();
    }

    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return ApiResponse::resource(UserResource::make($user->load('roles', 'permissions')));
    }

    private function flushSession(Request $request): void
    {
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
    }
}
