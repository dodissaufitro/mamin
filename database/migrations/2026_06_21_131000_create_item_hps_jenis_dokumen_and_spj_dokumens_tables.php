<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('item_hps_jenis_dokumen', function (Blueprint $table) {
            $table->foreignId('item_hps_id')->constrained('item_hps')->cascadeOnDelete();
            $table->foreignId('jenis_dokumen_id')->constrained('jenis_dokumens')->cascadeOnDelete();
            $table->primary(['item_hps_id', 'jenis_dokumen_id']);
        });

        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            $table->boolean('kelengkapan_dokumen')->default(false)->after('link_spj');
        });

        Schema::create('spj_dokumens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('spj_makan_minum_rapat_id')->constrained('spj_makan_minum_rapats')->cascadeOnDelete();
            $table->foreignId('jenis_dokumen_id')->constrained('jenis_dokumens')->cascadeOnDelete();
            $table->string('file_path');
            $table->string('original_filename');
            $table->timestamps();

            $table->unique(['spj_makan_minum_rapat_id', 'jenis_dokumen_id'], 'spj_dokumen_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spj_dokumens');

        Schema::table('spj_makan_minum_rapats', function (Blueprint $table) {
            $table->dropColumn('kelengkapan_dokumen');
        });

        Schema::dropIfExists('item_hps_jenis_dokumen');
    }
};
