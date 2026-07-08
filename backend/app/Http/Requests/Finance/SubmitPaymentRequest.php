<?php

declare(strict_types=1);

namespace App\Http\Requests\Finance;

use App\Models\Invoice;
use Illuminate\Foundation\Http\FormRequest;

final class SubmitPaymentRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Invoice|null $invoice */
        $invoice = $this->route('invoice');

        return $invoice !== null && ($this->user()?->can('pay', $invoice) ?? false);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'reference' => ['required', 'string', 'min:3', 'max:255'],
        ];
    }
}
