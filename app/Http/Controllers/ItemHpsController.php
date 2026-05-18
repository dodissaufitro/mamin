<?php

namespace App\Http\Controllers;

use App\Models\ItemHps;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ItemHpsController extends Controller
{
    public function index()
    {
        $items = ItemHps::orderBy('nama_item')->get();

        return Inertia::render('item-hps/index', ['items' => $items]);
    }

    public function create()
    {
        return Inertia::render('item-hps/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_item' => 'required|string|max:255',
            'volume' => 'required|numeric|min:0',
            'harga_unit' => 'required|numeric|min:0',
        ]);

        ItemHps::create($validated);

        return redirect()->route('item-hps.index')->with('success', 'Item HPS berhasil ditambahkan');
    }

    public function edit(ItemHps $itemHp)
    {
        return Inertia::render('item-hps/edit', ['item' => $itemHp]);
    }

    public function update(Request $request, ItemHps $itemHp)
    {
        $validated = $request->validate([
            'nama_item' => 'required|string|max:255',
            'volume' => 'required|numeric|min:0',
            'harga_unit' => 'required|numeric|min:0',
        ]);

        $itemHp->update($validated);

        return redirect()->route('item-hps.index')->with('success', 'Item HPS berhasil diupdate');
    }

    public function destroy(ItemHps $itemHp)
    {
        $itemHp->delete();

        return redirect()->route('item-hps.index')->with('success', 'Item HPS berhasil dihapus');
    }
}
