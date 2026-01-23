<?php

namespace App\Http\Resources\Chat;

use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'chat_id' => $this->chatId,
            'sender_id' => $this->senderId,
            'sender' => UserResource::make($this->sender),
            'message' => $this->message,
            'sent_at' => $this->sentAt,
            'read_at' => $this->readAt,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}