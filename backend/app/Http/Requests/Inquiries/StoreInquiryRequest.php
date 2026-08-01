<?php

declare(strict_types=1);

namespace App\Http\Requests\Inquiries;

use Illuminate\Foundation\Http\FormRequest;

final class StoreInquiryRequest extends FormRequest
{
    /** Public form — anyone may submit. */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:180'],
            'phone' => ['nullable', 'string', 'max:40'],
            'subject' => ['nullable', 'string', 'max:160'],
            'message' => ['required', 'string', 'min:10', 'max:4000'],
        ];
    }
}
