<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\Invoice;
use App\Models\User;

final class InvoicePolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('finance.view');
    }

    public function view(User $actor, Invoice $invoice): bool
    {
        if ($actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value)) {
            return true;
        }

        if ($actor->hasRole(Role::Client->value)) {
            return $invoice->client_id === $actor->getKey();
        }

        return false;
    }

    public function create(User $actor): bool
    {
        return $actor->can('invoices.manage');
    }

    public function update(User $actor, Invoice $invoice): bool
    {
        return $actor->can('invoices.manage');
    }

    public function delete(User $actor, Invoice $invoice): bool
    {
        return $actor->can('invoices.manage');
    }
}
