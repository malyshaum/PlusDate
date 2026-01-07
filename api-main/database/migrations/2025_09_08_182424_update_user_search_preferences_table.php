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
            $table->dropColumn('height');
            $table->integer('height_from')->nullable();
            $table->integer('height_to')->nullable();
            $table->dropColumn('eye_color');
            $table->jsonb('eye_color')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_search_preferences', function (Blueprint $table) {
            //
        });
    }
};
