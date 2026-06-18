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
            'nama' => fake()->randomElement([
                'Catering Bu Yanti', 'Warung Makan Sederhana', 'Katering Berkah', 
                'RM Padang Salero', 'Snack & Bakery Makmur', 'Restoran Rasa Sayange',
                'Dapur Kito Catering', 'Amanah Food Service', 'Catering Nusantara',
                'Lestari Snack Box'
            ]) . ' ' . fake()->companySuffix(),
            'alamat' => fake()->address(),
            'telepon' => fake()->phoneNumber(),
        ];
    }
}
