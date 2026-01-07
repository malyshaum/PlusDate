<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('bot_blocked')->default(false)->after('blocked_at');
            $table->timestamp('bot_blocked_at')->nullable()->after('bot_blocked');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['bot_blocked', 'bot_blocked_at']);
        });
    }
};
