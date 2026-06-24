<?php

use App\Http\Controllers\ItemHpsController;
use App\Http\Controllers\PenyediaController;
use App\Http\Controllers\PicController;
use App\Http\Controllers\SpjMakanMinumRapatController;
use App\Http\Controllers\UserController;
use App\Models\ItemHps;
use App\Models\SpjMakanMinumRapat;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::middleware('role:super_admin,pic,bendahara')->group(function () {
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
            $recent = SpjMakanMinumRapat::with(['pic', 'penyedia', 'itemHps.jenisDokumens', 'spjDokumens'])
                ->latest()
                ->take(5)
                ->get();

            $itemVolumes = ItemHps::with('spjList')
                ->orderBy('nama_item')
                ->get()
                ->map(function (ItemHps $item) {
                    $sisaVolume = (float) $item->volume;
                    $terpakai = (float) $item->spjList->sum('jumlah_order');

                    return [
                        'id' => $item->id,
                        'nama_item' => $item->nama_item,
                        'volume' => $sisaVolume,
                        'terpakai' => $terpakai,
                        'harga_unit' => (float) $item->harga_unit,
                    ];
                })
                ->values();

            $items = ItemHps::with(['spjList.pic'])->orderBy('nama_item')->get()->map(function ($item) {
                $volume = (float) $item->volume;
                $terpakai = (float) $item->spjList->sum('jumlah_order');
                $sisa = $volume - $terpakai;
                $realisasi = $volume > 0 ? round(($terpakai / $volume) * 100, 1) : 0;

                $distribusi = [];
                $groupedDist = $item->spjList->groupBy(function ($spj) {
                    return $spj->kasubbag_kasi ?: 'Tanpa Kasi/Kasubbag';
                });
                foreach ($groupedDist as $unit => $spjs) {
                    $unitTerpakai = (float) $spjs->sum('jumlah_order');
                    if ($unitTerpakai > 0) {
                        $distribusi[] = [
                            'unit' => $unit,
                            'terpakai' => $unitTerpakai,
                            'persentase' => $terpakai > 0 ? round(($unitTerpakai / $terpakai) * 100, 1) : 0,
                        ];
                    }
                }

                usort($distribusi, fn ($a, $b) => $b['terpakai'] <=> $a['terpakai']);

                $spjSelesai = (float) $item->spjList->where('pembayaran_spj', true)->sum('jumlah_order');
                $prosesSpj = (float) $item->spjList->where('pembayaran_spj', false)->sum('jumlah_order');

                return [
                    'id' => $item->id,
                    'nama_item' => $item->nama_item,
                    'volume' => $volume,
                    'terpakai' => $terpakai,
                    'sisa' => $sisa,
                    'realisasi' => $realisasi,
                    'distribusi' => $distribusi,
                    'status_spj' => [
                        'selesai' => $spjSelesai,
                        'proses' => $prosesSpj,
                    ],
                ];
            })->values();

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
                'items' => $items,
            ]);
        })->name('dashboard');

        Route::get('spj', [SpjMakanMinumRapatController::class, 'index'])->name('spj.index');
    });

    Route::middleware('role:super_admin,pic')->group(function () {
        Route::get('spj/create', [SpjMakanMinumRapatController::class, 'create'])->name('spj.create');
        Route::post('spj', [SpjMakanMinumRapatController::class, 'store'])->name('spj.store');
        Route::delete('spj/{spj}', [SpjMakanMinumRapatController::class, 'destroy'])->name('spj.destroy');
    });

    Route::middleware('role:super_admin,bendahara')->group(function () {
        Route::get('spj/{spj}/edit', [SpjMakanMinumRapatController::class, 'edit'])->name('spj.edit');
        Route::match(['put', 'patch'], 'spj/{spj}', [SpjMakanMinumRapatController::class, 'update'])->name('spj.update');
    });

    Route::middleware('role:super_admin,pic,bendahara')->group(function () {
        Route::get('spj/{spj}', [SpjMakanMinumRapatController::class, 'show'])->name('spj.show');
    });

    Route::middleware('role:super_admin,bendahara')->group(function () {
        Route::get('inbox', [\App\Http\Controllers\InboxController::class, 'index'])->name('inbox.index');
        Route::get('notifications/{id}/open', [\App\Http\Controllers\InboxController::class, 'open'])->name('notifications.open');
        Route::post('notifications/read-all', [\App\Http\Controllers\InboxController::class, 'markAllRead'])->name('notifications.read-all');
    });

    Route::middleware('role:super_admin')->group(function () {
        Route::resource('pic', PicController::class)->except('show');
        Route::resource('penyedia', PenyediaController::class)->except('show');
        Route::resource('item-hps', ItemHpsController::class)->except('show');
        Route::resource('jenis-dokumen', \App\Http\Controllers\JenisDokumenController::class)->except('show');
        Route::resource('users', UserController::class)->except('show');
    });

    Route::post('/notifications/{id}/read', function (string $id) {
        auth()->user()->notifications()->findOrFail($id)->markAsRead();

        return back();
    })->name('notifications.read');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
