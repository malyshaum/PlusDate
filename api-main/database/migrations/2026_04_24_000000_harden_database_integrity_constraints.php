<?php

use App\Enums\Core\GenderEnum;
use App\Enums\Core\SearchForEnum;
use App\Enums\Core\SwipeActionEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'pgsql') {
            return;
        }

        $genderValues = implode("','", array_map(static fn (GenderEnum $case) => $case->value, GenderEnum::cases()));
        $searchForValues = implode("','", array_map(static fn (SearchForEnum $case) => $case->value, SearchForEnum::cases()));
        $swipeActionValues = implode("','", array_map(static fn (SwipeActionEnum $case) => $case->value, SwipeActionEnum::cases()));

        DB::unprepared(<<<SQL
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_user_fk') THEN
        ALTER TABLE user_search_preferences
            ADD CONSTRAINT user_search_preferences_user_fk
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_city_fk') THEN
        ALTER TABLE user_search_preferences
            ADD CONSTRAINT user_search_preferences_city_fk
            FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_activity_fk') THEN
        ALTER TABLE user_search_preferences
            ADD CONSTRAINT user_search_preferences_activity_fk
            FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE SET NULL;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_user_unique') THEN
        ALTER TABLE user_search_preferences
            ADD CONSTRAINT user_search_preferences_user_unique
            UNIQUE (user_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_age_range_check') THEN
        ALTER TABLE user_search_preferences
            ADD CONSTRAINT user_search_preferences_age_range_check
            CHECK (from_age <= to_age);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_height_range_check') THEN
        ALTER TABLE user_search_preferences
            ADD CONSTRAINT user_search_preferences_height_range_check
            CHECK (
                height_from IS NULL OR
                height_to IS NULL OR
                height_from <= height_to
            );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_gender_check') THEN
        ALTER TABLE user_search_preferences
            ADD CONSTRAINT user_search_preferences_gender_check
            CHECK (gender IN ('$genderValues'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_search_for_check') THEN
        ALTER TABLE user_search_preferences
            ADD CONSTRAINT user_search_preferences_search_for_check
            CHECK (search_for IS NULL OR search_for IN ('$searchForValues'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_search_preferences_city_idx') THEN
        CREATE INDEX user_search_preferences_city_idx ON user_search_preferences(city_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_swipes_user_fk') THEN
        ALTER TABLE user_swipes
            ADD CONSTRAINT user_swipes_user_fk
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_swipes_profile_fk') THEN
        ALTER TABLE user_swipes
            ADD CONSTRAINT user_swipes_profile_fk
            FOREIGN KEY (profile_id) REFERENCES user_feed_profile(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_swipes_action_check') THEN
        ALTER TABLE user_swipes
            ADD CONSTRAINT user_swipes_action_check
            CHECK (action IN ('$swipeActionValues'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_swipes_self_reference_check') THEN
        ALTER TABLE user_swipes
            ADD CONSTRAINT user_swipes_self_reference_check
            CHECK (user_id <> profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_swipes_user_profile_idx') THEN
        CREATE INDEX user_swipes_user_profile_idx ON user_swipes(user_id, profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_user_fk') THEN
        ALTER TABLE transactions
            ADD CONSTRAINT transactions_user_fk
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_amount_non_negative_check') THEN
        ALTER TABLE transactions
            ADD CONSTRAINT transactions_amount_non_negative_check
            CHECK (amount >= 0);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'transactions_user_status_created_idx') THEN
        CREATE INDEX transactions_user_status_created_idx ON transactions(user_id, status, created_at);
    END IF;
END
$$;
SQL);
    }

    public function down(): void
    {
        if (Schema::getConnection()->getDriverName() !== 'pgsql') {
            return;
        }

        DB::unprepared(<<<'SQL'
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'transactions_user_status_created_idx') THEN
        DROP INDEX transactions_user_status_created_idx;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_amount_non_negative_check') THEN
        ALTER TABLE transactions DROP CONSTRAINT transactions_amount_non_negative_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'transactions_user_fk') THEN
        ALTER TABLE transactions DROP CONSTRAINT transactions_user_fk;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_swipes_user_profile_idx') THEN
        DROP INDEX user_swipes_user_profile_idx;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_swipes_self_reference_check') THEN
        ALTER TABLE user_swipes DROP CONSTRAINT user_swipes_self_reference_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_swipes_action_check') THEN
        ALTER TABLE user_swipes DROP CONSTRAINT user_swipes_action_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_swipes_profile_fk') THEN
        ALTER TABLE user_swipes DROP CONSTRAINT user_swipes_profile_fk;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_swipes_user_fk') THEN
        ALTER TABLE user_swipes DROP CONSTRAINT user_swipes_user_fk;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_search_preferences_city_idx') THEN
        DROP INDEX user_search_preferences_city_idx;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_search_for_check') THEN
        ALTER TABLE user_search_preferences DROP CONSTRAINT user_search_preferences_search_for_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_gender_check') THEN
        ALTER TABLE user_search_preferences DROP CONSTRAINT user_search_preferences_gender_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_height_range_check') THEN
        ALTER TABLE user_search_preferences DROP CONSTRAINT user_search_preferences_height_range_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_age_range_check') THEN
        ALTER TABLE user_search_preferences DROP CONSTRAINT user_search_preferences_age_range_check;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_user_unique') THEN
        ALTER TABLE user_search_preferences DROP CONSTRAINT user_search_preferences_user_unique;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_activity_fk') THEN
        ALTER TABLE user_search_preferences DROP CONSTRAINT user_search_preferences_activity_fk;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_city_fk') THEN
        ALTER TABLE user_search_preferences DROP CONSTRAINT user_search_preferences_city_fk;
    END IF;
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'user_search_preferences_user_fk') THEN
        ALTER TABLE user_search_preferences DROP CONSTRAINT user_search_preferences_user_fk;
    END IF;
END
$$;
SQL);
    }
};
