<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $this->initializeFreeMaleUsers();

        $this->grantPremiumToFemaleUsers();
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::table('user_swipe_state')->truncate();

        DB::table('users')
            ->whereNotNull('initial_premium_granted_at')
            ->update([
                'is_premium' => false,
                'initial_premium_granted_at' => null,
            ]);

        DB::table('telegram_subscriptions')
            ->where('plan', 'month')
            ->whereRaw('active_until >= NOW()')
            ->whereIn('user_id', function ($query) {
                $query->select('id')
                    ->from('users')
                    ->whereNotNull('initial_premium_granted_at');
            })
            ->delete();
    }

    private function initializeFreeMaleUsers(): void
    {
        $freeMaleUsers = DB::table('users')
            ->join('user_feed_profile', 'users.id', '=', 'user_feed_profile.user_id')
            ->where('users.is_premium', false)
            ->where('user_feed_profile.sex', 'male')
            ->whereNull('users.deleted_at')
            ->select('users.id')
            ->get();

        foreach ($freeMaleUsers as $user) {
            DB::table('user_swipe_state')->insert([
                'user_id' => $user->id,
                'current_phase' => 'cooldown',
                'phase_started_at' => Carbon::now()->subHours(6),
                'swipes_used_in_phase' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    private function grantPremiumToFemaleUsers(): void
    {
        $femaleUsers = DB::table('users')
            ->join('user_feed_profile', 'users.id', '=', 'user_feed_profile.user_id')
            ->where('user_feed_profile.sex', 'female')
            ->whereNull('users.deleted_at')
            ->select('users.id', 'users.is_premium')
            ->get();

        foreach ($femaleUsers as $user) {
            if ($user->is_premium) {
                continue;
            }

            $activeUntil = Carbon::now()->addDays(30)->endOfDay();

            DB::table('telegram_subscriptions')->insert([
                'user_id' => $user->id,
                'plan' => 'month',
                'active_until' => $activeUntil,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('users')
                ->where('id', $user->id)
                ->update([
                    'is_premium' => true,
                    'initial_premium_granted_at' => now(),
                    'updated_at' => now(),
                ]);
        }
    }
};
