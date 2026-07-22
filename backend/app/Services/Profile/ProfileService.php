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
     * Partial update — only the keys the request actually sent are written, so
     * a writer saving just their availability never wipes their university, and
     * the full profile form keeps working unchanged.
     *
     * @param  array{name?: string, email?: string, university?: string|null, department?: string|null, study_year?: string|null, availability?: string, expertise?: string|null, writer_profile?: array<string, mixed>|null}  $data
     */
    public function updateProfile(User $user, array $data): User
    {
        $fields = [
            'name', 'email', 'university', 'department', 'study_year',
            'availability', 'expertise', 'writer_profile',
        ];

        $update = array_intersect_key($data, array_flip($fields));

        if ($update !== []) {
            $user->update($update);
        }

        return $user->refresh();
    }

    public function changePassword(User $user, string $newPassword): void
    {
        // Hashed by the model's 'password' => 'hashed' cast.
        $user->update(['password' => $newPassword]);
    }
}
