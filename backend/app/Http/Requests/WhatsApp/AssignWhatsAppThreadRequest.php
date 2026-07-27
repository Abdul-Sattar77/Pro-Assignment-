<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;

/** Assign a thread to a rep, or pass null to return it to the shared queue. */
final class AssignWhatsAppThreadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'userId' => ['present', 'nullable', 'string', 'exists:users,uuid'],
        ];
    }
}
