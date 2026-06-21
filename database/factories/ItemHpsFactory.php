<?php

namespace Database\Factories;

use App\Models\ItemHps;
use App\Models\JenisDokumen;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ItemHps>
 */
class ItemHpsFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_item' => fake()->randomElement([
                'Nasi Kotak Ayam Bakar', 'Nasi Kotak Rendang', 'Snack Box Manis',
                'Snack Box Gurih', 'Prasmanan VIP', 'Prasmanan Reguler',
                'Kopi Tumbuk', 'Teh Manis Botol', 'Air Mineral Botol 600ml',
                'Kue Tampah', 'Nasi Tumpeng Mini', 'Buah Potong',
            ]),
            'volume' => fake()->randomElement([10, 20, 30, 50, 100]),
            'harga_unit' => fake()->randomElement([15000, 25000, 35000, 50000, 75000, 100000]),
        ];
    }

    public function configure(): static
    {
        return $this->afterCreating(function (ItemHps $item) {
            $kodes = JenisDokumen::defaultKodesForItem($item->nama_item);
            $ids = JenisDokumen::query()->whereIn('kode', $kodes)->pluck('id');
            $item->jenisDokumens()->sync($ids);
        });
    }
}
