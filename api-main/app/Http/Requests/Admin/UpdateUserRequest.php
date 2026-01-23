<?php

namespace App\Http\Requests\Admin;

use App\Enums\Core\GenderEnum;
use App\Http\Requests\BaseRequest;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateUserRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'gt:0'
            ],
            'name' => [
                'sometimes',
                'string',
                'min:1',
                'max:50'
            ],
            'gender' => [
                'sometimes',
                'string',
                Rule::in(GenderEnum::values())
            ]
        ];
    }
}
