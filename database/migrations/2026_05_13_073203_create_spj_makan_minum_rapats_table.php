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
        Schema::create('spj_makan_minum_rapats', function (Blueprint $table) {
           $table->id();

            $table->date('tanggal_pemesanan')->nullable();
            $table->date('tanggal_kegiatan')->nullable();
            $table->date('deadline_spj')->nullable();

            $table->string('pic_penanggung_jawab')->nullable();
            $table->string('kegiatan')->nullable();
            $table->string('penyedia')->nullable();
            $table->integer('jumlah_order')->nullable();

            // Tracking Dokumen
            $table->boolean('surat_undangan')->default(false);
            $table->boolean('memo')->default(false);
            $table->boolean('invoice')->default(false);
            $table->boolean('kwitansi')->default(false);
            $table->boolean('nib')->default(false);
            $table->boolean('absen')->default(false);
            $table->boolean('notulen')->default(false);
            $table->boolean('dokumentasi')->default(false);

            // Tracking SPJ
            $table->boolean('kelengkapan_dokumen')->default(false);
            $table->boolean('pembayaran_spj')->default(false);

            // PIC Tracking
            $table->string('kasubbag_kasi')->nullable();
            $table->string('staf')->nullable();

            $table->text('link_spj')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('spj_makan_minum_rapats');
    }
};
