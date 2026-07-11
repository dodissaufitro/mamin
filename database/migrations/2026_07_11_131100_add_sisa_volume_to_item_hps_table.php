<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('item_hps', function (Blueprint $table) {
            $table->decimal('sisa_volume', 15, 2)->default(0)->after('volume');
        });

        // 1. Move current `volume` to `sisa_volume` because current `volume` acts as sisa_volume
        DB::statement('UPDATE item_hps SET sisa_volume = volume');

        // 2. Calculate the original total volume
        // volume = sisa_volume + sum(jumlah_order) from spj_items
        DB::statement('
            UPDATE item_hps 
            SET volume = sisa_volume + IFNULL(
                (SELECT SUM(jumlah_order) FROM spj_items WHERE spj_items.item_hps_id = item_hps.id), 0
            )
        ');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Revert `volume` back to its remaining state (which is currently in `sisa_volume`)
        DB::statement('UPDATE item_hps SET volume = sisa_volume');

        Schema::table('item_hps', function (Blueprint $table) {
            $table->dropColumn('sisa_volume');
        });
    }
};
