<?php

declare(strict_types=1);

namespace App\Services\Leads;

use App\Enums\LeadStatus;
use App\Exceptions\DomainRuleException;
use App\Models\Lead;
use App\Repositories\Contracts\LeadRepositoryInterface;
use Illuminate\Support\Facades\DB;

/**
 * Service managing all Lead operations.
 */
final class LeadService
{
    public function __construct(
        private readonly LeadRepositoryInterface $leads,
    ) {}

    /**
     * Create a new lead.
     *
     * @param  array{name: string, email: string|null, phone: string|null, source: string, status?: string|null, notes?: string|null, lost_reason?: string|null}  $data
     */
    public function create(array $data): Lead
    {
        return DB::transaction(function () use ($data): Lead {
            // Business rule: status defaults to new if not specified
            $data['status'] = $data['status'] ?? LeadStatus::New->value;

            if ($data['status'] === LeadStatus::Lost->value && empty($data['lost_reason'])) {
                throw new DomainRuleException('A lost reason is required when the status is Lost.', 'LOST_REASON_REQUIRED', 422);
            }

            return $this->leads->create($data);
        });
    }

    /**
     * Update an existing lead.
     *
     * @param  array<string, mixed>  $data
     */
    public function update(Lead $lead, array $data): Lead
    {
        return DB::transaction(function () use ($lead, $data): Lead {
            $status = $data['status'] ?? $lead->status->value;

            if ($status === LeadStatus::Lost->value && empty($data['lost_reason'] ?? $lead->lost_reason)) {
                throw new DomainRuleException('A lost reason is required when the status is Lost.', 'LOST_REASON_REQUIRED', 422);
            }

            // Clear lost reason if status changed from lost to something else
            if ($status !== LeadStatus::Lost->value) {
                $data['lost_reason'] = null;
            }

            return $this->leads->update($lead, $data);
        });
    }

    /**
     * Delete a lead.
     */
    public function delete(Lead $lead): bool
    {
        return DB::transaction(function () use ($lead): bool {
            return $this->leads->delete($lead);
        });
    }
}
