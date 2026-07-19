<?php

declare(strict_types=1);

namespace App\Services\Assignments;

use App\Enums\AssignmentEventType;
use App\Enums\AssignmentPriority;
use App\Enums\AssignmentStatus;
use App\Enums\Role;
use App\Exceptions\DomainRuleException;
use App\Exceptions\InvalidAssignmentStateException;
use App\Models\Assignment;
use App\Models\User;
use App\Notifications\AssignmentActivityNotification;
use App\Repositories\Contracts\AssignmentRepositoryInterface;
use App\Repositories\Contracts\UserRepositoryInterface;
use Illuminate\Support\Facades\DB;

/**
 * The assignment workflow — ALL state transitions live here and nowhere else.
 * Every action: (1) validates the actor's part in this order, (2) validates
 * the transition against the AssignmentStatus state machine, (3) mutates and
 * records a timeline event inside one transaction.
 */
final class AssignmentService
{
    public function __construct(
        private readonly AssignmentRepositoryInterface $assignments,
        private readonly UserRepositoryInterface $users,
    ) {}

    /**
     * Client submits an assignment. Optional academic fields are persisted to
     * their own columns so admin/PM panels can search, filter, and report.
     *
     * @param  array<string, mixed>  $data
     */
    public function create(User $client, array $data): Assignment
    {
        return DB::transaction(function () use ($client, $data): Assignment {
            $assignment = $this->assignments->create([
                'title' => $data['title'],
                'subject' => $data['subject'],
                'type' => $data['type'] ?? null,
                'academic_level' => $data['academic_level'] ?? null,
                'course' => $data['course'] ?? null,
                'university' => $data['university'] ?? null,
                'word_count' => $data['word_count'] ?? null,
                'referencing_style' => $data['referencing_style'] ?? null,
                'priority' => $data['priority'] ?? AssignmentPriority::Standard->value,
                'contact_phone' => $data['contact_phone'] ?? null,
                'contact_whatsapp' => $data['contact_whatsapp'] ?? null,
                'description' => $data['description'],
                'deadline' => $data['deadline'],
                'status' => AssignmentStatus::PendingAssignment,
                'client_id' => $client->getKey(),
            ]);

            $this->record($assignment, $client, AssignmentEventType::Created);

            return $assignment;
        });
    }

    /**
     * Admin/PM edits assignment meta fields (priority, notes, word count, etc.).
     * Only fillable columns are applied.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(User $actor, Assignment $assignment, array $data): Assignment
    {
        return DB::transaction(function () use ($actor, $assignment, $data): Assignment {
            $assignment->fill($data);
            $assignment->save();

            $this->record($assignment, $actor, AssignmentEventType::Updated);

            return $assignment->refresh();
        });
    }

    /**
     * Admin/PM sets the project manager on an assignment.
     * The manager must hold the project_manager role.
     */
    public function assignManager(User $actor, Assignment $assignment, string $managerUuid): Assignment
    {
        $manager = $this->users->findByUuid($managerUuid);

        if ($manager === null || !$manager->hasRole(Role::ProjectManager->value)) {
            throw new DomainRuleException('The selected user is not an active project manager.', 'MANAGER_INVALID', 422);
        }

        return DB::transaction(function () use ($actor, $assignment, $manager): Assignment {
            $assignment->fill(['project_manager_id' => $manager->getKey()]);
            $assignment->save();

            $this->record($assignment, $actor, AssignmentEventType::Updated, "Project manager set to {$manager->name}");

            return $assignment->refresh();
        });
    }

    /** PM assigns a writer; PM becomes the order's manager. */
    public function assignWriter(User $actor, Assignment $assignment, string $writerUuid): Assignment
    {
        $writer = $this->users->findByUuid($writerUuid);

        if ($writer === null || !$writer->hasRole(Role::Writer->value)) {
            throw new DomainRuleException('The selected user is not an active writer.', 'WRITER_INVALID', 422);
        }

        if (!$writer->is_active) {
            throw new DomainRuleException('This writer account is inactive.', 'WRITER_INACTIVE', 422);
        }

        return $this->transition(
            $assignment,
            AssignmentStatus::Assigned,
            $actor,
            AssignmentEventType::WriterAssigned,
            "Assigned to {$writer->name}",
            [
                'writer_id' => $writer->getKey(),
                'project_manager_id' => $assignment->project_manager_id ?? $actor->getKey(),
            ],
        );
    }

    /** Writer accepts the assignment. */
    public function accept(User $writer, Assignment $assignment): Assignment
    {
        $this->assertAssignedWriter($writer, $assignment);

        return $this->transition($assignment, AssignmentStatus::InProgress, $writer, AssignmentEventType::WriterAccepted);
    }

    /** Writer declines — the order returns to the PM queue. */
    public function reject(User $writer, Assignment $assignment, ?string $note): Assignment
    {
        $this->assertAssignedWriter($writer, $assignment);

        return $this->transition(
            $assignment,
            AssignmentStatus::PendingAssignment,
            $writer,
            AssignmentEventType::WriterRejected,
            $note,
            ['writer_id' => null],
        );
    }

    /** Writer submits work for PM review (also used to resubmit revisions). */
    public function submit(User $writer, Assignment $assignment, ?string $note): Assignment
    {
        $this->assertAssignedWriter($writer, $assignment);

        return $this->transition($assignment, AssignmentStatus::Submitted, $writer, AssignmentEventType::WorkSubmitted, $note);
    }

    /** PM sends the submission back to the writer with feedback. */
    public function returnToWriter(User $actor, Assignment $assignment, ?string $note): Assignment
    {
        return $this->transition($assignment, AssignmentStatus::InProgress, $actor, AssignmentEventType::ReturnedToWriter, $note);
    }

    /** PM approves and delivers to the client. */
    public function deliver(User $actor, Assignment $assignment, ?string $note): Assignment
    {
        return $this->transition($assignment, AssignmentStatus::Delivered, $actor, AssignmentEventType::Delivered, $note);
    }

    /** Client asks for changes on a delivered order. */
    public function requestRevision(User $client, Assignment $assignment, string $note): Assignment
    {
        $this->assertOwnerClient($client, $assignment);

        return $this->transition($assignment, AssignmentStatus::RevisionRequested, $client, AssignmentEventType::RevisionRequested, $note);
    }

    /** Client approves the delivery — order complete. */
    public function complete(User $client, Assignment $assignment): Assignment
    {
        $this->assertOwnerClient($client, $assignment);

        return $this->transition($assignment, AssignmentStatus::Completed, $client, AssignmentEventType::Completed);
    }

    /**
     * Cancel. Clients may cancel their own order before work starts
     * (pending/assigned); staff may cancel any non-terminal order.
     */
    public function cancel(User $actor, Assignment $assignment, ?string $note): Assignment
    {
        $isStaff = $actor->hasRole(Role::Admin->value) || $actor->hasRole(Role::ProjectManager->value);

        if (!$isStaff) {
            $this->assertOwnerClient($actor, $assignment);

            $cancellableByClient = [AssignmentStatus::PendingAssignment, AssignmentStatus::Assigned];
            if (!in_array($assignment->status, $cancellableByClient, true)) {
                throw new DomainRuleException(
                    'Work has already started — contact your project manager to cancel.',
                    'CANCEL_WINDOW_CLOSED',
                );
            }
        }

        return $this->transition($assignment, AssignmentStatus::Cancelled, $actor, AssignmentEventType::Cancelled, $note);
    }

    /**
     * The workflow actions this actor may take on this order right now.
     * Serialized to the frontend so each role sees exactly its buttons.
     *
     * @return array<int, string>
     */
    public function allowedActionsFor(User $actor, Assignment $assignment): array
    {
        $status = $assignment->status;
        $isAdmin = $actor->hasRole(Role::Admin->value);
        $isPm = $actor->hasRole(Role::ProjectManager->value) || $isAdmin;
        $isAssignedWriter = $assignment->writer_id !== null && $actor->getKey() === $assignment->writer_id;
        $isOwnerClient = $actor->getKey() === $assignment->client_id;

        $actions = [];

        if ($isPm && $status === AssignmentStatus::PendingAssignment) {
            $actions[] = 'assign';
        }
        if ($isAssignedWriter && $status === AssignmentStatus::Assigned) {
            $actions[] = 'accept';
            $actions[] = 'reject';
        }
        if ($isAssignedWriter && in_array($status, [AssignmentStatus::InProgress, AssignmentStatus::RevisionRequested], true)) {
            $actions[] = 'submit';
        }
        if ($isPm && $status === AssignmentStatus::Submitted) {
            $actions[] = 'deliver';
            $actions[] = 'return';
        }
        if ($isOwnerClient && $status === AssignmentStatus::Delivered) {
            $actions[] = 'complete';
            $actions[] = 'request_revision';
        }

        $clientCanCancel = $isOwnerClient
            && in_array($status, [AssignmentStatus::PendingAssignment, AssignmentStatus::Assigned], true);
        if (($isPm && !$status->isTerminal()) || $clientCanCancel) {
            $actions[] = 'cancel';
        }

        return $actions;
    }

    /**
     * Validate + apply one transition atomically, recording its event.
     *
     * @param  array<string, mixed>  $attributes  extra columns to set with the move
     */
    private function transition(
        Assignment $assignment,
        AssignmentStatus $to,
        User $actor,
        AssignmentEventType $event,
        ?string $note = null,
        array $attributes = [],
    ): Assignment {
        if (!$assignment->status->canTransitionTo($to)) {
            throw InvalidAssignmentStateException::transition($assignment->status, $to);
        }

        return DB::transaction(function () use ($assignment, $to, $actor, $event, $note, $attributes): Assignment {
            $assignment->fill([...$attributes, 'status' => $to]);
            $assignment->save();

            $this->record($assignment, $actor, $event, $note);
            $this->notify($assignment->refresh(), $event, $actor);

            return $assignment->refresh();
        });
    }

    private function record(Assignment $assignment, User $actor, AssignmentEventType $type, ?string $note = null): void
    {
        $assignment->events()->create([
            'actor_id' => $actor->getKey(),
            'type' => $type,
            'note' => $note,
        ]);
    }

    /**
     * Notify the party who needs to act next on this event (never the actor).
     * Recipient rules mirror the workflow hand-offs.
     */
    private function notify(Assignment $assignment, AssignmentEventType $event, User $actor): void
    {
        $recipients = match ($event) {
            AssignmentEventType::WriterAssigned,
            AssignmentEventType::ReturnedToWriter,
            AssignmentEventType::RevisionRequested => [$assignment->writer],
            AssignmentEventType::WriterAccepted,
            AssignmentEventType::WriterRejected,
            AssignmentEventType::WorkSubmitted => [$assignment->projectManager],
            AssignmentEventType::Delivered => [$assignment->client],
            AssignmentEventType::Completed => [$assignment->writer, $assignment->projectManager],
            AssignmentEventType::Cancelled => [$assignment->writer, $assignment->client, $assignment->projectManager],
            AssignmentEventType::Created,
            AssignmentEventType::Updated,
            AssignmentEventType::AttachmentAdded => [],
        };

        $message = "{$actor->name}: {$event->label()} — {$assignment->title}";

        foreach ($recipients as $recipient) {
            if ($recipient !== null && !$recipient->is($actor)) {
                $recipient->notify(new AssignmentActivityNotification($assignment, $event, $message));
            }
        }
    }

    private function assertAssignedWriter(User $actor, Assignment $assignment): void
    {
        if ($assignment->writer_id === null || $actor->getKey() !== $assignment->writer_id) {
            throw new DomainRuleException('You are not the writer on this order.', 'NOT_ASSIGNED_WRITER', 403);
        }
    }

    private function assertOwnerClient(User $actor, Assignment $assignment): void
    {
        if ($actor->getKey() !== $assignment->client_id) {
            throw new DomainRuleException('This order belongs to another client.', 'NOT_ORDER_OWNER', 403);
        }
    }
}
