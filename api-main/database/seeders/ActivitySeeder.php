<?php

namespace Database\Seeders;

use App\Models\Dictionary\Activity;
use Illuminate\Database\Seeder;

class ActivitySeeder extends Seeder
{
    private array $activities = [
        "it_specialist",
        "doctor",
        "teacher",
        "cook",
        "driver",
        "builder",
        "designer",
        "accountant",
        "lawyer",
        "hairdresser",
        "mechanic",
        "salesperson",
        "photographer",
        "musician",
        "journalist",
        "pilot",
        "electrician",
        "artist",
        "translator",
        "manager"
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->activities as $activity) {
            Activity::query()->create(['title' => $activity]);
        }
    }
}
