<?php

declare(strict_types=1);

namespace App\Http\Requests\Assignments;

use App\Enums\Role;
use App\Models\Assignment;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class AssignWriterRequest extends FormRequest
{
    public function authorize(): bool
    {
        /** @var Assignment|null $assignment */
        $assignment = $this->route('assignment');

        return $assignment !== null
            && ($this->user()?->can('assign', $assignment) ?? false);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'writerId' => [
                'required',
                'uuid',
                // Verify the writer UUID actually exists in the users table
                Rule::exists(User::class, 'uuid')->where(function ($query) {
                    // Only allow active users
                    $query->where('is_active', true);
                }),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'writerId.exists' => 'The selected writer does not exist or is inactive.',
        ];
    }
}
