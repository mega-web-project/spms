<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
public function up()
{
    Schema::table('drivers', function (Blueprint $table) {
        $table->enum('driver_type', ['staff', 'cargo'])->default('staff')->after('vehicle_id');
    });
}

public function down()
{
    Schema::table('drivers', function (Blueprint $table) {
        $table->dropColumn('driver_type');
    });
}

};
