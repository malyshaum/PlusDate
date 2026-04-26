<?php

namespace Database\Factories\User;

use App\Dto\User\UserFeedProfileDto;
use App\Enums\Core\EyeColorEnum;
use App\Enums\Core\SearchForEnum;
use App\Enums\Core\GenderEnum;
use App\Mapping\User\UserMapping;
use App\Models\Dictionary\Activity;
use App\Models\Dictionary\City;
use App\Models\Dictionary\Country;
use App\Models\User;
use App\Models\User\UserFeedProfile;
use App\Services\User\VectorService;
use AutoMapperPlus\AutoMapper;
use AutoMapperPlus\Exception\UnregisteredMappingException;
use Carbon\Carbon;
use Clickbar\Magellan\Data\Geometries\Point;
use Faker\Generator;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\App;

class UserFeedProfileFactory extends Factory
{
    protected $model = UserFeedProfile::class;

    public function definition(): array
    {
        $dto = $this->makeDto();
        return $dto->toArray();
    }

    public static function makeDto(): UserFeedProfileDto
    {
        /** @var Generator $faker */
        $faker = App::make(Generator::class);

        /** @var City $city */
        $city = City::query()->inRandomOrder()->first();

        $birthday = $faker->dateTimeBetween('-50 years', '-18 years');
        $age = Carbon::parse($birthday)->age;

        $user = User::factory()->create([
            'instagram' => $faker->optional(0.7)->userName(),
            'profile_description' => $faker->optional(0.8)->realText(200),
            'username' => $faker->userName(),
            'photo_url' => $faker->imageUrl(400, 400, 'people'),
            'language_code' => $faker->randomElement(['en', 'es', 'fr', 'de', 'it', 'pt']),
            'is_onboarded' => $faker->boolean(90),
        ]);

        $profileArray = [
            'user_id' => $user->id,
            'country_id' => Country::query()->inRandomOrder()->first()->id,
            'city_id' => $city->id,
            'activity_id' => Activity::query()->inRandomOrder()->first()->id,
            'sex' => $faker->randomElement(GenderEnum::values()),
            'age' => $age,
            'search_for' => SearchForEnum::values()[array_rand(SearchForEnum::values())],
            'height' => $faker->numberBetween(150, 210),
            'eye_color' => $faker->randomElement(EyeColorEnum::values()),
            'coordinates' => self::makeCoordinates($city->getLatitudeValue(), $city->getLongitudeValue()),
        ];

        /** @var UserFeedProfileDto $feedProfileDto */
        /** @see UserMapping::configure() */
        return app(AutoMapper::class)->map($profileArray, UserFeedProfileDto::class);
    }

    public function nearby(float $baseLat, float $baseLng): static
    {
        return $this->state(function (array $attributes) use ($baseLat, $baseLng) {
            /** @var Generator $faker */
            $faker = App::make(Generator::class);

            $lat = $baseLat + $faker->randomFloat(4, -0.1, 0.1);
            $lng = $baseLng + $faker->randomFloat(4, -0.1, 0.1);

            return [
                'coordinates' => self::makeCoordinates($lat, $lng),
            ];
        });
    }

    public function faraway(float $baseLat, float $baseLng): static
    {
        return $this->state(function (array $attributes) use ($baseLat, $baseLng) {
            /** @var Generator $faker */
            $faker = App::make(Generator::class);

            $lat = $baseLat + $faker->randomFloat(4, -50, 50);
            $lng = $baseLng + $faker->randomFloat(4, -50, 50);

            return [
                'coordinates' => self::makeCoordinates($lat, $lng),
            ];
        });
    }



    public function male(): static
    {
        /** @var Generator $faker */
        $faker = App::make(Generator::class);

        return $this->state([
            'sex' => 'male',
            'height' => $faker->numberBetween(170, 200),
        ]);
    }

    public function female(): static
    {
        /** @var Generator $faker */
        $faker = App::make(Generator::class);

        return $this->state([
            'sex' => 'female',
            'height' => $faker->numberBetween(150, 180),
        ]);
    }

    public function youngAdult(): static
    {
        /** @var Generator $faker */
        $faker = App::make(Generator::class);

        return $this->state([
            'age' => $faker->numberBetween(18, 30),
        ]);
    }

    public function withActivity(int $activityId): static
    {
        return $this->state([
            'activity_id' => $activityId,
        ]);
    }

    private static function makeCoordinates(?float $latitude, ?float $longitude): Point|array
    {
        $latitude ??= 0.0;
        $longitude ??= 0.0;

        if (config('database.use_postgis')) {
            return Point::make($latitude, $longitude, srid: 4326);
        }

        return [
            'latitude' => $latitude,
            'longitude' => $longitude,
        ];
    }
}
