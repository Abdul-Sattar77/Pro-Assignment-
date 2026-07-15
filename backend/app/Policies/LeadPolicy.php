<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\Lead;
use App\Models\User;

/**
 * Authorization policies for Lead resource access.
 */
final class LeadPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('leads.view');
    }

    public function view(User $actor, Lead $lead): bool
    {
        return $actor->can('leads.view');
    }

    public function create(User $actor): bool
    {
        return $actor->can('leads.manage');
    }

    public function update(User $actor, Lead $lead): bool
    {
        return $actor->can('leads.manage');
    }

    public function delete(User $actor, Lead $lead): bool
    {
        return $actor->can('leads.manage');
    }
}
