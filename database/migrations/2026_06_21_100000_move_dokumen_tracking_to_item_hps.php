<?php

use App\Models\ItemHps;
use App\Models\SpjMakanMinumRapat;
use App\Support\DokumenFields;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('item_hps', function (Blueprint $table) {
            foreach (DokumenFields::keys() as $key) {
                $table->boolean($key)->default(false);
            }
            $table->boolean('kelengkapan_dokumen')->default(false);
        });

        ItemHps::query()->each(function (ItemHps $item) {
            $latestSpj = SpjMakanMinumRapat::query()
                ->where('item_hps_id', $item->id)
                ->latest()
                ->first();

            if (! $latestSpj) {
                return;
            }

            $payload = [];
            foreach (DokumenFields::keys() as $key) {
                $payload[$key] = (bool) $latestSpj->{$key};
            }
            $payload['kelengkapan_dokumen'] = (bool) $latestSpj->kelengkapan_dokumen;

            $item->update($payload);
        });

        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            foreach (DokumenFields::keys() as $key) {
                $table->dropColumn($key);
            }
            $table->dropColumn('kelengkapan_dokumen');
        });
    }

    public function down(): void
    {
        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            foreach (DokumenFields::keys() as $key) {
                $table->boolean($key)->default(false);
            }
            $table->boolean('kelengkapan_dokumen')->default(false);
        });

        SpjMakanMinumRapat::query()->with('itemHps')->each(function (SpjMakanMinumRapat $spj) {
            if (! $spj->itemHps) {
                return;
            }

            $payload = [];
            foreach (DokumenFields::keys() as $key) {
                $payload[$key] = (bool) $spj->itemHps->{$key};
            }
            $payload['kelengkapan_dokumen'] = (bool) $spj->itemHps->kelengkapan_dokumen;

            $spj->update($payload);
        });

        Schema::table('item_hps', function (Blueprint $table) {
            foreach (DokumenFields::keys() as $key) {
                $table->dropColumn($key);
            }
            $table->dropColumn('kelengkapan_dokumen');
        });
    }
};
