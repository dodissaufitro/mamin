<?php

use App\Support\DokumenFields;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $jenisByKode = DB::table('jenis_dokumens')->pluck('id', 'kode');

        if (Schema::hasColumn('item_hps', 'surat_undangan_aktif')) {
            $items = DB::table('item_hps')->get();

            foreach ($items as $item) {
                foreach (DokumenFields::keys() as $key) {
                    $aktifColumn = DokumenFields::aktifColumn($key);
                    if (! empty($item->{$aktifColumn}) && isset($jenisByKode[$key])) {
                        DB::table('item_hps_jenis_dokumen')->insertOrIgnore([
                            'item_hps_id' => $item->id,
                            'jenis_dokumen_id' => $jenisByKode[$key],
                        ]);
                    }
                }
            }

            Schema::table('item_hps', function (Blueprint $table) {
                $columns = array_merge(
                    DokumenFields::keys(),
                    DokumenFields::aktifColumns(),
                    ['kelengkapan_dokumen'],
                );

                $table->dropColumn($columns);
            });
        }
    }

    public function down(): void
    {
        Schema::table('item_hps', function (Blueprint $table) {
            foreach (DokumenFields::keys() as $key) {
                $table->boolean($key)->default(false);
                $table->boolean(DokumenFields::aktifColumn($key))->default(true);
            }
            $table->boolean('kelengkapan_dokumen')->default(false);
        });

        $kodeById = DB::table('jenis_dokumens')->pluck('kode', 'id');
        $pivotRows = DB::table('item_hps_jenis_dokumen')->get();

        foreach ($pivotRows as $row) {
            $kode = $kodeById[$row->jenis_dokumen_id] ?? null;
            if (! $kode) {
                continue;
            }

            DB::table('item_hps')->where('id', $row->item_hps_id)->update([
                DokumenFields::aktifColumn($kode) => true,
            ]);
        }
    }
};
