<?php

use App\Enums\Telegram\BotNotificationTypeEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('user_bot_notifications', function (Blueprint $table) {
            $table->unsignedBigInteger('user_id')->index();
            $table->enum('type', BotNotificationTypeEnum::values());
            $table->timestamp('created_at')->useCurrent();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_bot_notifications');
    }
};
