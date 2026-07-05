<?php

namespace App\Http\Controllers;

use App\Models\Penyedia;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PenyediaController extends Controller
{
    public function index()
    {
        $penyedias = Penyedia::orderBy('nama')->get();
        return Inertia::render('penyedia/index', ['penyedias' => $penyedias]);
    }

    public function create()
    {
        return Inertia::render('penyedia/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:penyedias,nama',
            'alamat' => 'nullable|string|max:500',
            'telepon' => 'nullable|string|max:50',
        ], [
            'nama.unique' => 'Nama sudah terdaftar.',
        ]);

        Penyedia::create($request->only('nama', 'alamat', 'telepon'));

        return redirect()->route('penyedia.index')->with('success', 'Penyedia berhasil ditambahkan');
    }

    public function edit(Penyedia $penyedia)
    {
        return Inertia::render('penyedia/edit', ['penyedia' => $penyedia]);
    }

    public function update(Request $request, Penyedia $penyedia)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:penyedias,nama,'.$penyedia->id,
            'alamat' => 'nullable|string|max:500',
            'telepon' => 'nullable|string|max:50',
        ], [
            'nama.unique' => 'Nama sudah terdaftar.',
        ]);

        $penyedia->update($request->only('nama', 'alamat', 'telepon'));

        return redirect()->route('penyedia.index')->with('success', 'Penyedia berhasil diupdate');
    }

    public function destroy(Penyedia $penyedia)
    {
        $penyedia->delete();

        return redirect()->route('penyedia.index')->with('success', 'Penyedia berhasil dihapus');
    }
}
