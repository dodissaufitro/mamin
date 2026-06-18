<?php

namespace Database\Factories;

use App\Models\Penyedia;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Penyedia>
 */
class PenyediaFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'nama' => fake()->company(),
            'alamat' => fake()->address(),
            'telepon' => fake()->phoneNumber(),
        ];
    }
}
