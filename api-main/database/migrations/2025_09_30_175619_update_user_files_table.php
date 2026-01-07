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
        Schema::table('user_files', function (Blueprint $table) {
            $table->unsignedBigInteger('file_id')->nullable();
            $table->boolean('is_under_moderation')->default(false);
            $table->softDeletes();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_files', function (Blueprint $table) {
            $table->dropColumn('file_id');
            $table->dropColumn('is_under_moderation');
            $table->dropSoftDeletes();
        });
    }
};
