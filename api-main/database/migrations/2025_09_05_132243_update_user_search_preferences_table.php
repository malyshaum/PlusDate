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
        Schema::table('user_search_preferences', function (Blueprint $table) {
            $table->string('eye_color')->nullable();
            $table->integer('height')->nullable();
            $table->unsignedBigInteger('activity_id')->nullable();
            $table->jsonb('hobbies')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_search_preferences', function (Blueprint $table) {
            $table->dropColumn('eye_color');
            $table->dropColumn('height');
            $table->dropColumn('activity_id');
            $table->dropColumn('hobbies');
        });
    }
};
