<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_swipes', function (Blueprint $table) {
            if (!Schema::hasColumn('user_swipes', 'is_viewed')) {
                $table->boolean('is_viewed')->default(false);
            }
        });
    }

    public function down(): void
    {
        Schema::table('user_swipes', function (Blueprint $table) {
            $table->dropColumn('is_viewed');
        });
    }
};
