<?php

declare(strict_types=1);

namespace App\Http\Requests\Chat;

use App\Rules\SafeUpload;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;

final class SendChatMessageRequest extends FormRequest
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
            // 50 MB cap (voice/photo/video clips + documents); executable and
            // script types are rejected by SafeUpload.
            'body' => ['nullable', 'string', 'max:5000'],
            'file' => ['nullable', 'file', 'max:51200', new SafeUpload()],
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator): void {
            $body = $this->input('body');
            if (!$this->hasFile('file') && (!is_string($body) || trim($body) === '')) {
                $validator->errors()->add('body', 'Type a message or attach a file.');
            }
        });
    }
}
