<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Notifications;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificationResource;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * In-app notifications for the signed-in user. Read-state is per-user; the
 * bell polls unread-count and the panel lists recent items.
 */
final class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $this->actor($request);

        /** @var LengthAwarePaginator<int, DatabaseNotification> $paginator */
        $paginator = $user->notifications()->paginate(20);

        return ApiResponse::collection(
            NotificationResource::collection($paginator->getCollection()),
            $paginator,
        );
    }

    public function unreadCount(Request $request): JsonResponse
    {
        return ApiResponse::item(['count' => $this->actor($request)->unreadNotifications()->count()]);
    }

    public function markRead(Request $request, string $id): JsonResponse
    {
        $notification = $this->actor($request)->notifications()->findOrFail($id);
        $notification->markAsRead();

        return ApiResponse::noContent();
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $this->actor($request)->unreadNotifications->markAsRead();

        return ApiResponse::noContent();
    }

    private function actor(Request $request): User
    {
        /** @var User $user */
        $user = $request->user();

        return $user;
    }
}
