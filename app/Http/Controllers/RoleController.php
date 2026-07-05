<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleController extends Controller
{
    public function index()
    {
        $roles = Role::with('permissions')->get();
        return Inertia::render('roles/index', [
            'roles' => $roles
        ]);
    }

    public function create()
    {
        return Inertia::render('roles/create', [
            'permissions' => Permission::all()
        ]);
    }

    public function store(Request $request)
    {
        $request->merge([
            'name' => \Illuminate\Support\Str::slug($request->name, '_')
        ]);

        $request->validate([
            'name' => ['required', 'string', Rule::unique('roles', 'name')],
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name'
        ], [
            'name.unique' => 'Nama sudah terdaftar.',
        ]);

        $role = Role::create(['name' => $request->name]);
        
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        }

        return redirect()->route('roles.index')->with('success', 'Role berhasil dibuat');
    }

    public function edit(Role $role)
    {
        $role->load('permissions');
        return Inertia::render('roles/edit', [
            'role' => $role,
            'permissions' => Permission::all()
        ]);
    }

    public function update(Request $request, Role $role)
    {
        $request->merge([
            'name' => \Illuminate\Support\Str::slug($request->name, '_')
        ]);

        $request->validate([
            'name' => ['required', 'string', Rule::unique('roles', 'name')->ignore($role->id)],
            'permissions' => 'array',
            'permissions.*' => 'exists:permissions,name'
        ], [
            'name.unique' => 'Nama sudah terdaftar.',
        ]);

        $role->update(['name' => $request->name]);
        
        if ($request->has('permissions')) {
            $role->syncPermissions($request->permissions);
        } else {
            $role->syncPermissions([]);
        }

        return redirect()->route('roles.index')->with('success', 'Role berhasil diupdate');
    }

    public function destroy(Role $role)
    {
        if ($role->name === 'super_admin') {
            return redirect()->route('roles.index')->with('error', 'Role super_admin tidak boleh dihapus');
        }

        $role->delete();

        return redirect()->route('roles.index')->with('success', 'Role berhasil dihapus');
    }
}
