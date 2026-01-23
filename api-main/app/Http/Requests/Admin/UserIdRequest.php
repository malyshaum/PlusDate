<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

final class UserIdRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'user_id' => [
                'required',
                'integer',
                'gt:0',
                'exists:users,id'
            ],
        ];
    }

    public function getUserId(): int
    {
        return (int)$this->input('user_id');
    }
}