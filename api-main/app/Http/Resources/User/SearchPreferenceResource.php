<?php

namespace App\Http\Resources\User;

use App\Dto\Dictionary\ActivityDto;
use App\Http\Resources\Dictionary\CityResource;
use App\Models\Dictionary\Activity;
use App\Models\User\UserSearchPreference;
use AutoMapperPlus\AutoMapper;
use Illuminate\Http\Resources\Json\JsonResource;

class SearchPreferenceResource extends JsonResource
{
    public function toArray($request): array
    {
        /** @var UserSearchPreference $this */
        $activityIds = $this->activity_ids ?? [];
        $activitiesDto = [];

        if (!empty($activityIds)) {
            $activities = Activity::query()
                ->whereIn('id', $activityIds)
                ->get();

            $mapper = app(AutoMapper::class);
            $activitiesDto = $activities->map(function ($activity) use ($mapper) {
                return $mapper->map($activity->toArray(), ActivityDto::class);
            })->toArray();
        }

        $data = [
            'city_id' => $this->city_id,
            'gender' => $this->gender,
            'search_for' => $this->search_for,
            'include_nearby' => $this->include_nearby,
            'with_video' => $this->with_video,
            'from_age' => $this->from_age,
            'to_age' => $this->to_age,
            'expand_age_range' => $this->expand_age_range,
            'activity_id' => $this->activity_id,
            'activity_ids' => $activityIds,
            'activities' => $activitiesDto,
            'hobbies' => $this->hobbies,
            'with_premium' => $this->with_premium,
            'height_from' => $this->height_from,
            'height_to' => $this->height_to,
            'eye_color' => $this->eye_color,
            'activity' => $this->whenLoaded('activity'),
        ];

        if ($this->hasPivotLoaded('city') || isset($this->resource['city'])) {
            $city = $this->hasPivotLoaded('city') ? $this->city : $this->resource['city'];
            $data['city'] = CityResource::make($city);
        }

        return $data;
    }
}
