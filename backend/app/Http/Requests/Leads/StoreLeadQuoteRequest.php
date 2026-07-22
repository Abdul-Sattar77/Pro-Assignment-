<?php

declare(strict_types=1);

namespace App\Http\Requests\Leads;

use App\Models\Lead;
use Illuminate\Foundation\Http\FormRequest;

final class StoreLeadQuoteRequest extends FormRequest
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
            'amount' => ['required', 'numeric', 'min:0', 'max:9999999.99'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
