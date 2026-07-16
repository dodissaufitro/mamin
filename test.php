<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$items = App\Models\ItemHps::with(['spjItems.spj.pic'])->orderBy('nama_item')->get()->map(function ($item) {
    $volume = (float) $item->volume;
    $terpakai = (float) $item->spjItems->sum('jumlah_order');
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

    $groupedDist = $item->spjItems->groupBy(function ($spjItem) {
        return empty($spjItem->spj->kasubbag_kasi) ? 'Sub Bagian Tata Usaha' : $spjItem->spj->kasubbag_kasi;
    });
    
    foreach ($groupedDist as $unit => $spjItems) {
        $val = (float) $spjItems->sum('jumlah_order');
        if (isset($unitTotals[$unit])) {
            $unitTotals[$unit] += $val;
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

    return [
        'nama_item' => $item->nama_item,
        'distribusi' => $distribusi,
    ];
});

echo json_encode($items->toArray(), JSON_PRETTY_PRINT);
