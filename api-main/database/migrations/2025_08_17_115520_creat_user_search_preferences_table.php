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
        Schema::create('user_search_preferences', function (Blueprint $table) {
            $table->id();
            $table->string('gender');
            $table->integer('search_for');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('city_id')->nullable();
            $table->boolean('include_nearby')->default(false);
            $table->boolean('with_video')->default(false);
            $table->integer('from_age');
            $table->integer('to_age');
            $table->boolean('expand_age_range')->default(false);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_search_preferences');
    }
};
