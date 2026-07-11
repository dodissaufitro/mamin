<?php
namespace App\Http\Controllers;

use App\Models\Pic;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PicController extends Controller
{
    public function index() {
        return Inertia::render('pic/index', [
            'data' => Pic::all()
        ]);
    }

    public function create() {
        return Inertia::render('pic/create');
    }

    public function store(Request $request) {
        $validated = $request->validate([
            'nama' => 'required',
            'jabatan' => 'required',
        ]);
        Pic::create($validated);
        return redirect()->route('pics.index')->with('success', 'Data created!');
    }

    public function edit(Pic $pic) {
        return Inertia::render('pic/edit', [
            'model' => $pic
        ]);
    }

    public function update(Request $request, Pic $pic) {
        $validated = $request->validate([
            'nama' => 'required',
            'jabatan' => 'required',
        ]);
        $pic->update($validated);
        return redirect()->route('pics.index')->with('success', 'Data updated!');
    }

    public function destroy(Pic $pic) {
        $pic->delete();
        return redirect()->route('pics.index')->with('success', 'Data deleted!');
    }
}