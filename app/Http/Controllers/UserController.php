<?php

namespace App\Http\Controllers;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::query()
            ->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        return Inertia::render('users/index', [
            'users' => $users->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role instanceof UserRole ? $user->role->value : $user->role,
                'role_label' => $user->role instanceof UserRole ? $user->role->label() : $user->role,
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
            'role' => ['required', Rule::in(UserRole::values())],
        ]);

        User::create($validated);

        return redirect()->route('users.index')->with('success', 'User berhasil ditambahkan');
    }

    public function edit(User $user)
    {
        return Inertia::render('users/edit', [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role instanceof UserRole ? $user->role->value : $user->role,
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
            'role' => ['required', Rule::in(UserRole::values())],
        ]);

        if ($user->id === auth()->id() && $validated['role'] !== UserRole::SuperAdmin->value) {
            return back()->withErrors(['role' => 'Anda tidak dapat mengubah role akun sendiri.']);
        }

        $payload = [
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'],
        ];

        if (! empty($validated['password'])) {
            $payload['password'] = $validated['password'];
        }

        $user->update($payload);

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

    /**
     * @return list<array{value: string, label: string}>
     */
    private function roleOptions(): array
    {
        return array_map(
            fn (UserRole $role) => ['value' => $role->value, 'label' => $role->label()],
            UserRole::cases(),
        );
    }
}
