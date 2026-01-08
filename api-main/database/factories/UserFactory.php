<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class UserFactory extends Factory
{
    protected $model = User::class;

    public function definition(): array
    {
        return [
            'username' => $this->faker->unique()->userName,
            'name' => $this->faker->name,
            'photo_url' => $this->faker->imageUrl(400, 400, 'people'),
            'is_onboarded' => false,
            'is_under_moderation' => false,
        ];
    }
}
