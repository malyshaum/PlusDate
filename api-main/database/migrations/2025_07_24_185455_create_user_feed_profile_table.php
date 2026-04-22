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
        Schema::create('user_feed_profile', function (Blueprint $table) {
            $driver = Schema::getConnection()->getDriverName();

            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->foreign('user_id')->references('id')->on('users');

            $table->unsignedBigInteger('country_id')->nullable();
            $table->foreign('country_id')->references('id')->on('countries');

            $table->unsignedBigInteger('city_id')->nullable();
            $table->foreign('city_id')->references('id')->on('cities');

            $table->unsignedBigInteger('activity_id')->nullable();

            $table->string('sex');
            $table->date('birthday');
            $table->integer('search_for');
            $table->integer('height')->nullable();
            $table->string('eye_color')->nullable();
            if ($driver === 'sqlite') {
                $table->json('coordinates')->nullable();
            } else {
                $table->geography('coordinates', subtype: 'point');
            }
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_feed_profile');
    }
};
