<?php

declare(strict_types=1);

namespace App\Policies;

use App\Enums\Role;
use App\Models\Invoice;
use App\Models\User;

/**
 * Authorization for invoices. Staff manage; clients view + pay their own.
 */
final class InvoicePolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('finance.view');
    }

    public function view(User $actor, Invoice $invoice): bool
    {
        return $this->isStaff($actor) || $actor->getKey() === $invoice->client_id;
    }

    public function manage(User $actor): bool
    {
        return $actor->can('invoices.manage');
    }

    public function verify(User $actor, Invoice $invoice): bool
    {
        return $actor->can('payments.verify');
    }

    public function pay(User $actor, Invoice $invoice): bool
    {
        return $actor->getKey() === $invoice->client_id;
    }

    private function isStaff(User $actor): bool
    {
        return $actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value);
    }
}
