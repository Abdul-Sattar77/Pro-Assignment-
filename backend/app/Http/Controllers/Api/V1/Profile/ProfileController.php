<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Profile;

use App\Http\Controllers\Controller;
use App\Http\Requests\Profile\ChangePasswordRequest;
use App\Http\Requests\Profile\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\Profile\ProfileService;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The authenticated user's own account — profile + password. Thin.
 */
final class ProfileController extends Controller
{
    public function __construct(private readonly ProfileService $service) {}

    public function stats(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return ApiResponse::item($this->service->getStats($user));
    }

    public function update(UpdateProfileRequest $request): JsonResponse
    {
        /** @var array{name: string, email: string, university?: string|null, department?: string|null, study_year?: string|null} $data */
        $data = $request->validated();

        /** @var User $user */
        $user = $request->user();

        $updated = $this->service->updateProfile($user, $data);

        return ApiResponse::resource(UserResource::make($updated->load('roles', 'permissions')));
    }

    public function changePassword(ChangePasswordRequest $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        /** @var string $password */
        $password = $request->validated('password');

        $this->service->changePassword($user, $password);

        return ApiResponse::item(['message' => 'Password updated.']);
    }
}
