<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Resources\Json\JsonResource;

class UserModerationResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'rejection_reason'=> $this->rejection_reason,
            'file' => $this->file,
            'is_resolved' => $this->is_resolved,
            'note' => $this->note,
            'created_at' => $this->created_at
        ];
    }
}
