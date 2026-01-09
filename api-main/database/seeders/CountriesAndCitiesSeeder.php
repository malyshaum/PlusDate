<?php

namespace Database\Seeders;

use App\Models\Dictionary\Country;
use App\Models\Dictionary\City;
use Clickbar\Magellan\Data\Geometries\Point;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;

class CountriesAndCitiesSeeder extends Seeder
{
    public function run(): void
    {
        ini_set('memory_limit', '2048M');
        $this->seedCities();
        $this->seedCountries();
    }

    private function seedCountries(): void
    {
        $countriesJson = File::get(public_path('countries_final.json'));
        $countries = json_decode($countriesJson, true);

        foreach ($countries as $countryData) {
            Country::query()->updateOrCreate(
                ['country_code' => $countryData['code']],
                [
                    'name' => $countryData['names']['en'],
                    'ru_name' => $countryData['names']['ru'],
                    'country_code' => $countryData['code'],
                    'latitude' => null,
                    'longitude' => null,
                    'timezone' => null,
                ]
            );
        }

//        $this->command->info('Countries seeded successfully.');
    }

    private function seedCities(): void
    {
        $citiesJson = File::get(public_path('cities_final.json'));
        $cities = json_decode($citiesJson, true);

        foreach ($cities as $citiesData) {
            $location = explode(',', $citiesData['location']);

            City::query()->insert(
                [
                    'name' => $citiesData['names']['en'],
                    'ru_name' => $citiesData['names']['ru'],
                    'country_code' => $citiesData['country_code'],
                    'location' => Point::make((float)$location[1], (float)$location[0]),
                ],
            );

            echo $citiesData['names']['ru'].' done'.PHP_EOL;
        }

//        $this->command->info('cities seeded successfully.');
    }
}
