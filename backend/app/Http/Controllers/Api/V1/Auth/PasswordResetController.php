<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

/**
 * Forgot / reset password (public). Uses Laravel's password broker. Responses
 * never reveal whether an email exists (avoids account enumeration). The reset
 * link points at the frontend (see AppServiceProvider::boot).
 */
final class PasswordResetController extends Controller
{
    public function forgot(ForgotPasswordRequest $request): JsonResponse
    {
        Password::sendResetLink($request->only('email'));

        return ApiResponse::item([
            'message' => 'If an account exists for that email, a reset link is on its way.',
        ]);
    }

    public function reset(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                // Hashed by the model's 'password' => 'hashed' cast.
                $user->update(['password' => $password]);
            },
        );

        if ($status !== Password::PasswordReset) {
            return ApiResponse::error(
                'RESET_FAILED',
                'This reset link is invalid or has expired. Please request a new one.',
                422,
            );
        }

        return ApiResponse::item([
            'message' => 'Your password has been reset. You can now sign in.',
        ]);
    }
}
