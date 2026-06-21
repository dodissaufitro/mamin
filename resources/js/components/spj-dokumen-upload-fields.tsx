import { type JenisDokumenItem, type SpjDokumenItem, uploadedMap } from '@/lib/dokumen';
import { CheckCircle2, FileText, Trash2, Upload, XCircle } from 'lucide-react';
import { useMemo } from 'react';

interface SpjDokumenUploadFieldsProps {
    jenisDokumens: JenisDokumenItem[];
    existingUploads: SpjDokumenItem[];
    pendingUploads: Record<number, File | null>;
    removeIds: number[];
    onSelectFile: (jenisId: number, file: File | null) => void;
    onToggleRemove: (jenisId: number, remove: boolean) => void;
    errors?: Record<string, string>;
    description?: string;
}

export function SpjDokumenUploadFields({
    jenisDokumens,
    existingUploads,
    pendingUploads,
    removeIds,
    onSelectFile,
    onToggleRemove,
    errors,
    description,
}: SpjDokumenUploadFieldsProps) {
    const uploadsByJenis = useMemo(() => uploadedMap(existingUploads), [existingUploads]);

    if (jenisDokumens.length === 0) {
        return (
            <p className="text-sm text-slate-500">
                Belum ada dokumen yang diaktifkan pada Item HPS ini.
            </p>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            {description && <p className="text-xs text-slate-500">{description}</p>}
            {jenisDokumens.map((jenis) => {
                const existing = uploadsByJenis.get(jenis.id);
                const pending = pendingUploads[jenis.id];
                const markedRemove = removeIds.includes(jenis.id);
                const hasFile = !!pending || (!!existing && !markedRemove);
                const errorKey = `dokumen_uploads.${jenis.id}`;
                const error = errors?.[errorKey];

                return (
                    <div
                        key={jenis.id}
                        className="rounded-lg border border-violet-200 p-4 dark:border-violet-700"
                    >
                        <div className="mb-3 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                                {hasFile ? (
                                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                                ) : (
                                    <XCircle className="h-4 w-4 shrink-0 text-slate-300" />
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                                        {jenis.nama}
                                    </p>
                                    {existing && !markedRemove && !pending && (
                                        <a
                                            href={existing.url ?? '#'}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-violet-600 hover:underline"
                                        >
                                            <FileText className="h-3 w-3" />
                                            {existing.original_filename}
                                        </a>
                                    )}
                                    {pending && (
                                        <p className="text-xs text-sky-600">File baru: {pending.name}</p>
                                    )}
                                    {markedRemove && (
                                        <p className="text-xs text-rose-600">Akan dihapus saat disimpan</p>
                                    )}
                                </div>
                            </div>
                            {existing && !markedRemove && (
                                <button
                                    type="button"
                                    onClick={() => onToggleRemove(jenis.id, true)}
                                    className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs text-rose-700 hover:bg-rose-50"
                                >
                                    <Trash2 className="h-3 w-3" />
                                    Hapus
                                </button>
                            )}
                            {markedRemove && (
                                <button
                                    type="button"
                                    onClick={() => onToggleRemove(jenis.id, false)}
                                    className="text-xs font-medium text-violet-600 hover:underline"
                                >
                                    Batalkan hapus
                                </button>
                            )}
                        </div>

                        {!markedRemove && (
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-violet-300 bg-violet-50/50 px-3 py-2 hover:bg-violet-50 dark:border-violet-700 dark:bg-violet-900/10">
                                <Upload className="h-4 w-4 text-violet-600" />
                                <span className="text-sm text-violet-700">
                                    {existing ? 'Ganti file' : 'Upload file'}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                                    onChange={(e) => onSelectFile(jenis.id, e.target.files?.[0] ?? null)}
                                />
                            </label>
                        )}

                        {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
                        <p className="mt-2 text-xs text-slate-400">PDF, JPG, PNG, DOC — maks. 10 MB</p>
                    </div>
                );
            })}
        </div>
    );
}

interface JenisDokumenSelectFieldsProps {
    jenisDokumens: JenisDokumenItem[];
    selectedIds: number[];
    onChange: (ids: number[]) => void;
    description?: string;
}

export function JenisDokumenSelectFields({
    jenisDokumens,
    selectedIds,
    onChange,
    description,
}: JenisDokumenSelectFieldsProps) {
    function toggle(id: number, checked: boolean) {
        if (checked) {
            onChange([...selectedIds, id]);
            return;
        }

        onChange(selectedIds.filter((itemId) => itemId !== id));
    }

    if (jenisDokumens.length === 0) {
        return (
            <p className="text-sm text-slate-500">
                Belum ada jenis dokumen. Tambahkan terlebih dahulu di menu Dokumen Berlaku.
            </p>
        );
    }

    return (
        <div>
            {description && <p className="mb-3 text-xs text-slate-500">{description}</p>}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {jenisDokumens.map((jenis) => (
                    <label
                        key={jenis.id}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-violet-200 px-3 py-2 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-900/20"
                    >
                        <input
                            type="checkbox"
                            className="h-4 w-4 rounded accent-violet-600"
                            checked={selectedIds.includes(jenis.id)}
                            onChange={(e) => toggle(jenis.id, e.target.checked)}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{jenis.nama}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
