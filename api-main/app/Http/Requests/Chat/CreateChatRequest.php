<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;

class CreateChatRequest extends FormRequest
{
    public function rules(): array
    {
        return [
            'other_user_id' => 'required|integer|exists:users,id|different:user_id',
            'user_id' => 'required|integer|exists:users,id',
        ];
    }
}