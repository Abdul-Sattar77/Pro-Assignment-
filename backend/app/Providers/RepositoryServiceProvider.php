<?php

declare(strict_types=1);

namespace App\Providers;

use App\Repositories\Contracts\UserRepositoryInterface;
use App\Repositories\Eloquent\UserRepository;
use Illuminate\Support\ServiceProvider;

/**
 * Binds repository contracts to their Eloquent implementations so services can
 * depend on interfaces (dependency inversion). Add one entry per repository as
 * modules are built — this is the single wiring point for the data layer.
 */
final class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Contract => Implementation.
     *
     * @var array<class-string, class-string>
     */
    public array $bindings = [
        UserRepositoryInterface::class => UserRepository::class,
    ];
}
