<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_deletion_snapshots', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->enum('deletion_type', ['USER_REQUESTED', 'ADMIN_PERMANENT']);
            $table->string('deletion_reason');
            $table->string('deletion_note')->nullable();

            $table->json('user_profile');
            $table->json('full_profile');
            $table->json('statistics');

            $table->unsignedBigInteger('deleted_by')->nullable();
            $table->timestamp('can_restore_until')->nullable();
            $table->timestamp('deleted_at');
            $table->timestamp('hard_deleted_at')->nullable();

            $table->index(['user_id', 'deletion_type']);
            $table->index('can_restore_until');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_deletion_snapshots');
    }
};
