<?php

declare(strict_types=1);

namespace App\Http\Requests\Email;

use Illuminate\Foundation\Http\FormRequest;

/**
 * A reply needs a body; attachments are optional.
 *
 * Authorization is handled by the controller's policy check, which needs the
 * resolved thread model.
 */
final class SendEmailRequest extends FormRequest
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
            'body' => ['required', 'string', 'max:100000'],
            'files' => ['nullable', 'array', 'max:10'],
            // Gmail's own send cap is 25 MB across the whole message.
            'files.*' => ['file', 'max:25600'],
        ];
    }
}
