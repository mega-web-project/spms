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
        // Change item_id to JSON to support multiple IDs
        $table->json('item_id')->nullable()->change();

        // Add item_names if not already there
        if (!Schema::hasColumn('check_in_outs', 'item_names')) {
            $table->json('item_names')->nullable()->after('item_id');
        }

        // Add checkpoint_name if not already there
        if (!Schema::hasColumn('check_in_outs', 'checkpoint_name')) {
            $table->string('checkpoint_name')->nullable();
        }
    });
}

public function down()
{
    Schema::table('check_in_outs', function (Blueprint $table) {
        $table->dropColumn(['item_names', 'checkpoint_name']);
        // You may optionally revert item_id back to integer
        $table->integer('item_id')->nullable()->change();
    });
}

};
