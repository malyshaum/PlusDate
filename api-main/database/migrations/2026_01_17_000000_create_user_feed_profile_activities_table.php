<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_feed_profile_activities', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_feed_profile_id');
            $table->unsignedBigInteger('activity_id');
            $table->timestamps();

            $table->foreign('user_feed_profile_id')
                ->references('id')
                ->on('user_feed_profile')
                ->onDelete('cascade');

            $table->foreign('activity_id')
                ->references('id')
                ->on('activities')
                ->onDelete('cascade');

            $table->unique(['user_feed_profile_id', 'activity_id'], 'user_feed_profile_activity_unique');
            $table->index('user_feed_profile_id');
            $table->index('activity_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_feed_profile_activities');
    }
};


