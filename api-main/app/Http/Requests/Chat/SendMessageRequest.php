<?php

namespace App\Http\Requests\Chat;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;

class SendMessageRequest extends FormRequest
{
    public function validationData(): array
    {
        $data = $this->all();
        $data['sender_id'] = Auth::id();

        if ($this->hasHeader('x-user-id')) {
            $data['sender_id'] = $this->header('x-user-id');
        }

        return $data;
    }

    public function rules(): array
    {
        return [
            'sender_id' => [
                'required',
                'integer',
                'gt:0'
            ],
            'chat_id' => 'required|integer|exists:chats,id',
            'message' => 'required|string|max:1000|min:1',
        ];
    }
}
