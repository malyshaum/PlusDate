<?php

namespace App\Http\Resources\Dictionary;

use Illuminate\Http\Resources\Json\JsonResource;

class CountryResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'en_name' => $this->name,
            'ru_name' => $this->ru_name,
            'country_code' => $this->country_code,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'timezone' => $this->timezone
        ];
    }
}
