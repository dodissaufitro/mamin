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

    public function index()
    {
        $data = SpjMakanMinumRapat::query()
            ->with(['pic', 'penyedia', 'spjItems.itemHps.jenisDokumens', 'spjDokumens'])
            ->latest()
            ->paginate(15);

        $data->getCollection()->transform(function (SpjMakanMinumRapat $spj) {
            $spj->setAttribute('dokumen_progress', $this->dokumenService->progressFor($spj));
            $spj->setAttribute('total_harga', $spj->total_harga);

            return $spj;
        });

        return Inertia::render('spj/index', ['data' => $data]);
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
            $spjData['tracking_spj'] = 'Dokumen Tidak Lengkap';
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
            $this->dokumenService->syncUploads($spj, $request);
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

        return redirect()->route('spj.index')
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
