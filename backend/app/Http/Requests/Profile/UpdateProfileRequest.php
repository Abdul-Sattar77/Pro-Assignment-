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
            // Partial update: only validate fields that are actually sent, so a
            // writer saving just availability/writer_profile isn't forced to
            // re-send name+email (ProfileService only writes the keys present).
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => [
                'sometimes', 'required', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
            'university' => ['sometimes', 'nullable', 'string', 'max:160'],
            'department' => ['sometimes', 'nullable', 'string', 'max:120'],
            'study_year' => ['sometimes', 'nullable', 'string', 'max:40'],
            // Writer self-service fields (mirror the values the admin panel uses).
            'availability' => ['sometimes', 'string', 'in:available,busy,away'],
            'expertise' => ['sometimes', 'nullable', 'string', 'max:5000'],
            // Structured writer profile (self-service; separate from `expertise`).
            'writer_profile' => ['sometimes', 'nullable', 'array'],
            'writer_profile.subjects' => ['nullable', 'string', 'max:500'],
            'writer_profile.universities' => ['nullable', 'string', 'max:500'],
            'writer_profile.codingLanguages' => ['nullable', 'string', 'max:500'],
            'writer_profile.dissertationExperience' => ['nullable', 'boolean'],
            'writer_profile.urgentCapable' => ['nullable', 'boolean'],
            'writer_profile.maxWordCount' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'writer_profile.maxWorkload' => ['nullable', 'integer', 'min:0', 'max:1000'],
        ];
    }
}
