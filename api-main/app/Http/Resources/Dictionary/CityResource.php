<?php

namespace App\Http\Resources\Dictionary;

use Illuminate\Http\Resources\Json\JsonResource;

class CityResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'en_name' => $this->name,
            'ru_name' => $this->ru_name,
            'country_code' => $this->country_code,
            'location' => $this->location,
            'timezone' => $this->timezone,
            'ru_country_name' => $this->ru_country_name,
            'en_country_name' => $this->en_country_name,
        ];
    }
}
