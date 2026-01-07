<?php

use Database\Seeders\HobbiesSeeder;
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
        Schema::create('hobbies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('emoji')->nullable();
        });


        (new HobbiesSeeder())->run();;
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('hobbies');
    }
};
