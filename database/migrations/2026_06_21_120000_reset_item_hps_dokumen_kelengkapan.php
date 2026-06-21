<?php

use App\Models\ItemHps;
use App\Support\DokumenFields;
use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    public function up(): void
    {
        ItemHps::query()->each(function (ItemHps $item) {
            $payload = array_fill_keys(DokumenFields::keys(), false);
            $payload['kelengkapan_dokumen'] = false;

            $item->update($payload);
        });
    }

    public function down(): void
    {
        //
    }
};
