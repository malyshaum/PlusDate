<?php

namespace Database\Seeders;

use App\Models\Dictionary\City;
use App\Models\User\UserFeedProfile;
use Exception;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UserFeedProfileSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::beginTransaction();

        try {
            UserFeedProfile::factory()->count(50)->create();
            $city = City::query()->inRandomOrder()->first();
            self::makeNearby($city->id);
            self::makeFaraway($city->id);
            DB::commit();
        } catch (Exception $exception) {
            DB::rollBack();
            throw $exception;
        }
    }

    public static function makeNearby(int|null $cityId): void
    {
        if ($cityId !== null) {
            $city = City::query()->findOrFail($cityId);
        } else {
            $city = City::query()->inRandomOrder()->first();
        }

        echo "using city: $city->name with coordinates $city->latitude, $city->longitude\n";

        /** @see UserFeedProfileFactory */
        UserFeedProfile::factory()
            ->nearby($city->location->getLatitude(), $city->location->getLongitude())
            ->count(50)
            ->create();
    }

    public static function makeFaraway(int|null $cityId): void
    {
        if ($cityId !== null) {
            $city = City::query()->findOrFail($cityId);
        } else {
            $city = City::query()->inRandomOrder()->first();
        }

        $latitude = $city->location->getLatitude();
        $longitude = $city->location->getLongitude();
        echo "using city: $city->name with coordinates $latitude, $longitude\n";

        /** @see UserFeedProfileFactory */
        UserFeedProfile::factory()
            ->faraway($latitude, $longitude)
            ->count(50)
            ->create();
    }
}
