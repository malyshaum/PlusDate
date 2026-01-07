<?php

use App\Enums\Payment\PaymentStatusEnum;
use App\Enums\Payment\PaymentTypeEnum;
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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('user_id')->index();
            $table->string('external_id');
            $table->integer('amount');
            $table->string('currency');
            $table->enum('type', PaymentTypeEnum::values());
            $table->json('metadata')->nullable();
            $table->enum('status',PaymentStatusEnum::values());
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};
