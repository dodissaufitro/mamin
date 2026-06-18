<?php

namespace Database\Factories;

use App\Models\SpjMakanMinumRapat;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SpjMakanMinumRapat>
 */
class SpjMakanMinumRapatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'tanggal_pemesanan' => fake()->dateTimeBetween('-2 months', 'now')->format('Y-m-d'),
            'tanggal_kegiatan' => fake()->dateTimeBetween('now', '+1 month')->format('Y-m-d'),
            'deadline_spj' => fake()->dateTimeBetween('+1 month', '+2 months')->format('Y-m-d'),
            'pic_id' => \App\Models\Pic::inRandomOrder()->first()->id ?? 1,
            'penyedia_id' => \App\Models\Penyedia::inRandomOrder()->first()->id ?? 1,
            'kegiatan' => fake()->randomElement([
                'Rapat Koordinasi Bulanan', 'Sosialisasi Program Baru', 
                'Bimbingan Teknis Karyawan', 'Rapat Evaluasi Kinerja',
                'Penyusunan Anggaran', 'Rapat Persiapan Acara',
                'FGD (Focus Group Discussion)', 'Rapat Dengar Pendapat'
            ]) . ' ' . fake()->year(),
            'item_hps_id' => \App\Models\ItemHps::inRandomOrder()->first()->id ?? 1,
            'jumlah_order' => fake()->numberBetween(10, 100),
            'total_harga' => fake()->randomFloat(2, 500000, 5000000),
            'surat_undangan' => fake()->boolean(80),
            'memo' => fake()->boolean(80),
            'invoice' => fake()->boolean(60),
            'kwitansi' => fake()->boolean(60),
            'nib' => fake()->boolean(90),
            'absen' => fake()->boolean(50),
            'notulen' => fake()->boolean(50),
            'dokumentasi' => fake()->boolean(70),
            'kelengkapan_dokumen' => fake()->boolean(40),
            'pembayaran_spj' => fake()->boolean(30),
            'tracking_spj' => fake()->randomElement(['Draft', 'Dalam Proses', 'Selesai']),
            'kasubbag_kasi' => fake()->name(),
            'staf' => fake()->name(),
            'link_spj' => fake()->url(),
        ];
    }
}
