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
            ->with(['pic', 'penyedia', 'itemHps.jenisDokumens', 'spjDokumens'])
            ->latest()
            ->paginate(15);

        $data->getCollection()->transform(function (SpjMakanMinumRapat $spj) {
            $spj->setAttribute('dokumen_progress', $this->dokumenService->progressFor($spj));

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
        $validated = $this->withTotalHarga($this->validateSpj($request));

        DB::transaction(function () use ($validated, $request) {
            $order = $this->stockService->validateItemOrder(
                $validated['item_hps_id'] ?? null,
                $validated['jumlah_order'] ?? null,
            );

            $spj = SpjMakanMinumRapat::create($validated);
            $this->stockService->deduct($order['item'], $order['qty']);

            $spj->load('pic', 'penyedia', 'itemHps');

            $recipients = \App\Models\User::query()
                ->whereIn('role', [
                    \App\Enums\UserRole::SuperAdmin,
                    \App\Enums\UserRole::Bendahara,
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
            'itemHps.jenisDokumens',
            'spjDokumens.jenisDokumen',
        ]);

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
            'itemHps.jenisDokumens',
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
        $validated = $this->withTotalHarga($this->validateSpj($request));

        DB::transaction(function () use ($spj, $validated, $request) {
            $order = $this->stockService->validateItemOrder(
                $validated['item_hps_id'] ?? null,
                $validated['jumlah_order'] ?? null,
                $spj,
            );

            $this->stockService->applyUpdate(
                $spj,
                $validated['item_hps_id'] ?? null,
                $order['qty'],
            );

            $spj->update($validated);
            $this->dokumenService->syncUploads($spj, $request);
        });

        return redirect()->route('spj.index')
            ->with('success', 'Data berhasil diupdate');
    }

    public function destroy(SpjMakanMinumRapat $spj)
    {
        DB::transaction(function () use ($spj) {
            $this->dokumenService->deleteAllForSpj($spj);
            $this->stockService->restore($spj->item_hps_id, $spj->jumlah_order);
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
            'item_hps_id' => 'required|exists:item_hps,id',
            'jumlah_order' => 'required|numeric|min:0.01',
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

    /**
     * @param  array<string, mixed>  $validated
     * @return array<string, mixed>
     */
    private function withTotalHarga(array $validated): array
    {
        $item = ItemHps::query()->findOrFail($validated['item_hps_id']);
        $validated['total_harga'] = round(
            (float) $validated['jumlah_order'] * (float) $item->harga_unit,
            2
        );

        return $validated;
    }
}
