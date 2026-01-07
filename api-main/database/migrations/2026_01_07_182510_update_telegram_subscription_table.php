<?php

use App\Enums\Payment\SubscriptionTypeEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        $values = implode("', '", SubscriptionTypeEnum::values());

        DB::statement('ALTER TABLE telegram_subscriptions DROP CONSTRAINT IF EXISTS telegram_subscriptions_plan_check');

        DB::statement("ALTER TABLE telegram_subscriptions ADD CONSTRAINT telegram_subscriptions_plan_check CHECK (plan IN ('{$values}'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('telegram_subscriptions', function (Blueprint $table) {
            //
        });
    }
};
