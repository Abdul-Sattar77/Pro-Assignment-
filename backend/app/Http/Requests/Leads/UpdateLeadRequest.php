<?php

declare(strict_types=1);

namespace App\Http\Requests\Leads;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Models\Lead;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Lead|null $lead */
        $lead = $this->route('lead');

        return $lead !== null
            && ($this->user()?->can('update', $lead) ?? false);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'source' => ['sometimes', Rule::in(LeadSource::values())],
            'status' => ['sometimes', Rule::in(LeadStatus::values())],
            'notes' => ['sometimes', 'nullable', 'string', 'max:5000'],
            'lost_reason' => [
                Rule::requiredIf(function () {
                    $status = $this->input('status');
                    if ($status === null) {
                        /** @var Lead|null $lead */
                        $lead = $this->route('lead');
                        $status = $lead ? $lead->status->value : null;
                    }

                    return $status === LeadStatus::Lost->value;
                }),
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'lost_reason.required_if' => 'A lost reason is required when the status is Lost.',
        ];
    }
}
