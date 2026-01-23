<?php

namespace App\Http\Requests\User;

use App\Enums\User\DeletionReasonEnum;
use App\Http\Requests\BaseRequest;
use Illuminate\Validation\Rule;

class DeleteAccountRequest extends BaseRequest
{
    public function rules(): array
    {
        return [
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
