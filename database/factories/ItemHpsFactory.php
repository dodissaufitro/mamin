<?php

namespace Database\Factories;

use App\Models\ItemHps;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ItemHps>
 */
class ItemHpsFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama_item' => fake()->words(3, true),
            'volume' => fake()->randomFloat(2, 1, 100),
            'harga_unit' => fake()->randomFloat(2, 10000, 1000000),
        ];
    }
}
