<?php

declare(strict_types=1);

namespace App\Http\Requests\Complaints;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateComplaintRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Only PMs and Admins can update/resolve complaints.
        $user = $this->user();
        return $user !== null && ($user->hasRole('admin') || $user->hasRole('project_manager'));
    }

    public function rules(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(['pending', 'in_progress', 'resolved', 'dismissed'])],
            'resolution' => ['required_if:status,resolved,dismissed', 'nullable', 'string', 'max:10000'],
        ];
    }
}
