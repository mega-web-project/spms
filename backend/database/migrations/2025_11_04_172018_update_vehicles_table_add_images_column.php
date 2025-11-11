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
        Schema::table('vehicles', function (Blueprint $table) {
            // If old 'image' column exists, drop or rename it
            if (Schema::hasColumn('vehicles', 'image')) {
                $table->dropColumn('image');
            }

            // Add new JSON column for multiple images
            $table->json('images')->nullable()->after('color');
        });
    }

    public function down(): void
    {
        Schema::table('vehicles', function (Blueprint $table) {
            $table->dropColumn('images');
            $table->string('image')->nullable(); // restore if rolled back
        });
    }
};
