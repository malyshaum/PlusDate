<?php

namespace App\Dto\User;

use App\Dto\BaseDto;
use App\Dto\Dictionary\ActivityDto;
use App\Dto\Dictionary\CityDto;
use App\Dto\Dictionary\CountryDto;
use App\Enums\Core\EyeColorEnum;
use App\Enums\Core\GenderEnum;
use App\Enums\Core\SearchForEnum;
use App\Enums\Core\ZodiacSignEnum;

class UserSearchPreferenceDto extends BaseDto
{
    public int|null $id;
    public int $userId;
    public int|null $cityId;
    public bool $includeNearby;
    public bool $withVideo;
    public int $fromAge;
    public int $toAge;
    public bool $expandAgeRange;
    public GenderEnum|null $gender;
    public SearchForEnum|null $searchFor;

    /** @var EyeColorEnum[] $eyeColor  */
    public array|null $eyeColor;

    /** @var ZodiacSignEnum[] $zodiacSigns  */
    public array|null $zodiacSigns;

    /** @var int[]|null */
    public array|null $activityIds;
    /** @deprecated Use activityIds instead. Kept for backward compatibility. */
    public int|null $activityId;
    public array|null $hobbies;
    public bool $withPremium;
    public int|null $heightFrom;
    public int|null $heightTo;
    public CityDto|null $city;
    public CountryDto|null $country;
    public ActivityDto|null $activity;
}
