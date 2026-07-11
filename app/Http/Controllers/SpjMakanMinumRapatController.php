<?php

namespace App\Http\Controllers;

use App\Models\ItemHps;
use App\Models\Pic;
use App\Models\Penyedia;
use App\Models\SpjMakanMinumRapat;
use App\Services\SpjDokumenService;
use App\Services\SpjItemStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SpjMakanMinumRapatController extends Controller
{
    public function __construct(
        private readonly SpjItemStockService $stockService,
        private readonly SpjDokumenService $dokumenService,
    ) {}

    public function index(Request $request)
    {
        $query = SpjMakanMinumRapat::query()
            ->with(['pic', 'penyedia', 'spjItems.itemHps.jenisDokumens', 'spjDokumens'])
            ->latest();

        $filters = $request->only([
            'kegiatan', 'item_hps', 'tanggal_kegiatan', 'deadline_spj', 'penyedia', 'pic', 'tracking_spj', 'total_harga', 'kelengkapan_dokumen'
        ]);

        if (!empty($filters['kegiatan'])) {
            $query->where('kegiatan', 'like', '%' . $filters['kegiatan'] . '%');
        }
        if (!empty($filters['item_hps'])) {
            $query->whereHas('spjItems.itemHps', function ($q) use ($filters) {
                $q->where('nama_item', 'like', '%' . $filters['item_hps'] . '%');
            });
        }
        if (!empty($filters['tanggal_kegiatan'])) {
            $query->where('tanggal_kegiatan', 'like', '%' . $filters['tanggal_kegiatan'] . '%');
        }
        if (!empty($filters['deadline_spj'])) {
            $query->where('deadline_spj', 'like', '%' . $filters['deadline_spj'] . '%');
        }
        if (!empty($filters['penyedia'])) {
            $query->whereHas('penyedia', function ($q) use ($filters) {
                $q->where('nama', 'like', '%' . $filters['penyedia'] . '%');
            });
        }
        if (!empty($filters['pic'])) {
            $query->whereHas('pic', function ($q) use ($filters) {
                $q->where('nama', 'like', '%' . $filters['pic'] . '%');
            });
        }
        if (!empty($filters['tracking_spj'])) {
            if ($filters['tracking_spj'] === 'Tidak Lengkap') {
                $query->whereIn('tracking_spj', ['Dokumen Tidak Lengkap', 'Menunggu Kelengkapan', 'Tidak Lengkap', 'Belum Lengkap']);
            } elseif ($filters['tracking_spj'] === 'SSPD & SPOD') {
                $query->whereIn('tracking_spj', ['SSPD & SPOD', 'SPPD & SOPD']);
            } else {
                $query->where('tracking_spj', $filters['tracking_spj']);
            }
        }
        if (!empty($filters['total_harga'])) {
            $query->whereRaw('(SELECT SUM(total_harga) FROM spj_items WHERE spj_items.spj_makan_minum_rapat_id = spj_makan_minum_rapats.id) LIKE ?', ['%' . $filters['total_harga'] . '%']);
        }
        if (isset($filters['kelengkapan_dokumen']) && $filters['kelengkapan_dokumen'] !== '') {
            $isLengkap = $filters['kelengkapan_dokumen'] === 'Lengkap' ? 1 : 0;
            $query->where('kelengkapan_dokumen', $isLengkap);
        }

        if (auth()->check()) {
            $user = auth()->user();
            $isBendahara = $user->role === 'bendahara' || $user->hasRole('bendahara');
            $isSuperAdmin = $user->role === 'super_admin' || $user->hasRole('super_admin');
            $isAdmin = $user->role === 'admin' || $user->hasRole('admin');

            if ($isBendahara && !$isSuperAdmin && !$isAdmin) {
                $query->where('kelengkapan_dokumen', true)
                      ->whereNotIn('tracking_spj', [
                          'Dokumen Tidak Lengkap',
                          'Menunggu Kelengkapan',
                          'Tidak Lengkap',
                          'Belum Lengkap'
                      ]);
            }
        }

        $data = $query->paginate(15)->withQueryString();

        $data->getCollection()->transform(function (SpjMakanMinumRapat $spj) {
            $spj->setAttribute('dokumen_progress', $this->dokumenService->progressFor($spj));
            $spj->setAttribute('total_harga', $spj->total_harga);

            return $spj;
        });

        return Inertia::render('spj/index', [
            'data' => $data,
            'filters' => $filters,
        ]);
    }

    public function create()
    {
        return Inertia::render('spj/create', [
            'pics' => Pic::orderBy('nama')->get(['id', 'nama', 'jabatan']),
            'penyedias' => Penyedia::orderBy('nama')->get(['id', 'nama']),
            'items' => $this->stockService->itemsForForm(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $this->validateSpj($request);

        DB::transaction(function () use ($validated, $request) {
            $validatedItems = $this->stockService->validateItems($validated['items'] ?? []);

            $spjData = collect($validated)->except('items')->toArray();
            $spjData['tracking_spj'] = 'Belum Lengkap';
            $spjData['pembayaran_spj'] = false;
            
            $spj = SpjMakanMinumRapat::create($spjData);

            foreach ($validatedItems as $vItem) {
                $item = $vItem['item'];
                $qty = $vItem['qty'];
                $total_harga = round((float)$qty * (float)$item->harga_unit, 2);

                $spj->spjItems()->create([
                    'item_hps_id' => $item->id,
                    'jumlah_order' => $qty,
                    'total_harga' => $total_harga,
                ]);

                $this->stockService->deduct($item, $qty);
            }

            $spj->load('pic', 'penyedia', 'spjItems.itemHps');

            $recipients = \App\Models\User::query()
                ->whereIn('role', [
                    'super_admin',
                    'bendahara',
                ])
                ->get();

            \Illuminate\Support\Facades\Notification::send(
                $recipients,
                new \App\Notifications\NewSpjSubmitted($spj, $request->user()),
            );
        });

        return redirect()->route('spj.index')
            ->with('success', 'Data berhasil ditambahkan');
    }

    public function show(SpjMakanMinumRapat $spj)
    {
        $spj->load([
            'pic',
            'penyedia',
            'spjItems.itemHps.jenisDokumens',
            'spjDokumens.jenisDokumen',
        ]);
        $spj->setAttribute('total_harga', $spj->total_harga);

        return Inertia::render('spj/show', [
            'spj' => $spj,
            'dokumenProgress' => $this->dokumenService->progressFor($spj),
        ]);
    }

    public function edit(SpjMakanMinumRapat $spj)
    {
        if ($spj->tracking_spj === 'Selesai') {
            return redirect()->route('spj.index')->with('error', 'SPJ yang sudah Selesai tidak dapat diedit lagi.');
        }

        $spj->load([
            'pic',
            'penyedia',
            'spjItems.itemHps.jenisDokumens',
            'spjDokumens.jenisDokumen',
        ]);

        return Inertia::render('spj/edit', [
            'spj' => $spj,
            'pics' => Pic::orderBy('nama')->get(['id', 'nama', 'jabatan']),
            'penyedias' => Penyedia::orderBy('nama')->get(['id', 'nama']),
            'items' => $this->stockService->itemsForForm($spj),
            'dokumenProgress' => $this->dokumenService->progressFor($spj),
        ]);
    }

    public function update(Request $request, SpjMakanMinumRapat $spj)
    {
        if ($spj->tracking_spj === 'Selesai') {
            return redirect()->route('spj.index')->with('error', 'SPJ yang sudah Selesai tidak dapat diubah.');
        }

        $user = $request->user();
        $isBendahara = $user && ($user->role === 'bendahara' || $user->hasRole('bendahara')) && !($user->role === 'super_admin' || $user->hasRole('super_admin')) && !($user->role === 'admin' || $user->hasRole('admin'));

        if ($isBendahara) {
            $validated = $request->validate([
                'tracking_spj' => 'nullable|string|max:255',
            ]);
            
            $spj->update([
                'tracking_spj' => $validated['tracking_spj'] ?? $spj->tracking_spj,
                'pembayaran_spj' => ($validated['tracking_spj'] ?? '') === 'Selesai',
            ]);
            
            return redirect()->route('spj.index')
                ->with('success', 'Data berhasil diupdate');
        }

        $validated = $this->validateSpj($request);

        DB::transaction(function () use ($spj, $validated, $request) {
            $validatedItems = $this->stockService->validateItems($validated['items'] ?? [], $spj);

            $this->stockService->applyUpdate($spj, $validated['items'] ?? []);

            // delete old items
            $spj->spjItems()->delete();

            // create new items
            foreach ($validatedItems as $vItem) {
                $item = $vItem['item'];
                $qty = $vItem['qty'];
                $total_harga = round((float)$qty * (float)$item->harga_unit, 2);

                $spj->spjItems()->create([
                    'item_hps_id' => $item->id,
                    'jumlah_order' => $qty,
                    'total_harga' => $total_harga,
                ]);
            }

            $spjData = collect($validated)->except('items')->toArray();
            $spjData['pembayaran_spj'] = ($spjData['tracking_spj'] ?? '') === 'Selesai';
            
            $spj->update($spjData);
            
            if (!$request->user() || !$request->user()->hasRole('pic')) {
                $this->dokumenService->syncUploads($spj, $request);
            }
        });

        return redirect()->route('spj.index')
            ->with('success', 'Data berhasil diupdate');
    }

    public function destroy(SpjMakanMinumRapat $spj)
    {
        DB::transaction(function () use ($spj) {
            $this->dokumenService->deleteAllForSpj($spj);
            foreach ($spj->spjItems as $oldItem) {
                $this->stockService->restore($oldItem->item_hps_id, $oldItem->jumlah_order);
            }
            $spj->delete();
        });

        return redirect()->back()
            ->with('success', 'Data berhasil dihapus');
    }

    /**
     * @return array<string, mixed>
     */
    private function validateSpj(Request $request): array
    {
        return $request->validate([
            'tanggal_pemesanan' => 'nullable|date',
            'tanggal_kegiatan' => 'nullable|date',
            'deadline_spj' => 'nullable|date',
            'pic_id' => 'nullable|exists:pics,id',
            'penyedia_id' => 'nullable|exists:penyedias,id',
            'kegiatan' => 'nullable|string|max:255',
            'jenis_mamin' => 'required|string|in:snack dan makanan,kebutuhan dapur',
            'items' => 'required|array|min:1',
            'items.*.item_hps_id' => 'required|exists:item_hps,id',
            'items.*.jumlah_order' => 'required|numeric|min:0.01',
            'pembayaran_spj' => 'boolean',
            'tracking_spj' => 'nullable|string|max:255',
            'kasubbag_kasi' => 'nullable|string|max:255',
            'staf' => 'nullable|string|max:255',
            'link_spj' => 'nullable|string',
            'dokumen_uploads' => 'nullable|array',
            'dokumen_uploads.*' => 'nullable|file|max:10240',
            'dokumen_hapus' => 'nullable|array',
            'dokumen_hapus.*' => 'integer|exists:jenis_dokumens,id',
        ]);
    }
}
