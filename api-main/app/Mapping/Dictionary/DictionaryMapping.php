<?php

namespace App\Mapping\Dictionary;

use App\Dto\Dictionary\ActivityDto;
use App\Dto\Dictionary\CityDto;
use App\Dto\Dictionary\CountryDto;
use App\Mapping\AutoMapperConfiguratorInterface;
use AutoMapperPlus\Configuration\AutoMapperConfig;
use AutoMapperPlus\DataType;
use AutoMapperPlus\NameConverter\NamingConvention\CamelCaseNamingConvention;
use AutoMapperPlus\NameConverter\NamingConvention\SnakeCaseNamingConvention;

class DictionaryMapping implements AutoMapperConfiguratorInterface
{
    public function configure(AutoMapperConfig $config): void
    {
        $config->registerMapping(DataType::ARRAY, CityDto::class)
            ->withNamingConventions(new SnakeCaseNamingConvention(), new CamelCaseNamingConvention());

        $config->registerMapping(DataType::ARRAY, ActivityDto::class)
            ->withNamingConventions(new SnakeCaseNamingConvention(), new CamelCaseNamingConvention());

        $config->registerMapping(DataType::ARRAY, CountryDto::class)
            ->withNamingConventions(new SnakeCaseNamingConvention(), new CamelCaseNamingConvention());
    }
}
