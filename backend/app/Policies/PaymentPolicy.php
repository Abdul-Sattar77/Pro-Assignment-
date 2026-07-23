<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\Payment;
use App\Models\User;

final class PaymentPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('finance.view');
    }

    public function view(User $actor, Payment $payment): bool
    {
        if ($actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value)) {
            return true;
        }

        if ($actor->hasRole(Role::Client->value)) {
            return $payment->user_id === $actor->getKey() ||
                ($payment->assignment !== null && $payment->assignment->client_id === $actor->getKey()) ||
                ($payment->invoice !== null && $payment->invoice->client_id === $actor->getKey());
        }

        if ($actor->hasRole(Role::Writer->value)) {
            return $payment->user_id === $actor->getKey();
        }

        return false;
    }

    public function create(User $actor): bool
    {
        // Clients and writers hold finance.view (to SEE their own finances) but
        // must not be able to record payments against arbitrary users/invoices.
        return $actor->hasRole(Role::Admin->value)
            || $actor->can('finance.manage')
            || $actor->can('payments.create');
    }

    public function update(User $actor, Payment $payment): bool
    {
        return $actor->hasRole(Role::Admin->value);
    }

    public function delete(User $actor, Payment $payment): bool
    {
        return $actor->hasRole(Role::Admin->value);
    }

    public function verify(User $actor): bool
    {
        return $actor->hasRole(Role::Admin->value) || $actor->can('payments.verify');
    }
}
