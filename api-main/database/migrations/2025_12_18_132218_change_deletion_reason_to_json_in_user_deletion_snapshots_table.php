<?php

use App\Models\User\UserDeletionSnapshot;
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
        UserDeletionSnapshot::query()->truncate();
        Schema::table('user_deletion_snapshots', function (Blueprint $table) {
            $table->dropColumn('deletion_reason');
            $table->json('deletion_reasons')->after('deletion_type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('user_deletion_snapshots', function (Blueprint $table) {
            $table->dropColumn('deletion_reasons');
            $table->string('deletion_reason')->after('deletion_type');
        });
    }
};
