<?php

declare(strict_types=1);

namespace App\Http\Requests\Messages;

use Illuminate\Foundation\Http\FormRequest;

final class StoreMessageRequest extends FormRequest
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
        return [
            'assignmentId' => [
                'required',
                'string',
                'exists:assignments,uuid',
            ],
            'type' => [
                'required',
                'string',
                'in:client,writer',
            ],
            'message' => [
                'nullable',
                'string',
                'max:5000',
                'required_without:attachmentId',
            ],
            'attachmentId' => [
                'nullable',
                'string',
                'exists:files,uuid',
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'message.required_without' => 'Please type a message or upload an attachment.',
            'message.max' => 'Your message is too long (maximum 5000 characters).',
        ];
    }
}
