<?php

namespace App\Http\Resources\Chat;

use App\Http\Resources\User\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ChatResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'users' => UserResource::collection($this->users),
            'latest_message' => $this->latestMessage ? ChatMessageResource::make($this->latestMessage) : null,
            'created_at' => $this->createdAt,
            'updated_at' => $this->updatedAt,
        ];
    }
}