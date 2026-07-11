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
            'nama_item' => 'required|string|max:255|unique:item_hps,nama_item',
            'volume' => 'required|numeric|min:0',
            'harga_unit' => 'required|numeric|min:0',
            'kategori' => 'nullable|string|in:Snack dan Makanan,Kebutuhan Dapur',
            'jenis_dokumen_ids' => 'nullable|array',
            'jenis_dokumen_ids.*' => 'exists:jenis_dokumens,id',
        ], [
            'nama_item.unique' => 'Nama sudah terdaftar.',
        ]);

        $data = collect($validated)->only(['nama_item', 'volume', 'harga_unit', 'kategori'])->all();
        $data['sisa_volume'] = $validated['volume'];
        $item = ItemHps::create($data);
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
            'nama_item' => 'required|string|max:255|unique:item_hps,nama_item,'.$itemHp->id,
            'volume' => 'required|numeric|min:0',
            'harga_unit' => 'required|numeric|min:0',
            'kategori' => 'nullable|string|in:Snack dan Makanan,Kebutuhan Dapur',
            'jenis_dokumen_ids' => 'nullable|array',
            'jenis_dokumen_ids.*' => 'exists:jenis_dokumens,id',
        ], [
            'nama_item.unique' => 'Nama sudah terdaftar.',
        ]);

        $data = collect($validated)->only(['nama_item', 'volume', 'harga_unit', 'kategori'])->all();
        
        // Adjust sisa_volume based on the change in volume
        $volumeDiff = $validated['volume'] - $itemHp->volume;
        $data['sisa_volume'] = $itemHp->sisa_volume + $volumeDiff;
        
        $itemHp->update($data);
        $itemHp->jenisDokumens()->sync($validated['jenis_dokumen_ids'] ?? []);

        return redirect()->route('item-hps.index')->with('success', 'Item HPS berhasil diupdate');
    }

    public function destroy(ItemHps $itemHp)
    {
        $itemHp->delete();

        return redirect()->route('item-hps.index')->with('success', 'Item HPS berhasil dihapus');
    }
}
