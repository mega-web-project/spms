<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('check_in_outs', function (Blueprint $table) {
            $table->id();

            // Common for both vehicles & visitors
            $table->enum('type', ['vehicle', 'visitor']);
            $table->unsignedBigInteger('item_id'); // references vehicle_id or visitor_id
            $table->unsignedBigInteger('checkpoint_id');
            $table->string('shift')->nullable();
            $table->text('purpose')->nullable();

            // Sign-in / Sign-out info
            $table->unsignedBigInteger('checked_in_by')->nullable();
            $table->timestamp('checked_in_at')->nullable();
            $table->unsignedBigInteger('checked_out_by')->nullable();
            $table->timestamp('checked_out_at')->nullable();

            $table->enum('status', ['checked-in', 'checked-out'])->default('checked-in');

            $table->timestamps();

            // Foreign keys
            $table->foreign('checkpoint_id')->references('id')->on('checkpoints')->cascadeOnDelete();
            $table->foreign('checked_in_by')->references('id')->on('users')->nullOnDelete();
            $table->foreign('checked_out_by')->references('id')->on('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('check_in_outs');
    }
};
