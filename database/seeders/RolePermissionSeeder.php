<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // We wipe old permissions entirely to migrate to the new granular ones
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('role_has_permissions')->truncate();
        DB::table('permissions')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $menus = [
            'dashboard' => ['view'],
            'spj' => ['view', 'create', 'update', 'delete'],
            'pic' => ['view', 'create', 'update', 'delete'],
            'penyedia' => ['view', 'create', 'update', 'delete'],
            'item_hps' => ['view', 'create', 'update', 'delete'],
            'jenis_dokumen' => ['view', 'create', 'update', 'delete'],
            'users' => ['view', 'create', 'update', 'delete'],
            'roles' => ['view', 'create', 'update', 'delete'],
            'inbox' => ['view'],
            'tracking_spj' => ['update'],
        ];

        $allPermissions = [];
        foreach ($menus as $menu => $cruds) {
            foreach ($cruds as $crud) {
                $permName = "{$menu}.{$crud}";
                Permission::firstOrCreate(['name' => $permName]);
                $allPermissions[] = $permName;
            }
        }

        // Create roles and assign permissions
        $roleSuperAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $roleSuperAdmin->syncPermissions($allPermissions);

        $rolePic = Role::firstOrCreate(['name' => 'pic']);
        $rolePic->syncPermissions([
            'dashboard.view',
            'spj.view', 'spj.create', 'spj.delete',
        ]);

        $roleBendahara = Role::firstOrCreate(['name' => 'bendahara']);
        $roleBendahara->syncPermissions([
            'dashboard.view',
            'spj.view', 'spj.update',
            'inbox.view',
        ]);

        // Assign existing users to the new roles based on their old string roles
        $users = User::all();
        foreach ($users as $user) {
            $rawRole = $user->getAttributes()['role'] ?? null;
            if ($rawRole) {
                if (in_array($rawRole, ['super_admin', 'pic', 'bendahara'])) {
                    if (!$user->hasRole($rawRole)) {
                        $user->assignRole($rawRole);
                    }
                }
            }
        }
    }
}
