<?php

namespace App\Http\Controllers;

use App\Models\JenisDokumen;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class JenisDokumenController extends Controller
{
    public function index()
    {
        $jenisDokumens = JenisDokumen::query()
            ->withCount('itemHps')
            ->orderBy('nama')
            ->get();

        return Inertia::render('jenis-dokumen/index', [
            'jenisDokumens' => $jenisDokumens,
        ]);
    }

    public function create()
    {
        return Inertia::render('jenis-dokumen/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'nullable|string|max:255|unique:jenis_dokumens,kode',
        ]);

        JenisDokumen::create([
            'nama' => $validated['nama'],
            'kode' => $validated['kode'] ?? Str::slug($validated['nama'], '_'),
        ]);

        return redirect()->route('jenis-dokumen.index')
            ->with('success', 'Jenis dokumen berhasil ditambahkan');
    }

    public function edit(JenisDokumen $jenis_dokuman)
    {
        return Inertia::render('jenis-dokumen/edit', [
            'jenisDokumen' => $jenis_dokuman,
        ]);
    }

    public function update(Request $request, JenisDokumen $jenis_dokuman)
    {
        $validated = $request->validate([
            'nama' => 'required|string|max:255',
            'kode' => 'nullable|string|max:255|unique:jenis_dokumens,kode,'.$jenis_dokuman->id,
        ]);

        $jenis_dokuman->update([
            'nama' => $validated['nama'],
            'kode' => $validated['kode'] ?? Str::slug($validated['nama'], '_'),
        ]);

        return redirect()->route('jenis-dokumen.index')
            ->with('success', 'Jenis dokumen berhasil diupdate');
    }

    public function destroy(JenisDokumen $jenis_dokuman)
    {
        if ($jenis_dokuman->itemHps()->exists()) {
            return redirect()->route('jenis-dokumen.index')
                ->with('error', 'Jenis dokumen masih digunakan pada Item HPS.');
        }

        $jenis_dokuman->delete();

        return redirect()->route('jenis-dokumen.index')
            ->with('success', 'Jenis dokumen berhasil dihapus');
    }
}
