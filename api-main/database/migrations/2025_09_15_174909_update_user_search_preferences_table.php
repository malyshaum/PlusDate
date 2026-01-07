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
            $table->dropColumn('search_for');
            $table->string('search_for')->nullable();
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
