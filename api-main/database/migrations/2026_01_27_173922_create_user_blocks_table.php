<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_blocks', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('blocked_user_id');
            $table->timestamps();

            $table->foreign('user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->foreign('blocked_user_id')
                ->references('id')
                ->on('users')
                ->onDelete('cascade');

            $table->unique(['user_id', 'blocked_user_id'], 'user_blocks_unique');
            $table->index('user_id', 'user_blocks_user_id_idx');
            $table->index('blocked_user_id', 'user_blocks_blocked_user_id_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_blocks');
    }
};
