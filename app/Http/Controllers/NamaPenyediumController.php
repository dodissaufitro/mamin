<?php
namespace App\Http\Controllers;

use App\Models\NamaPenyedium;
use Illuminate\Http\Request;
use Inertia\Inertia;

class NamaPenyediumController extends Controller
{
    public function index() {
        return Inertia::render('nama-penyedium/index', [
            'data' => NamaPenyedium::all()
        ]);
    }

    public function create() {
        return Inertia::render('nama-penyedium/create');
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'nama' => 'required',
            'alamat' => 'required',
        ]);
        NamaPenyedium::create($validated);
        return redirect()->route('nama-penyedia.index')->with('success', 'Data created!');
    }

    public function edit(NamaPenyedium $namapenyedium) {
        return Inertia::render('nama-penyedium/edit', [
            'model' => $namapenyedium
        ]);
    }

    public function update(Request $request, NamaPenyedium $namapenyedium) {
        $validated = $request->validate([
            'nama' => 'required',
            'alamat' => 'required',
        ]);
        $namapenyedium->update($validated);
        return redirect()->route('nama-penyedia.index')->with('success', 'Data updated!');
    }

    public function destroy(NamaPenyedium $namapenyedium) {
        $namapenyedium->delete();
        return redirect()->route('nama-penyedia.index')->with('success', 'Data deleted!');
    }
}