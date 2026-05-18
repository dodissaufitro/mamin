<?php

namespace App\Http\Controllers;

use App\Models\Pic;
use App\Models\Penyedia;
use App\Models\SpjMakanMinumRapat;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SpjMakanMinumRapatController extends Controller
{
    public function index()
    {
        $data = SpjMakanMinumRapat::with('pic', 'penyedia')->latest()->paginate(15);
        return Inertia::render('spj/index', ['data' => $data]);
    }

    public function create()
    {
        return Inertia::render('spj/create', [
            'pics' => Pic::orderBy('nama')->get(['id', 'nama', 'jabatan']),
            'penyedias' => Penyedia::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function store(Request $request)
    {
        SpjMakanMinumRapat::create($request->all());

        return redirect()->route('spj.index')
            ->with('success', 'Data berhasil ditambahkan');
    }

    public function show(SpjMakanMinumRapat $spj)
    {
        return Inertia::render('spj/show', [
            'spj' => $spj->load('pic', 'penyedia'),
        ]);
    }

    public function edit(SpjMakanMinumRapat $spj)
    {
        return Inertia::render('spj/edit', [
            'spj' => $spj->load('pic', 'penyedia'),
            'pics' => Pic::orderBy('nama')->get(['id', 'nama', 'jabatan']),
            'penyedias' => Penyedia::orderBy('nama')->get(['id', 'nama']),
        ]);
    }

    public function update(Request $request, SpjMakanMinumRapat $spj)
    {
        $spj->update($request->all());

        return redirect()->route('spj.index')
            ->with('success', 'Data berhasil diupdate');
    }

    public function destroy(SpjMakanMinumRapat $spj)
    {
        $spj->delete();

        return redirect()->route('spj.index')
            ->with('success', 'Data berhasil dihapus');
    }
}