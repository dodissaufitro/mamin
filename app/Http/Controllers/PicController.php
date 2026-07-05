<?php

namespace App\Http\Controllers;

use App\Models\Pic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PicController extends Controller
{
    public function index()
    {
        $pics = Pic::orderBy('nama')->get();
        return Inertia::render('pic/index', ['pics' => $pics]);
    }

    public function create()
    {
        return Inertia::render('pic/create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:pics,nama',
            'jabatan' => 'nullable|string|max:255',
        ], [
            'nama.unique' => 'Nama sudah terdaftar.',
        ]);

        Pic::create($request->only('nama', 'jabatan'));

        return redirect()->route('pic.index')->with('success', 'PIC berhasil ditambahkan');
    }

    public function edit(Pic $pic)
    {
        return Inertia::render('pic/edit', ['pic' => $pic]);
    }

    public function update(Request $request, Pic $pic)
    {
        $request->validate([
            'nama' => 'required|string|max:255|unique:pics,nama,'.$pic->id,
            'jabatan' => 'nullable|string|max:255',
        ], [
            'nama.unique' => 'Nama sudah terdaftar.',
        ]);

        $pic->update($request->only('nama', 'jabatan'));

        return redirect()->route('pic.index')->with('success', 'PIC berhasil diupdate');
    }

    public function destroy(Pic $pic)
    {
        $pic->delete();

        return redirect()->route('pic.index')->with('success', 'PIC berhasil dihapus');
    }
}
