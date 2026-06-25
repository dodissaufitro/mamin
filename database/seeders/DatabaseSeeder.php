<?php

namespace Database\Seeders;

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
                'role' => 'super_admin',
            ]
        );

        User::updateOrCreate(
            ['email' => 'pic@example.com'],
            [
                'name' => 'PIC User',
                'password' => bcrypt('password'),
                'role' => 'pic',
            ]
        );

        User::updateOrCreate(
            ['email' => 'bendahara@example.com'],
            [
                'name' => 'Bendahara User',
                'password' => bcrypt('password'),
                'role' => 'bendahara',
            ]
        );

        User::updateOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'role' => 'admin',
            ]
        );

        $this->call([
            RolePermissionSeeder::class,
        ]);
    }
}
