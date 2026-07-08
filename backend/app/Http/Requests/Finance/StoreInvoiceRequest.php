<?php

declare(strict_types=1);

namespace App\Http\Requests\Finance;

use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;

final class StoreInvoiceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('manage', Invoice::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'assignmentId' => ['nullable', 'uuid'],
            'clientId' => ['required_without:assignmentId', 'uuid'],
            'amount' => ['required', 'numeric', 'min:0.01', 'max:1000000'],
            'currency' => ['sometimes', 'string', 'size:3'],
            'description' => ['nullable', 'string', 'max:255'],
        ];
    }
}
