<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\User;
use App\Models\WhatsAppContact;

/**
 * Authorization for the WhatsApp inbox.
 *
 * Two tiers: `whatsapp.audit` (admin) sees and acts on every thread;
 * `whatsapp.view` (sales) is scoped to threads they own or that are still
 * unassigned. Nothing here grants a hard delete — that path does not exist.
 */
final class WhatsAppContactPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('whatsapp.view');
    }

    public function view(User $actor, WhatsAppContact $contact): bool
    {
        return $actor->can('whatsapp.view') && $this->isInScope($actor, $contact);
    }

    /** Reply to a thread. */
    public function send(User $actor, WhatsAppContact $contact): bool
    {
        return $actor->can('whatsapp.send') && $this->isInScope($actor, $contact);
    }

    /** Claim a thread, or hand it to another rep. */
    public function assign(User $actor, WhatsAppContact $contact): bool
    {
        return $actor->can('whatsapp.assign') && $this->isInScope($actor, $contact);
    }

    /** Archive is a view-state toggle, not a deletion. */
    public function archive(User $actor, WhatsAppContact $contact): bool
    {
        return $actor->can('whatsapp.send') && $this->isInScope($actor, $contact);
    }

    /**
     * Hide a message from the inbox (soft delete). Admins retain full
     * visibility of anything hidden this way.
     */
    public function hideMessage(User $actor, WhatsAppContact $contact): bool
    {
        return $actor->can('whatsapp.delete') && $this->isInScope($actor, $contact);
    }

    /** Admin oversight: all threads, including hidden messages. */
    public function audit(User $actor): bool
    {
        return $actor->can('whatsapp.audit');
    }

    /**
     * A rep may act on threads assigned to them, plus the unassigned queue
     * (so a new customer message can be picked up by whoever is free).
     * Auditors are unrestricted.
     */
    private function isInScope(User $actor, WhatsAppContact $contact): bool
    {
        if ($actor->can('whatsapp.audit')) {
            return true;
        }

        return $contact->assigned_to === null
            || $contact->assigned_to === $actor->getKey();
    }
}
