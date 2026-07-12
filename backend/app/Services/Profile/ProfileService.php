<?php

declare(strict_types=1);

namespace App\Services\Profile;

use App\Models\User;

/**
 * Business logic for a user's own account — profile details and password.
 * The acting user is always the authenticated user (never someone else).
 */
final class ProfileService
{
    /**
     * @param  array{name: string, email: string, university?: string|null, department?: string|null, study_year?: string|null}  $data
     */
    public function updateProfile(User $user, array $data): User
    {
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
            'university' => $data['university'] ?? null,
            'department' => $data['department'] ?? null,
            'study_year' => $data['study_year'] ?? null,
        ]);

        return $user->refresh();
    }

    public function changePassword(User $user, string $newPassword): void
    {
        // Hashed by the model's 'password' => 'hashed' cast.
        $user->update(['password' => $newPassword]);
    }
}
