<?php

namespace App\Http\Controllers;

use App\Models\ItemHps;
use App\Models\JenisDokumen;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemHpsController extends Controller
{
    public function index()
    {
        $items = ItemHps::query()
            ->withCount('jenisDokumens')
            ->orderBy('nama_item')
            ->get();

        return Inertia::render('item-hps/index', ['items' => $items]);
    }

    public function create()
    {
        return Inertia::render('item-hps/create', [
            'jenisDokumens' => JenisDokumen::orderBy('nama')->get(['id', 'nama', 'kode']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_item' => 'required|string|max:255',
            'volume' => 'required|numeric|min:0',
            'harga_unit' => 'required|numeric|min:0',
            'jenis_dokumen_ids' => 'nullable|array',
            'jenis_dokumen_ids.*' => 'exists:jenis_dokumens,id',
        ]);

        $item = ItemHps::create(collect($validated)->only(['nama_item', 'volume', 'harga_unit'])->all());
        $item->jenisDokumens()->sync($validated['jenis_dokumen_ids'] ?? []);

        return redirect()->route('item-hps.index')->with('success', 'Item HPS berhasil ditambahkan');
    }

    public function edit(ItemHps $itemHp)
    {
        $itemHp->load('jenisDokumens:id,nama,kode');

        return Inertia::render('item-hps/edit', [
            'item' => $itemHp,
            'jenisDokumens' => JenisDokumen::orderBy('nama')->get(['id', 'nama', 'kode']),
        ]);
    }

    public function update(Request $request, ItemHps $itemHp)
    {
        $validated = $request->validate([
            'nama_item' => 'required|string|max:255',
            'volume' => 'required|numeric|min:0',
            'harga_unit' => 'required|numeric|min:0',
            'jenis_dokumen_ids' => 'nullable|array',
            'jenis_dokumen_ids.*' => 'exists:jenis_dokumens,id',
        ]);

        $itemHp->update(collect($validated)->only(['nama_item', 'volume', 'harga_unit'])->all());
        $itemHp->jenisDokumens()->sync($validated['jenis_dokumen_ids'] ?? []);

        return redirect()->route('item-hps.index')->with('success', 'Item HPS berhasil diupdate');
    }

    public function destroy(ItemHps $itemHp)
    {
        $itemHp->delete();

        return redirect()->route('item-hps.index')->with('success', 'Item HPS berhasil dihapus');
    }
}
