<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class GetChatMessagesRequest extends FormRequest
{
    public function validationData(): array
    {
        $data = $this->all();
        $data['chat_id'] = $this->route('chat_id');
        $data['user_id'] = Auth::id();

        return $data;
    }

    public function rules(): array
    {
        return [
            'chat_id' => 'required|integer|exists:chats,id',
            'cursor' => [
                'sometimes',
                'string',
                'nullable'
            ],
            'per_page' => [
                'sometimes',
                'integer',
                'min:1',
                'max:100'
            ],
            'user_id' => [
                'required',
                'integer',
                'gt:0'
            ]
        ];
    }
}
