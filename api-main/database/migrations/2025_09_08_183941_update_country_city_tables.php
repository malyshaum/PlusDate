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
        if (Schema::getConnection()->getDriverName() === 'sqlite') {
            Schema::table('cities', function (Blueprint $table) {
                $table->json('location')->nullable();
            });

            return;
        }

        Schema::table('cities', function (Blueprint $table) {
            $table->string('ru_name')->nullable()->change();
            $table->string('timezone')->nullable()->change();
            $table->geography('location', subtype: 'point')->nullable()->index();
            $table->dropColumn(['latitude', 'longitude']);
        });

        Schema::table('countries', function (Blueprint $table) {
            $table->string('ru_name')->nullable()->change();
            $table->float('latitude')->nullable()->change();
            $table->float('longitude')->nullable()->change();
            $table->string('timezone')->nullable()->change();
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
