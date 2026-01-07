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
        Schema::create('reflinks', function (Blueprint $table) {
            $table->id();
            $table->string('source');
            $table->string('target')->nullable()->default('all');
            $table->double('price')->default(0);
            $table->integer('all')->default(0);
            $table->integer('unique')->default(0);
            $table->integer('subscriptions')->default(0);
            $table->string('admins')->nullable();
            $table->boolean('is_active')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('reflinks');
    }
};
