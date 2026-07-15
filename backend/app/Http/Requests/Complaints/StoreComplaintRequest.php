<?php

declare(strict_types=1);

namespace App\Http\Requests\Complaints;

use Illuminate\Foundation\Http\FormRequest;

final class StoreComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'assignmentId' => ['nullable', 'string', 'exists:assignments,uuid'],
            'subject' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:10000'],
        ];
    }
}
