<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $profiles = DB::table('user_feed_profile')
            ->whereNotNull('activity_id')
            ->get();

        $existingActivityIds = DB::table('activities')
            ->pluck('id')
            ->toArray();

        foreach ($profiles as $profile) {
            if (!in_array($profile->activity_id, $existingActivityIds, true)) {
                continue;
            }

            DB::table('user_feed_profile_activities')->insertOrIgnore([
                'user_feed_profile_id' => $profile->id,
                'activity_id' => $profile->activity_id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        DB::table('user_feed_profile_activities')->truncate();
    }
};

