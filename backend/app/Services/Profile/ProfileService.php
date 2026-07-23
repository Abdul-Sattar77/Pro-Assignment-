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

    public function getStats(User $user): array
    {
        $userId = $user->getKey();

        $completedAssignments = \App\Models\Assignment::query()
            ->where(function ($q) use ($userId): void {
                $q->where('client_id', $userId)
                    ->orWhere('writer_id', $userId)
                    ->orWhere('project_manager_id', $userId);
            })
            ->where('status', \App\Enums\AssignmentStatus::Completed->value)
            ->count();

        $inProgressAssignments = \App\Models\Assignment::query()
            ->where(function ($q) use ($userId): void {
                $q->where('client_id', $userId)
                    ->orWhere('writer_id', $userId)
                    ->orWhere('project_manager_id', $userId);
            })
            ->whereIn('status', [
                \App\Enums\AssignmentStatus::InProgress->value,
                \App\Enums\AssignmentStatus::Assigned->value,
            ])
            ->count();

        $totalLeads = \App\Models\Lead::query()->count();
        $convertedLeads = \App\Models\Lead::query()->where('status', 'converted')->count();
        $filesManaged = \App\Models\File::query()->where('uploaded_by', $userId)->count();
        $messagesExchanged = \App\Models\ChatMessage::query()->where('sender_id', $userId)->count();

        $earnedSum = (float) \App\Models\Payment::query()
            ->where('user_id', $userId)
            ->where('status', \App\Enums\PaymentStatus::Verified->value)
            ->sum('amount');

        $avgRating = (float) (\App\Models\WriterRating::query()->where('writer_id', $userId)->avg('overall_rating') ?? 5.0);

        return [
            'assignmentsCompleted' => $completedAssignments,
            'assignmentsInProgress' => $inProgressAssignments,
            'totalEarned' => config('finance.currency', 'PKR') . ' ' . number_format($earnedSum),
            'avgRating' => round($avgRating, 1),
            'responseTime' => '< 2 hrs',
            'memberSince' => $user->created_at?->format('F Y') ?? 'January 2026',
            'totalLeads' => $totalLeads,
            'convertedLeads' => $convertedLeads,
            'filesManaged' => $filesManaged,
            'messagesExchanged' => $messagesExchanged,
        ];
    }
}
