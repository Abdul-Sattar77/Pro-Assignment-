<?php

declare(strict_types=1);

namespace App\Http\Requests\Finance;

use App\Enums\PaymentType;
use App\Models\Payment;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class StorePaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('create', Payment::class) ?? false;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'assignmentId' => ['nullable', 'string', 'exists:assignments,uuid'],
            'invoiceId' => ['nullable', 'string', 'exists:invoices,uuid'],
            'userId' => ['nullable', 'string', 'exists:users,uuid'],
            'amount' => ['required', 'numeric', 'min:0.01'],
            'paymentMethod' => ['nullable', 'string', 'max:255'],
            'paymentType' => ['required', Rule::in(PaymentType::values())],
            'proofFileId' => ['nullable', 'string', 'exists:files,uuid'],
            'verified' => ['nullable', 'boolean'],
            'notes' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
