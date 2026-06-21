<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @return list<array{kode: string, nama: string}>
     */
    private function defaultJenis(): array
    {
        return [
            ['kode' => 'surat_undangan', 'nama' => 'Surat Undangan'],
            ['kode' => 'memo', 'nama' => 'Memo'],
            ['kode' => 'invoice', 'nama' => 'Invoice'],
            ['kode' => 'kwitansi', 'nama' => 'Kwitansi'],
            ['kode' => 'nib', 'nama' => 'NIB'],
            ['kode' => 'absen', 'nama' => 'Absen'],
            ['kode' => 'notulen', 'nama' => 'Notulen'],
            ['kode' => 'dokumentasi', 'nama' => 'Dokumentasi'],
        ];
    }

    public function up(): void
    {
        Schema::create('jenis_dokumens', function (Blueprint $table) {
            $table->id();
            $table->string('kode')->unique();
            $table->string('nama');
            $table->timestamps();
        });

        $now = now();
        foreach ($this->defaultJenis() as $jenis) {
            DB::table('jenis_dokumens')->insert([
                ...$jenis,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('jenis_dokumens');
    }
};
