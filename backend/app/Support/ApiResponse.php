<?php

declare(strict_types=1);

namespace App\Support;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Str;

/**
 * Builds the standardized API response envelope used by every endpoint.
 * See docs/api/api-standards.md §5–6. Controllers return through this helper
 * so the frontend always receives one predictable shape.
 */
final class ApiResponse
{
    /**
     * Single resource (or already-transformed array).
     *
     * @param  array<string, mixed>  $meta
     */
    public static function item(mixed $data, int $status = 200, array $meta = []): JsonResponse
    {
        return response()->json([
            'data' => $data,
            'meta' => self::meta($meta),
        ], $status);
    }

    /**
     * Collection with optional pagination metadata.
     *
     * @param  iterable<int, mixed>  $data
     * @param  LengthAwarePaginator<int, mixed>|null  $paginator
     * @param  array<string, mixed>  $meta
     */
    public static function collection(iterable $data, ?LengthAwarePaginator $paginator = null, array $meta = []): JsonResponse
    {
        if ($paginator instanceof LengthAwarePaginator) {
            $meta['pagination'] = [
                'page' => $paginator->currentPage(),
                'perPage' => $paginator->perPage(),
                'total' => $paginator->total(),
                'totalPages' => $paginator->lastPage(),
            ];
        }

        return response()->json([
            'data' => $data,
            'meta' => self::meta($meta),
        ]);
    }

    /**
     * Error envelope with a stable machine code and optional field details.
     *
     * @param  array<string, array<int, string>>  $details
     */
    public static function error(string $code, string $message, int $status, array $details = []): JsonResponse
    {
        $error = ['code' => $code, 'message' => $message];

        if ($details !== []) {
            $error['details'] = $details;
        }

        return response()->json([
            'error' => $error,
            'meta' => self::meta(),
        ], $status);
    }

    /**
     * Wrap a JsonResource in the standard envelope. The resource already emits
     * a `data` key; we attach `meta` (requestId + optional pagination).
     */
    public static function resource(JsonResource $resource, int $status = 200): JsonResponse
    {
        return $resource
            ->additional(['meta' => self::meta()])
            ->response()
            ->setStatusCode($status);
    }

    public static function noContent(): JsonResponse
    {
        return response()->json(null, 204);
    }

    /**
     * @param  array<string, mixed>  $extra
     * @return array<string, mixed>
     */
    private static function meta(array $extra = []): array
    {
        $requestId = request()->attributes->get('request_id');

        return array_merge([
            'requestId' => is_string($requestId) ? $requestId : (string) Str::uuid(),
        ], $extra);
    }
}
