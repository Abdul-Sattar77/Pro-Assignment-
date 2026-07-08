<?php

declare(strict_types=1);

namespace App\Http\Requests\Messages;

use App\Models\Assignment;
use Illuminate\Foundation\Http\FormRequest;

final class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        $user = $this->user();
        $assignment = $this->route('assignment');

        return $user !== null
            && $assignment instanceof Assignment
            && $user->can('view', $assignment)
            && $user->can('messages.send');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'body' => ['required', 'string', 'max:5000'],
        ];
    }
}
