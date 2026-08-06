<?php

declare(strict_types=1);

namespace App\Http\Requests\Leads;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use App\Models\Lead;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StoreLeadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Lead::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    /** The frontend sends camelCase lostReason; persist it as lost_reason. */
    protected function prepareForValidation(): void
    {
        if ($this->has('lostReason') && !$this->has('lost_reason')) {
            $this->merge(['lost_reason' => $this->input('lostReason')]);
        }
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'email', 'max:255'],
            'phone' => ['nullable', 'string', 'max:50'],
            'source' => ['required', Rule::in(LeadSource::values())],
            'status' => ['nullable', Rule::in(LeadStatus::values())],
            'notes' => ['nullable', 'string', 'max:5000'],
            'lost_reason' => [
                Rule::requiredIf($this->input('status') === LeadStatus::Lost->value),
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
