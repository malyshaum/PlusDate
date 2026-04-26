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
        $driver = Schema::getConnection()->getDriverName();
        $usePostgis = config('database.use_postgis');

        if ($driver === 'sqlite' || ! $usePostgis) {
            Schema::table('cities', function (Blueprint $table) {
                $table->string('ru_name')->nullable()->change();
                $table->string('timezone')->nullable()->change();

                if (! Schema::hasColumn('cities', 'location')) {
                    $table->json('location')->nullable();
                }
            });

            Schema::table('countries', function (Blueprint $table) {
                $table->string('ru_name')->nullable()->change();
                $table->float('latitude')->nullable()->change();
                $table->float('longitude')->nullable()->change();
                $table->string('timezone')->nullable()->change();
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
