<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function index()
    {
        $users = User::with('roles')
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'created_at']);

        return Inertia::render('users/index', [
            'users' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->pluck('name')->first(),
                'role_label' => str($user->roles->pluck('name')->first())->title()->replace('_', ' '),
                'created_at' => $user->created_at,
            ]),
        ]);
    }

    public function create()
    {
        return Inertia::render('users/create', [
            'roles' => $this->roleOptions(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email',
            'password' => ['required', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
        ]);

        $user->assignRole($validated['role']);

        return redirect()->route('users.index')->with('success', 'User berhasil ditambahkan');
    }

    public function edit(User $user)
    {
        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->roles->pluck('name')->first(),
            ],
            'roles' => $this->roleOptions(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:users,email,'.$user->id,
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        if ($user->id === auth()->id() && $validated['role'] !== 'super_admin' && $user->hasRole('super_admin')) {
            return back()->withErrors(['role' => 'Anda tidak dapat mengubah role akun Anda sendiri jika Anda adalah super admin.']);
        }

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = $validated['password'];
        }

        $user->update($payload);
        $user->syncRoles([$validated['role']]);

        return redirect()->route('users.index')->with('success', 'User berhasil diupdate');
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Anda tidak dapat menghapus akun sendiri.');
        }

        $user->delete();

        return redirect()->route('users.index')->with('success', 'User berhasil dihapus');
    }

    private function roleOptions(): array
    {
        return Role::all()->map(function ($role) {
            return [
                'value' => $role->name,
                'label' => str($role->name)->title()->replace('_', ' ')->toString()
            ];
        })->toArray();
    }
}
