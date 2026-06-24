<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'superadmin@example.com'],
            [
                'name' => 'Super Admin',
                'password' => bcrypt('password'),
                'role' => UserRole::SuperAdmin,
            ]
        );

        User::updateOrCreate(
            ['email' => 'pic@example.com'],
            [
                'name' => 'PIC User',
                'password' => bcrypt('password'),
                'role' => UserRole::Pic,
            ]
        );

        User::updateOrCreate(
            ['email' => 'bendahara@example.com'],
            [
                'name' => 'Bendahara User',
                'password' => bcrypt('password'),
                'role' => UserRole::Bendahara,
            ]
        );

        $this->call([
            CurrentStateSeeder::class,
        ]);
    }
}
