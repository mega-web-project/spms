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
    Schema::table('check_in_outs', function (Blueprint $table) {
        $table->json('item_names')->nullable()->after('item_id');
        $table->string('checkpoint_name')->nullable();
    });
}

public function down()
{
    Schema::table('check_in_outs', function (Blueprint $table) {
        $table->dropColumn(['item_name', 'checkpoint_name']);
    });
}

};
