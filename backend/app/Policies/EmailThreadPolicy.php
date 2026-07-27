<?php

declare(strict_types=1);

namespace App\Policies;

use App\Models\EmailThread;
use App\Models\User;

/**
 * Authorization for the shared email inbox.
 *
 * Two tiers, matching WhatsApp: `email.audit` (admin) sees and acts on every
 * thread; `email.view` (sales) is scoped to threads they own or that are still
 * unassigned. Nothing here grants a hard delete — that path does not exist.
 */
final class EmailThreadPolicy
{
    public function viewAny(User $actor): bool
    {
        return $actor->can('email.view');
    }

    public function view(User $actor, EmailThread $thread): bool
    {
        return $actor->can('email.view') && $this->isInScope($actor, $thread);
    }

    public function send(User $actor, EmailThread $thread): bool
    {
        return $actor->can('email.send') && $this->isInScope($actor, $thread);
    }

    public function assign(User $actor, EmailThread $thread): bool
    {
        return $actor->can('email.assign') && $this->isInScope($actor, $thread);
    }

    /** Archive is a view-state toggle, not a deletion. */
    public function archive(User $actor, EmailThread $thread): bool
    {
        return $actor->can('email.send') && $this->isInScope($actor, $thread);
    }

    /** Hide a message from the inbox (soft delete). Admins still see it. */
    public function hideMessage(User $actor, EmailThread $thread): bool
    {
        return $actor->can('email.delete') && $this->isInScope($actor, $thread);
    }

    /** Admin oversight: all threads, including hidden messages. */
    public function audit(User $actor): bool
    {
        return $actor->can('email.audit');
    }

    /**
     * A rep may act on threads assigned to them, plus the unassigned queue.
     * Auditors are unrestricted.
     */
    private function isInScope(User $actor, EmailThread $thread): bool
    {
        if ($actor->can('email.audit')) {
            return true;
        }

        return $thread->assigned_to === null
            || $thread->assigned_to === $actor->getKey();
    }
}
