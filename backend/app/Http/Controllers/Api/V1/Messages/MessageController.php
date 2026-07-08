<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Messages;

use App\Http\Controllers\Controller;
use App\Http\Requests\Messages\StoreMessageRequest;
use App\Http\Resources\MessageResource;
use App\Models\Assignment;
use App\Models\User;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Per-order chat. Thin controller; the thread is scoped to an assignment and
 * visible to everyone who can view that order.
 */
final class MessageController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Assignment $assignment): JsonResponse
    {
        $this->authorize('view', $assignment);

        $messages = $assignment->messages()->with('sender')->get();

        return ApiResponse::collection(MessageResource::collection($messages));
    }

    public function store(StoreMessageRequest $request, Assignment $assignment): JsonResponse
    {
        /** @var User $sender */
        $sender = $request->user();

        /** @var string $body */
        $body = $request->validated('body');

        $message = $assignment->messages()->create([
            'sender_id' => $sender->getKey(),
            'body' => $body,
        ]);

        return ApiResponse::resource(MessageResource::make($message->load('sender')), 201);
    }
}
