<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1\Leads;

use App\Enums\LeadStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\Leads\StoreLeadQuoteRequest;
use App\Http\Resources\LeadQuoteResource;
use App\Models\Lead;
use App\Models\LeadQuote;
use App\Support\ApiResponse;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

final class LeadQuoteController extends Controller
{
    use AuthorizesRequests;

    public function index(Request $request, Lead $lead): JsonResponse
    {
        $this->authorize('view', $lead);

        $quotes = $lead->quotes()->with('creator')->get();

        return ApiResponse::resource(LeadQuoteResource::collection($quotes));
    }

    public function store(StoreLeadQuoteRequest $request, Lead $lead): JsonResponse
    {
        /** @var array{amount: float|int|string, notes?: string|null} $data */
        $data = $request->validated();

        $quote = DB::transaction(function () use ($request, $lead, $data): LeadQuote {
            /** @var LeadQuote $newQuote */
            $newQuote = $lead->quotes()->create([
                'amount' => (float) $data['amount'],
                'notes' => $data['notes'] ?? null,
                'created_by' => $request->user()?->getKey(),
            ]);

            if ($lead->status === LeadStatus::New) {
                $lead->update(['status' => LeadStatus::Quoted->value]);
            }

            return $newQuote->load('creator');
        });

        return ApiResponse::resource(LeadQuoteResource::make($quote), 201);
    }
}
