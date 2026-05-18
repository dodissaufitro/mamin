<?php

use App\Http\Controllers\ItemHpsController;
use App\Http\Controllers\PenyediaController;
use App\Http\Controllers\PicController;
use App\Http\Controllers\SpjMakanMinumRapatController;
use App\Models\ItemHps;
use App\Models\SpjMakanMinumRapat;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::resource('spj', SpjMakanMinumRapatController::class);
Route::resource('pic', PicController::class)->except('show');
Route::resource('penyedia', PenyediaController::class)->except('show');
Route::resource('item-hps', ItemHpsController::class)->except('show');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        $total = SpjMakanMinumRapat::count();
        $sudahBayar = SpjMakanMinumRapat::where('pembayaran_spj', true)->count();
        $belumBayar = SpjMakanMinumRapat::where('pembayaran_spj', false)->count();
        $dokumenLengkap = SpjMakanMinumRapat::where('kelengkapan_dokumen', true)->count();
        $deadlineDekat = SpjMakanMinumRapat::where('pembayaran_spj', false)
            ->whereNotNull('deadline_spj')
            ->where('deadline_spj', '<=', now()->addDays(7))
            ->where('deadline_spj', '>=', now())
            ->count();
        $terlambat = SpjMakanMinumRapat::where('pembayaran_spj', false)
            ->whereNotNull('deadline_spj')
            ->where('deadline_spj', '<', now())
            ->count();
        $recent = SpjMakanMinumRapat::with('pic', 'penyedia')->latest()->take(8)->get();
        $itemVolumes = ItemHps::query()
            ->orderBy('nama_item')
            ->get(['id', 'nama_item', 'volume'])
            ->map(fn (ItemHps $item) => [
                'id' => $item->id,
                'nama_item' => $item->nama_item,
                'volume' => (float) $item->volume,
            ])
            ->values();

        return Inertia::render('dashboard', [
            'stats' => [
                'total' => $total,
                'sudah_bayar' => $sudahBayar,
                'belum_bayar' => $belumBayar,
                'dokumen_lengkap' => $dokumenLengkap,
                'deadline_dekat' => $deadlineDekat,
                'terlambat' => $terlambat,
            ],
            'recent' => $recent,
            'itemVolumes' => $itemVolumes,
        ]);
    })->name('dashboard');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
