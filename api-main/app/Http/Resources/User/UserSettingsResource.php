<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Resources\Json\JsonResource;

class UserSettingsResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'disable_notifications' => $this->disable_notifications,
            'hide_instagram' => $this->hide_instagram,
            'hide_age' => $this->hide_age,
        ];
    }
}
