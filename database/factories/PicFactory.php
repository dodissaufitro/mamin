<?php

namespace Database\Factories;

use App\Models\Pic;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Pic>
 */
class PicFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama' => fake()->name(),
            'jabatan' => fake()->jobTitle(),
        ];
    }
}
