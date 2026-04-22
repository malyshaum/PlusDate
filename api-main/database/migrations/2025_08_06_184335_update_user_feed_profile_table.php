<?php

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
        Schema::table('user_feed_profile', function (Blueprint $table) {
            $table->dropColumn('height');
            $table->dropColumn('activity_id');

            if (Schema::getConnection()->getDriverName() !== 'sqlite') {
                $table->vector('vector')->nullable()->change();
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        //
    }
};
