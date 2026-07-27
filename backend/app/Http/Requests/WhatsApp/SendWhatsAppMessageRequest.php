<?php

declare(strict_types=1);

namespace App\Http\Requests\WhatsApp;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

/**
 * A reply must carry text, an attachment, or both.
 *
 * Authorization is handled by the controller's policy check, which needs the
 * resolved contact model.
 */
final class SendWhatsAppMessageRequest extends FormRequest
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
            // Meta caps text bodies at 4096 characters.
            'body' => ['nullable', 'string', 'max:4096'],
            'file' => ['nullable', 'file', 'max:102400'], // 100 MB, Meta's document cap
        ];
    }

    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $v): void {
            if (blank($this->input('body')) && !$this->hasFile('file')) {
                $v->errors()->add('body', 'Enter a message or attach a file.');
            }
        });
    }
}
