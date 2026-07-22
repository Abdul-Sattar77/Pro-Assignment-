<?php

declare(strict_types=1);

namespace App\Http\Requests\Profile;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

final class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $userId = $this->user()?->getKey();

        return [
            'name' => ['required', 'string', 'max:255'],
            'email' => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'university' => ['sometimes', 'nullable', 'string', 'max:160'],
            'department' => ['sometimes', 'nullable', 'string', 'max:120'],
            'study_year' => ['sometimes', 'nullable', 'string', 'max:40'],
            // Writer self-service fields (mirror the values the admin panel uses).
            'availability' => ['sometimes', 'string', 'in:available,busy,away'],
            'expertise' => ['sometimes', 'nullable', 'string', 'max:5000'],
        ];
    }
}
