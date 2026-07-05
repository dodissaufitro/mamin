<?php

namespace App\Services;

use App\Models\ItemHps;
use App\Models\SpjMakanMinumRapat;
use Illuminate\Validation\ValidationException;

class SpjItemStockService
{
    /**
     * Validate an array of items
     * @param array $items Array of ['item_hps_id' => id, 'jumlah_order' => qty]
     * @return array Array of validated items
     */
    public function validateItems(array $items, ?SpjMakanMinumRapat $existing = null): array
    {
        if (empty($items)) {
            throw ValidationException::withMessages([
                'items' => 'Minimal pilih 1 item.',
            ]);
        }

        $validatedItems = [];
        $itemCounts = [];

        foreach ($items as $index => $itemData) {
            $itemId = $itemData['item_hps_id'] ?? null;
            $qty = (float) ($itemData['jumlah_order'] ?? 0);

            if ($qty <= 0) {
                throw ValidationException::withMessages([
                    "items.{$index}.jumlah_order" => 'Jumlah order harus lebih dari 0.',
                ]);
            }

            if (! $itemId) {
                throw ValidationException::withMessages([
                    "items.{$index}.item_hps_id" => 'Pilih item terlebih dahulu.',
                ]);
            }

            if (isset($itemCounts[$itemId])) {
                throw ValidationException::withMessages([
                    "items.{$index}.item_hps_id" => 'Item tidak boleh duplikat.',
                ]);
            }
            $itemCounts[$itemId] = true;

            $item = ItemHps::query()->find($itemId);

            if (! $item) {
                throw ValidationException::withMessages([
                    "items.{$index}.item_hps_id" => 'Item tidak ditemukan.',
                ]);
            }

            $available = (float) $item->volume;

            if ($existing) {
                $addedBack = $existing->spjItems->where('item_hps_id', $itemId)->sum('jumlah_order');
                $available += (float) $addedBack;
            }

            if ($qty > $available) {
                throw ValidationException::withMessages([
                    "items.{$index}.jumlah_order" => sprintf(
                        'Jumlah order melebihi volume tersedia (maks. %s).',
                        $this->formatNumber($available)
                    ),
                ]);
            }

            $validatedItems[] = ['item' => $item, 'qty' => $qty];
        }

        return $validatedItems;
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

    public function applyUpdate(SpjMakanMinumRapat $spj, array $newItemsData): void
    {
        // Restore all old items
        foreach ($spj->spjItems as $oldItem) {
            $this->restore($oldItem->item_hps_id, $oldItem->jumlah_order);
        }

        // Deduct all new items
        foreach ($newItemsData as $newItem) {
            $itemId = $newItem['item_hps_id'] ?? null;
            $qty = (float) ($newItem['jumlah_order'] ?? 0);
            if ($itemId && $qty > 0) {
                $item = ItemHps::query()->find($itemId);
                if ($item) {
                    $this->deduct($item, $qty);
                }
            }
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function itemsForForm(?SpjMakanMinumRapat $spj = null): array
    {
        if ($spj && !$spj->relationLoaded('spjItems')) {
            $spj->load('spjItems');
        }

        return ItemHps::query()
            ->with('jenisDokumens:id,nama,kode')
            ->orderBy('nama_item')
            ->get()
            ->map(function (ItemHps $item) use ($spj) {
                $available = (float) $item->volume;

                if ($spj) {
                    $addedBack = $spj->spjItems->where('item_hps_id', $item->id)->sum('jumlah_order');
                    $available += (float) $addedBack;
                }

                return [
                    'id' => $item->id,
                    'nama_item' => $item->nama_item,
                    'volume' => $item->volume,
                    'harga_unit' => $item->harga_unit,
                    'kategori' => $item->kategori,
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
