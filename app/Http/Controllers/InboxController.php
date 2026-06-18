<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\SpjMakanMinumRapat;

class InboxController extends Controller
{
    public function index()
    {
        // Require admin role
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        // Get SPJs that are not "Selesai"
        $tasks = SpjMakanMinumRapat::with(['pic', 'penyedia', 'itemHps'])
            ->where(function ($query) {
                $query->whereNull('tracking_spj')
                      ->orWhere('tracking_spj', '!=', 'Selesai');
            })
            ->latest()
            ->paginate(15);

        return Inertia::render('inbox/index', ['tasks' => $tasks]);
    }

    public function updateStatus(Request $request, SpjMakanMinumRapat $spj)
    {
        if (auth()->user()->role !== 'admin') {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'tracking_spj' => 'required|string|max:255',
        ]);

        $spj->update($validated);

        return redirect()->route('inbox.index')
            ->with('success', 'Status SPJ berhasil diperbarui');
    }
}
