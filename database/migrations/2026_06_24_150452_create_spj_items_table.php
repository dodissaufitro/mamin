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
        Schema::create('spj_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spj_makan_minum_rapat_id')->constrained()->cascadeOnDelete();
            $table->foreignId('item_hps_id')->constrained('item_hps')->cascadeOnDelete();
            $table->decimal('jumlah_order', 10, 2);
            $table->decimal('total_harga', 15, 2);
            $table->timestamps();
        });

        // Migrate existing data
        DB::table('spj_makan_minum_rapats')->orderBy('id')->chunk(100, function ($spjs) {
            $items = [];
            foreach ($spjs as $spj) {
                if ($spj->item_hps_id) {
                    $items[] = [
                        'spj_makan_minum_rapat_id' => $spj->id,
                        'item_hps_id' => $spj->item_hps_id,
                        'jumlah_order' => $spj->jumlah_order ?? 0,
                        'total_harga' => $spj->total_harga ?? 0,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
            if (count($items) > 0) {
                DB::table('spj_items')->insert($items);
            }
        });

        // Drop columns from spj_makan_minum_rapats
        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            $table->dropForeign(['item_hps_id']);
            $table->dropColumn(['item_hps_id', 'jumlah_order', 'total_harga']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            $table->foreignId('item_hps_id')->nullable()->constrained('item_hps')->nullOnDelete();
            $table->decimal('jumlah_order', 10, 2)->nullable();
            $table->decimal('total_harga', 15, 2)->nullable();
        });

        // Restore data from first spj_item for each spj
        DB::table('spj_makan_minum_rapats')->orderBy('id')->chunk(100, function ($spjs) {
            foreach ($spjs as $spj) {
                $item = DB::table('spj_items')->where('spj_makan_minum_rapat_id', $spj->id)->first();
                if ($item) {
                    DB::table('spj_makan_minum_rapats')->where('id', $spj->id)->update([
                        'item_hps_id' => $item->item_hps_id,
                        'jumlah_order' => $item->jumlah_order,
                        'total_harga' => $item->total_harga,
                    ]);
                }
            }
        });

        Schema::dropIfExists('spj_items');
    }
};
