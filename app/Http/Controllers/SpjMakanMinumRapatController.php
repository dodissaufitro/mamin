<?php

namespace App\Http\Controllers;

use App\Models\ItemHps;
use App\Models\Pic;
use App\Models\Penyedia;
use App\Models\SpjMakanMinumRapat;
use App\Services\SpjItemStockService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class SpjMakanMinumRapatController extends Controller
{
    public function __construct(
        private readonly SpjItemStockService $stockService,
    ) {}

    public function index()
    {
        $data = SpjMakanMinumRapat::with('pic', 'penyedia', 'itemHps')->latest()->paginate(15);

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

        DB::transaction(function () use ($validated) {
            $order = $this->stockService->validateItemOrder(
                $validated['item_hps_id'] ?? null,
                $validated['jumlah_order'] ?? null,
            );

            $spj = SpjMakanMinumRapat::create($validated);
            $this->stockService->deduct($order['item'], $order['qty']);

            // Send notification to all admins
            $admins = \App\Models\User::where('role', 'admin')->get();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\NewSpjSubmitted($spj));
        });

        return redirect()->route('spj.index')
            ->with('success', 'Data berhasil ditambahkan');
    }

    public function show(SpjMakanMinumRapat $spj)
    {
        return Inertia::render('spj/show', [
            'spj' => $spj->load('pic', 'penyedia', 'itemHps'),
        ]);
    }

    public function edit(SpjMakanMinumRapat $spj)
    {
        return Inertia::render('spj/edit', [
            'spj' => $spj->load('pic', 'penyedia', 'itemHps'),
            'pics' => Pic::orderBy('nama')->get(['id', 'nama', 'jabatan']),
            'penyedias' => Penyedia::orderBy('nama')->get(['id', 'nama']),
            'items' => $this->stockService->itemsForForm($spj),
        ]);
    }

    public function update(Request $request, SpjMakanMinumRapat $spj)
    {
        $validated = $this->withTotalHarga($this->validateSpj($request));

        DB::transaction(function () use ($spj, $validated) {
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
        });

        return redirect()->route('spj.index')
            ->with('success', 'Data berhasil diupdate');
    }

    public function destroy(SpjMakanMinumRapat $spj)
    {
        DB::transaction(function () use ($spj) {
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
            'surat_undangan' => 'boolean',
            'memo' => 'boolean',
            'invoice' => 'boolean',
            'kwitansi' => 'boolean',
            'nib' => 'boolean',
            'absen' => 'boolean',
            'notulen' => 'boolean',
            'dokumentasi' => 'boolean',
            'kelengkapan_dokumen' => 'boolean',
            'pembayaran_spj' => 'boolean',
            'tracking_spj' => 'nullable|string|max:255',
            'kasubbag_kasi' => 'nullable|string|max:255',
            'staf' => 'nullable|string|max:255',
            'link_spj' => 'nullable|string',
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
