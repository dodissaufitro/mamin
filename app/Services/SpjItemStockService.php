<?php

namespace App\Services;

use App\Models\ItemHps;
use App\Models\SpjMakanMinumRapat;
use Illuminate\Validation\ValidationException;

class SpjItemStockService
{
    /**
     * @return array<string, mixed>
     */
    public function validateItemOrder(?int $itemId, mixed $jumlahOrder, ?SpjMakanMinumRapat $existing = null): array
    {
        $qty = (float) ($jumlahOrder ?? 0);

        if ($qty <= 0) {
            throw ValidationException::withMessages([
                'jumlah_order' => 'Jumlah order harus lebih dari 0.',
            ]);
        }

        if (! $itemId) {
            throw ValidationException::withMessages([
                'item_hps_id' => 'Pilih item terlebih dahulu.',
            ]);
        }

        $item = ItemHps::query()->find($itemId);

        if (! $item) {
            throw ValidationException::withMessages([
                'item_hps_id' => 'Item tidak ditemukan.',
            ]);
        }

        $available = (float) $item->volume;

        if ($existing && (int) $existing->item_hps_id === (int) $itemId) {
            $available += (float) ($existing->jumlah_order ?? 0);
        }

        if ($qty > $available) {
            throw ValidationException::withMessages([
                'jumlah_order' => sprintf(
                    'Jumlah order melebihi volume tersedia (maks. %s).',
                    $this->formatNumber($available)
                ),
            ]);
        }

        return ['item' => $item, 'qty' => $qty];
    }

    public function deduct(ItemHps $item, float $qty): void
    {
        $item->decrement('volume', $qty);
    }

    public function restore(?int $itemId, mixed $qty): void
    {
        if (! $itemId || ! $qty) {
            return;
        }

        ItemHps::query()->whereKey($itemId)->increment('volume', (float) $qty);
    }

    public function applyUpdate(SpjMakanMinumRapat $spj, ?int $newItemId, float $newQty): void
    {
        $oldItemId = $spj->item_hps_id;
        $oldQty = (float) ($spj->jumlah_order ?? 0);

        if ($oldItemId && $oldQty > 0) {
            $this->restore($oldItemId, $oldQty);
        }

        if ($newItemId && $newQty > 0) {
            $item = ItemHps::query()->findOrFail($newItemId);
            $this->deduct($item, $newQty);
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function itemsForForm(?SpjMakanMinumRapat $spj = null): array
    {
        return ItemHps::query()
            ->with('jenisDokumens:id,nama,kode')
            ->orderBy('nama_item')
            ->get()
            ->map(function (ItemHps $item) use ($spj) {
                $available = (float) $item->volume;

                if ($spj && (int) $spj->item_hps_id === (int) $item->id) {
                    $available += (float) ($spj->jumlah_order ?? 0);
                }

                return [
                    'id' => $item->id,
                    'nama_item' => $item->nama_item,
                    'volume' => $item->volume,
                    'harga_unit' => $item->harga_unit,
                    'available_volume' => $available,
                    'jenis_dokumens' => $item->jenisDokumens->map(fn ($d) => [
                        'id' => $d->id,
                        'nama' => $d->nama,
                        'kode' => $d->kode,
                    ])->values()->all(),
                ];
            })
            ->all();
    }

    private function formatNumber(float $value): string
    {
        return rtrim(rtrim(number_format($value, 2, ',', '.'), '0'), ',');
    }
}
