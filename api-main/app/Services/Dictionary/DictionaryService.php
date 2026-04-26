<?php

namespace App\Services\Dictionary;

use App\Dto\Dictionary\ActivityDto;
use App\Dto\Dictionary\CityDto;
use App\Dto\Dictionary\CountryDto;
use App\Mapping\Dictionary\DictionaryMapping;
use App\Models\Dictionary\Activity;
use App\Models\Dictionary\City;
use App\Models\Dictionary\Country;
use App\Models\Dictionary\Hobby;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Schema;
use Stevebauman\Location\Facades\Location;

class DictionaryService
{
    public function __construct(
        private readonly AutoMapper $mapper,
    )
    {

    }

    /**
     * @throws UnregisteredMappingException
     */
    public function getCityById(int $cityId): CityDto|null
    {
        $city = City::query()->findOrFail($cityId);

        /** @see DictionaryMapping */
        return $this->mapper->map($city->toArray(), CityDto::class);
    }

    public function getCountryByCode(string $code): CountryDto|null
    {
        $country = Country::query()
            ->where('country_code', $code)
            ->first();

        /** @see DictionaryMapping */
        return $this->mapper->map($country?->toArray(), CountryDto::class);
    }

    /**
     * @throws UnregisteredMappingException
     */
    public function getActivityById(int $activityId): ActivityDto|null
    {
        $activity = Activity::query()->find($activityId);

        /** @see DictionaryMapping */
        return $this->mapper->map($activity?->toArray(), ActivityDto::class);
    }

    /**
     * @param string|null $searchText
     * @param float|null $latitude
     * @param float|null $longitude
     * @return Collection
     */
    public function cities(
        string|null $searchText = null,
        float|null $latitude = null,
        float|null $longitude = null
    ): Collection {
        $usePostgis = config('database.use_postgis');
        $query = City::query()
            ->join('countries', 'countries.country_code', '=', 'cities.country_code');

        $baseSelect = $usePostgis
            ? 'cities.id, cities.name, cities.ru_name, cities.name as en_name, cities.country_code, ' .
                'ST_Y(location::geometry) as latitude, ST_X(location::geometry) as longitude'
            : 'cities.id, cities.name, cities.ru_name, cities.name as en_name, cities.country_code, ' .
                'cities.latitude as latitude, cities.longitude as longitude';

        $userIp = request()->header('CF-Connecting-IP') ?? request()->header('X-Forwarded-For');;
        if (($latitude === null || $longitude === null) && $userIp) {
            $ipPosition = Location::get($userIp);
            $latitude = $ipPosition?->latitude;
            $longitude = $ipPosition?->longitude;
        }

        if (
            $usePostgis
            && Schema::getConnection()->getDriverName() === 'pgsql'
            &&
            $searchText === null
            && ($latitude !== null && $longitude !== null)
        ) {
            $query->selectRaw($baseSelect . ', ST_Distance(location, ST_Point(?, ?)::geography) as distance',
                            [$longitude, $latitude])
                  ->orderBy('distance')
                  ->limit(10);
        } else {
            $query->selectRaw($baseSelect)
                  ->orderBy('cities.name')
                  ->limit(50);
        }

        if ($searchText !== null) {
            $searchText = strtolower(trim($searchText));
            $query->where(function($q) use ($searchText) {
                $q->where('cities.name', 'ILIKE', "{$searchText}%")
                    ->orWhere('cities.ru_name', 'ILIKE', "{$searchText}%")
                    ->orWhere('countries.name', 'ILIKE', "{$searchText}%")
                    ->orWhere('countries.ru_name', 'ILIKE', "{$searchText}%");
            });
        }

        return $query->get();
    }

    public function countries(string $searchable): Collection
    {
        return Country::query()
            ->where('name', 'LIKE', "$searchable%")
            ->orWhere('ru_name', 'LIKE', "$searchable%")
            ->limit(50)
            ->get();
    }

    public function activities(string|null $searchable): Collection
    {
        return Activity::query()
            ->where('title', 'LIKE', "$searchable%")
            ->get();
    }

    public function hobbies(string|null $searchable): Collection
    {
        return Hobby::query()
            ->where('title', 'LIKE', "$searchable%")
            ->get();
    }
}
