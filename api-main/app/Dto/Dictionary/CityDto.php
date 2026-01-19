<?php

namespace App\Dto\Dictionary;

use App\Dto\BaseDto;
use Clickbar\Magellan\Data\Geometries\Point;

class CityDto extends BaseDto
{
    public string $name;
    public string|null $enName;
    public string|null $ruName;
    public string $countryCode;
    public Point|null $location;
    public string|null $timezone;
}
