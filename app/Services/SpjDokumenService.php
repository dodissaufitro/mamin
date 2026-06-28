<?php

namespace App\Services;

use App\Models\SpjDokumen;
use App\Models\SpjMakanMinumRapat;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class SpjDokumenService
{
    /**
     * @return list<string>
     */
    public function allowedMimeTypes(): array
    {
        return [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ];
    }

    public function syncUploads(SpjMakanMinumRapat $spj, Request $request): void
    {
        $spj->loadMissing('spjItems.itemHps.jenisDokumens');
        $allowedIds = [];
        foreach ($spj->spjItems as $spjItem) {
            if ($spjItem->itemHps && $spjItem->itemHps->jenisDokumens) {
                foreach ($spjItem->itemHps->jenisDokumens->pluck('id') as $id) {
                    $allowedIds[] = $id;
                }
            }
        }
        $allowedIds = array_unique($allowedIds);

        if ($allowedIds === []) {
            return;
        }

        $uploads = $request->file('dokumen_uploads', []);
        if (! is_array($uploads)) {
            $uploads = [];
        }

        foreach ($uploads as $jenisId => $file) {
            $jenisId = (int) $jenisId;

            if (! in_array($jenisId, $allowedIds, true)) {
                continue;
            }

            if (! $file instanceof UploadedFile) {
                continue;
            }

            $this->storeUpload($spj, $jenisId, $file);
        }

        $removeIds = $request->input('dokumen_hapus', []);
        if (is_array($removeIds)) {
            foreach ($removeIds as $jenisId) {
                $jenisId = (int) $jenisId;
                if (in_array($jenisId, $allowedIds, true)) {
                    $this->removeUpload($spj, $jenisId);
                }
            }
        }

        $this->refreshKelengkapan($spj);
    }

    public function storeUpload(SpjMakanMinumRapat $spj, int $jenisDokumenId, UploadedFile $file): SpjDokumen
    {
        if (! in_array($file->getMimeType(), $this->allowedMimeTypes(), true)) {
            throw ValidationException::withMessages([
                "dokumen_uploads.{$jenisDokumenId}" => 'Format file tidak didukung.',
            ]);
        }

        if ($file->getSize() > 10 * 1024 * 1024) {
            throw ValidationException::withMessages([
                "dokumen_uploads.{$jenisDokumenId}" => 'Ukuran file maksimal 10 MB.',
            ]);
        }

        $this->removeUpload($spj, $jenisDokumenId, deleteRecord: false);

        $path = $file->store("spj-dokumen/{$spj->id}", 'public');

        return SpjDokumen::query()->updateOrCreate(
            [
                'spj_makan_minum_rapat_id' => $spj->id,
                'jenis_dokumen_id' => $jenisDokumenId,
            ],
            [
                'file_path' => $path,
                'original_filename' => $file->getClientOriginalName(),
            ],
        );
    }

    public function removeUpload(SpjMakanMinumRapat $spj, int $jenisDokumenId, bool $deleteRecord = true): void
    {
        $existing = SpjDokumen::query()
            ->where('spj_makan_minum_rapat_id', $spj->id)
            ->where('jenis_dokumen_id', $jenisDokumenId)
            ->first();

        if (! $existing) {
            return;
        }

        if ($existing->file_path && Storage::disk('public')->exists($existing->file_path)) {
            Storage::disk('public')->delete($existing->file_path);
        }

        if ($deleteRecord) {
            $existing->delete();
        }
    }

    public function deleteAllForSpj(SpjMakanMinumRapat $spj): void
    {
        $spj->loadMissing('spjDokumens');

        foreach ($spj->spjDokumens as $dokumen) {
            if ($dokumen->file_path && Storage::disk('public')->exists($dokumen->file_path)) {
                Storage::disk('public')->delete($dokumen->file_path);
            }
            $dokumen->delete();
        }
    }

    public function refreshKelengkapan(SpjMakanMinumRapat $spj): void
    {
        $spj->loadMissing('spjItems.itemHps.jenisDokumens', 'spjDokumens');
        
        $requiredIds = collect();
        foreach ($spj->spjItems as $spjItem) {
            if ($spjItem->itemHps && $spjItem->itemHps->jenisDokumens) {
                $requiredIds = $requiredIds->merge($spjItem->itemHps->jenisDokumens->pluck('id'));
            }
        }
        $requiredIds = $requiredIds->unique();

        if ($requiredIds->isEmpty()) {
            $spj->update(['kelengkapan_dokumen' => false]);
            return;
        }

        $uploadedIds = $spj->spjDokumens->pluck('jenis_dokumen_id');
        $complete = $requiredIds->every(fn (int $id) => $uploadedIds->contains($id));

        $updateData = ['kelengkapan_dokumen' => $complete];

        if ($complete) {
            $currentTracking = $spj->tracking_spj;
            if (empty($currentTracking) || in_array($currentTracking, ['Dokumen Tidak Lengkap', 'Menunggu Kelengkapan', 'Tidak Lengkap', 'SPPD & SOPD'], true)) {
                $updateData['tracking_spj'] = 'SSPD & SPOD';
            }
        }

        $spj->update($updateData);
    }

    /**
     * @return array{done: int, total: int, pct: int}
     */
    public function progressFor(SpjMakanMinumRapat $spj): array
    {
        $spj->loadMissing('spjItems.itemHps.jenisDokumens', 'spjDokumens');
        
        $requiredIds = collect();
        foreach ($spj->spjItems as $spjItem) {
            if ($spjItem->itemHps && $spjItem->itemHps->jenisDokumens) {
                $requiredIds = $requiredIds->merge($spjItem->itemHps->jenisDokumens->pluck('id'));
            }
        }
        $requiredIds = $requiredIds->unique();
        $total = $requiredIds->count();

        if ($total === 0) {
            return ['done' => 0, 'total' => 0, 'pct' => 0];
        }

        $uploadedIds = $spj->spjDokumens->pluck('jenis_dokumen_id');
        $done = $requiredIds->filter(fn (int $id) => $uploadedIds->contains($id))->count();

        return [
            'done' => $done,
            'total' => $total,
            'pct' => (int) round(($done / $total) * 100),
        ];
    }
}
