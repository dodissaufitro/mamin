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
        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            $table->foreignId('item_hps_id')
                ->nullable()
                ->after('kegiatan')
                ->constrained('item_hps')
                ->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            $table->dropForeign(['item_hps_id']);
            $table->dropColumn('item_hps_id');
        });
    }
};
