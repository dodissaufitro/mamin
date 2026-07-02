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
    Route::middleware('permission:dashboard.view')->group(function () {
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
            $recent = SpjMakanMinumRapat::with(['pic', 'penyedia', 'spjItems.itemHps.jenisDokumens', 'spjDokumens'])
                ->latest()
                ->take(5)
                ->get()
                ->each->append('total_harga');

            $itemVolumes = ItemHps::with('spjItems')
                ->orderBy('nama_item')
                ->get()
                ->groupBy('nama_item')
                ->map(function ($group, $namaItem) {
                    $sisaVolume = $group->sum(fn($i) => (float) $i->volume);
                    $terpakai = $group->sum(fn($i) => (float) $i->spjItems->sum('jumlah_order'));

                    return [
                        'id' => $group->first()->id,
                        'nama_item' => $namaItem,
                        'volume' => $sisaVolume,
                        'terpakai' => $terpakai,
                        'harga_unit' => (float) $group->first()->harga_unit,
                    ];
                })
                ->values();

            $itemsRaw = ItemHps::with(['spjItems.spj.pic'])->orderBy('nama_item')->get();
            $items = $itemsRaw->groupBy('nama_item')->map(function ($group, $namaItem) {
                $volume = $group->sum(fn($i) => (float) $i->volume);
                $terpakai = $group->sum(fn($i) => (float) $i->spjItems->sum('jumlah_order'));
                $sisa = $volume - $terpakai;
                $realisasi = $volume > 0 ? round(($terpakai / $volume) * 100, 1) : 0;

                $units = [
                    'Sub Bagian Tata Usaha',
                    'Sub Bagian Keuangan',
                    'Seksi Investasi dan Manajemen Resiko',
                    'Seksi Pembiayaan Perumahan'
                ];

                $unitTotals = [];
                foreach ($units as $u) {
                    $unitTotals[$u] = 0;
                }

                $allSpjItems = $group->flatMap->spjItems;
                $groupedDist = $allSpjItems->groupBy(function ($spjItem) {
                    return $spjItem->spj->kasubbag_kasi ?: 'Tanpa Kasi/Kasubbag';
                });
                
                foreach ($groupedDist as $unit => $spjItems) {
                    $val = (float) $spjItems->sum('jumlah_order');
                    if (isset($unitTotals[$unit])) {
                        $unitTotals[$unit] += $val;
                    } else {
                        $unitTotals[$unit] = $val;
                    }
                }

                $distribusi = [];
                foreach ($unitTotals as $unit => $val) {
                    if ($val > 0 || in_array($unit, $units)) {
                        $distribusi[] = [
                            'unit' => $unit,
                            'terpakai' => $val,
                            'persentase' => $terpakai > 0 ? round(($val / $terpakai) * 100, 1) : 0,
                        ];
                    }
                }

                usort($distribusi, fn ($a, $b) => $b['terpakai'] <=> $a['terpakai']);

                $spjSelesai = (float) $allSpjItems->filter(fn($si) => $si->spj && $si->spj->pembayaran_spj)->sum('jumlah_order');
                $spjProses = $terpakai - $spjSelesai;

                return [
                    'id' => $group->first()->id,
                    'nama_item' => $namaItem,
                    'volume' => $volume,
                    'terpakai' => $terpakai,
                    'sisa' => $sisa,
                    'realisasi' => $realisasi,
                    'distribusi' => $distribusi,
                    'status_spj' => [
                        'selesai' => $spjSelesai,
                        'proses' => $spjProses,
                    ],
                ];
            })->filter(fn($item) => $item['terpakai'] > 0)->values();

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
    });

    Route::middleware('permission:spj.view')->group(function () {
        Route::get('spj', [SpjMakanMinumRapatController::class, 'index'])->name('spj.index');
    });

    Route::middleware('permission:spj.create')->group(function () {
        Route::get('spj/create', [SpjMakanMinumRapatController::class, 'create'])->name('spj.create');
        Route::post('spj', [SpjMakanMinumRapatController::class, 'store'])->name('spj.store');
    });

    Route::middleware('permission:spj.view')->group(function () {
        Route::get('spj/{spj}', [SpjMakanMinumRapatController::class, 'show'])->name('spj.show');
    });

    Route::middleware('permission:spj.update')->group(function () {
        Route::get('spj/{spj}/edit', [SpjMakanMinumRapatController::class, 'edit'])->name('spj.edit');
        Route::match(['put', 'patch'], 'spj/{spj}', [SpjMakanMinumRapatController::class, 'update'])->name('spj.update');
    });

    Route::middleware('permission:spj.delete')->group(function () {
        Route::delete('spj/{spj}', [SpjMakanMinumRapatController::class, 'destroy'])->name('spj.destroy');
    });

    Route::middleware('permission:inbox.view')->group(function () {
        Route::get('inbox', [\App\Http\Controllers\InboxController::class, 'index'])->name('inbox.index');
        Route::get('notifications/{id}/open', [\App\Http\Controllers\InboxController::class, 'open'])->name('notifications.open');
        Route::post('notifications/read-all', [\App\Http\Controllers\InboxController::class, 'markAllRead'])->name('notifications.read-all');
    });

    Route::middleware('permission:pic.view')->group(function () {
        Route::resource('pic', PicController::class)->except('show');
    });

    Route::middleware('permission:penyedia.view')->group(function () {
        Route::resource('penyedia', PenyediaController::class)->except('show')->parameters([
            'penyedia' => 'penyedia'
        ]);
    });

    Route::middleware('permission:item_hps.view')->group(function () {
        Route::resource('item-hps', ItemHpsController::class)->except('show');
    });

    Route::middleware('permission:jenis_dokumen.view')->group(function () {
        Route::resource('jenis-dokumen', \App\Http\Controllers\JenisDokumenController::class)->except('show');
    });

    Route::middleware('permission:users.view')->group(function () {
        Route::resource('users', UserController::class)->except('show');
    });

    Route::middleware('permission:roles.view')->group(function () {
        Route::resource('roles', \App\Http\Controllers\RoleController::class)->except('show');
    });

    Route::post('/notifications/{id}/read', function (string $id) {
        auth()->user()->notifications()->findOrFail($id)->markAsRead();
        return back();
    })->name('notifications.read');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
