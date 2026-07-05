<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Enums\Role;
use App\Models\User;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;

/**
 * Business logic for identity operations. Registration and account creation
 * live here (not in controllers). Session/guard interaction (login/logout)
 * stays in the HTTP layer as it is a presentation/session concern.
 */
final class AuthService
{
    public function __construct(private readonly UserRepositoryInterface $users) {}

    /**
     * Register a new self-service account. New sign-ups default to the Client
     * role; PM/Writer/Admin accounts are provisioned by an admin.
     *
     * @param  array{name: string, email: string, password: string}  $data
     */
    public function register(array $data): User
    {
        return DB::transaction(function () use ($data): User {
            $user = $this->users->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => $data['password'], // hashed via the model cast
            ]);

            $user->assignRole(Role::Client->value);

            return $user;
        });
    }
}
