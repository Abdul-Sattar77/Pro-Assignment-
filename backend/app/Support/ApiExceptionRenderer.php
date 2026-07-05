<?php

declare(strict_types=1);

namespace App\Support;

use App\Exceptions\DomainException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

/**
 * Maps any thrown exception to the standardized API error envelope with a
 * stable machine `code` (docs/api/api-standards.md §6). Internal details are
 * never leaked to clients unless APP_DEBUG is on.
 */
final class ApiExceptionRenderer
{
    public static function render(Throwable $e): JsonResponse
    {
        return match (true) {
            $e instanceof DomainException => ApiResponse::error(
                $e->errorCode,
                $e->getMessage(),
                $e->status,
                $e->details,
            ),
            $e instanceof ValidationException => ApiResponse::error(
                'VALIDATION_FAILED',
                'The given data was invalid.',
                422,
                $e->errors(),
            ),
            $e instanceof AuthenticationException => ApiResponse::error(
                'UNAUTHENTICATED',
                'Unauthenticated.',
                401,
            ),
            $e instanceof AuthorizationException => ApiResponse::error(
                'FORBIDDEN',
                $e->getMessage() !== '' ? $e->getMessage() : 'This action is unauthorized.',
                403,
            ),
            $e instanceof AccessDeniedHttpException => ApiResponse::error(
                'FORBIDDEN',
                'This action is unauthorized.',
                403,
            ),
            $e instanceof ModelNotFoundException,
            $e instanceof NotFoundHttpException => ApiResponse::error(
                'NOT_FOUND',
                'Resource not found.',
                404,
            ),
            $e instanceof ThrottleRequestsException => ApiResponse::error(
                'RATE_LIMITED',
                'Too many requests. Please slow down.',
                429,
            ),
            $e instanceof HttpExceptionInterface => ApiResponse::error(
                'HTTP_ERROR',
                $e->getMessage() !== '' ? $e->getMessage() : 'Request failed.',
                $e->getStatusCode(),
            ),
            default => ApiResponse::error(
                'INTERNAL_ERROR',
                config('app.debug') === true ? $e->getMessage() : 'Something went wrong. Please try again.',
                500,
            ),
        };
    }
}
