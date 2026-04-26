<?php

namespace App\Http\Resources\User;

use App\Dto\Dictionary\ActivityDto;
use App\Http\Resources\Dictionary\CityResource;
use App\Models\Dictionary\Hobby;
use App\Models\User\UserFeedProfile;
use AutoMapperPlus\AutoMapper;
use Illuminate\Http\Resources\Json\JsonResource;

class UserFeedProfileResource extends JsonResource
{
    // TODO: remove hobbies query builder here
    public function toArray($request): array
    {
        /** @var UserFeedProfile $this */
        $activities = $this->relationLoaded('activities') 
            ? $this->activities 
            : $this->activities()->get();
        
        $mapper = app(AutoMapper::class);
        $activitiesDto = $activities->map(function ($activity) use ($mapper) {
            return $mapper->map($activity->toArray(), ActivityDto::class);
        })->toArray();
        
        return [
            'id' => $this->id,
            'city' => CityResource::make($this->city),
            'sex' => $this->sex,
            'age' => $this->age,
            'search_for' => $this->search_for,
            'coordinates' => $this->getCoordinatesPayload(),
            'activities' => $activitiesDto,
            'height' => $this->height,
            'eye_color' => $this->eye_color,
            'zodiac_sign' => $this->zodiac_sign?->value,
            'hobbies' => empty($this->hobbies) ? [] : Hobby::query()->whereIn('id', $this->hobbies)->get(),
        ];
    }
}
