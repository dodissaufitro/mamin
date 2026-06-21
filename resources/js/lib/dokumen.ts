export interface JenisDokumenItem {
    id: number;
    nama: string;
    kode?: string;
}

export interface SpjDokumenItem {
    id: number;
    jenis_dokumen_id: number;
    original_filename: string;
    url?: string | null;
    jenis_dokumen?: JenisDokumenItem;
}

export interface DokumenProgress {
    done: number;
    total: number;
    pct: number;
}

export function dokumenProgressFromCounts(done: number, total: number): DokumenProgress {
    return {
        done,
        total,
        pct: total > 0 ? Math.round((done / total) * 100) : 0,
    };
}

export function defaultJenisIdsForItem(
    jenisDokumens: JenisDokumenItem[],
    namaItem?: string | null,
): number[] {
    const isGalon = namaItem?.toLowerCase().includes('galon');
    const defaultKodes = isGalon
        ? ['nib', 'invoice', 'kwitansi', 'memo']
        : ['surat_undangan', 'memo', 'invoice', 'kwitansi', 'nib', 'absen', 'notulen', 'dokumentasi'];

    return jenisDokumens
        .filter((item) => item.kode && defaultKodes.includes(item.kode))
        .map((item) => item.id);
}

export function uploadedMap(spjDokumens: SpjDokumenItem[] | undefined): Map<number, SpjDokumenItem> {
    const map = new Map<number, SpjDokumenItem>();
    (spjDokumens ?? []).forEach((item) => {
        map.set(item.jenis_dokumen_id, item);
    });

    return map;
}
