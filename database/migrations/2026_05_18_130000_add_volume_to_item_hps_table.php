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
        Schema::table('item_hps', function (Blueprint $table) {
            $table->decimal('volume', 15, 2)->default(0)->after('nama_item');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('item_hps', function (Blueprint $table) {
            $table->dropColumn('volume');
        });
    }
};
