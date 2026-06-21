<?php

use App\Models\ItemHps;
use App\Support\DokumenFields;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('item_hps', 'surat_undangan_aktif')) {
            Schema::table('item_hps', function (Blueprint $table) {
                foreach (DokumenFields::keys() as $key) {
                    $table->boolean(DokumenFields::aktifColumn($key))->default(false);
                }
            });
        }

        ItemHps::query()->each(function (ItemHps $item) {
            $payload = [];
            foreach (DokumenFields::keys() as $key) {
                $wasComplete = (bool) $item->{$key};
                $inLegacyApplicable = in_array($key, DokumenFields::defaultAktifFor($item->nama_item), true);
                $payload[DokumenFields::aktifColumn($key)] = $wasComplete || $inLegacyApplicable;
            }
            $item->update($payload);
            $item->update(DokumenFields::withKelengkapan($item->fresh()->toArray()));
        });
    }

    public function down(): void
    {
        Schema::table('item_hps', function (Blueprint $table) {
            foreach (DokumenFields::keys() as $key) {
                $table->dropColumn(DokumenFields::aktifColumn($key));
            }
        });
    }
};
