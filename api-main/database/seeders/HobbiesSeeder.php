<?php

namespace Database\Seeders;

use App\Models\Dictionary\Hobby;
use Illuminate\Database\Seeder;

class HobbiesSeeder extends Seeder
{
    private array $hobbies = [
        'reading',
        'cooking',
        'gardening',
        'painting',
        'photography',
        'hiking',
        'swimming',
        'cycling',
        'knitting',
        'writing',
        'drawing',
        'fishing',
        'dancing',
        'singing',
        'gaming',
        'traveling',
        'collecting',
        'woodworking',
        'pottery',
        'meditation'
    ];
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->hobbies as $hobby) {
            Hobby::query()->create([
                'title' => $hobby,
                'emoji' => null
            ]);
        }
    }
}
