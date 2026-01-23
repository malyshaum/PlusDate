<?php

namespace App\Http\Requests\Admin;

use App\Enums\User\DeletionReasonEnum;
use App\Http\Requests\BaseRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DeleteAccountRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'reasons' => ['required', 'array', 'min:1'],
            'reasons.*' => [
                'required',
                'string',
                Rule::in(DeletionReasonEnum::values()),
            ],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }
}
