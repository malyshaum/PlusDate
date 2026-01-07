<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('swipe_limits_config', function (Blueprint $table) {
            $table->id();
            $table->string('config_key', 100)->unique();
            $table->integer('config_value');
            $table->timestamps();
        });

        DB::table('swipe_limits_config')->insert([
            [
                'config_key' => 'free_male_initial_swipes',
                'config_value' => 100,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'config_key' => 'free_male_phase2_swipes',
                'config_value' => 50,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'config_key' => 'free_male_phase3_swipes',
                'config_value' => 25,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'config_key' => 'free_male_cooldown_swipes',
                'config_value' => 25,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'config_key' => 'cooldown_hours',
                'config_value' => 6,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'config_key' => 'premium_superlike_limit',
                'config_value' => 5,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'config_key' => 'free_superlike_limit',
                'config_value' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('swipe_limits_config');
    }
};
