import AppLayout from '@/layouts/app-layout';
import { calcTotalHarga, formatRupiah } from '@/lib/spj-format';
import { type DokumenProgress, type JenisDokumenItem, type SpjDokumenItem, uploadedMap } from '@/lib/dokumen';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { useMemo } from 'react';
import { CheckCircle2, ExternalLink, FileText, Pencil, Trash2, XCircle } from 'lucide-react';

interface SpjItemData {
    id: number;
    jumlah_order: number;
    total_harga: string | number;
    item_hps?: {
        id: number;
        nama_item: string;
        harga_unit?: string | number;
        jenis_dokumens: JenisDokumenItem[];
    } | null;
}

interface SpjItem {
    id: number;
    tanggal_pemesanan: string | null;
    tanggal_kegiatan: string | null;
    deadline_spj: string | null;
    pic: { id: number; nama: string; jabatan: string | null } | null;
    kegiatan: string | null;
    penyedia: { id: number; nama: string; alamat: string | null; telepon: string | null } | null;
    spj_items?: SpjItemData[];
    spj_dokumens?: SpjDokumenItem[];
    total_harga: number | string | null;
    pembayaran_spj: boolean;
    kelengkapan_dokumen: boolean;
    kasubbag_kasi: string | null;
    staf: string | null;
    link_spj: string | null;
    tracking_spj: string | null;
}

interface Props {
    spj: SpjItem;
    dokumenProgress: DokumenProgress;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'SPJ Makan Minum', href: '/spj' },
    { title: 'Detail SPJ', href: '#' },
];

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}


function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-0.5">
            <p className="text-xs font-semibold text-violet-500 dark:text-violet-400">{label}</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{value || '-'}</p>
        </div>
    );
}

export default function SpjShow({ spj, dokumenProgress }: Props) {
    function handleDelete() {
        if (confirm('Hapus data SPJ ini?')) {
            router.delete(`/spj/${spj.id}`, { onSuccess: () => router.visit('/spj') });
        }
    }

    const applicableDokumen = useMemo(() => {
        const docsMap = new Map<number, JenisDokumenItem>();
        spj.spj_items?.forEach(spjItem => {
            if (spjItem.item_hps && spjItem.item_hps.jenis_dokumens) {
                spjItem.item_hps.jenis_dokumens.forEach(doc => {
                    docsMap.set(doc.id, doc);
                });
            }
        });
        return Array.from(docsMap.values());
    }, [spj.spj_items]);

    const uploadsByJenis = uploadedMap(spj.spj_dokumens);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail SPJ - ${spj.kegiatan ?? spj.id}`} />
            <div className="mx-auto max-w-3xl p-4 md:p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-bold text-violet-800 dark:text-violet-200">{spj.kegiatan ?? 'Detail SPJ'}</h1>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Link href={`/spj/${spj.id}/edit`} className="inline-flex items-center gap-1.5 rounded-lg border border-sky-300 bg-sky-50 px-3 py-1.5 text-sm font-medium text-sky-700 hover:bg-sky-100 dark:border-sky-700 dark:bg-sky-900/30 dark:text-sky-300 dark:hover:bg-sky-800/40 transition-colors shadow-sm">
                            <Pencil className="h-3.5 w-3.5" /> Edit
                        </Link>
                        <button onClick={handleDelete} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 hover:bg-rose-100 dark:border-rose-700 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-800/40 transition-colors shadow-sm">
                            <Trash2 className="h-3.5 w-3.5" /> Hapus
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-6">
                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Tanggal</h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <InfoRow label="Tanggal Pemesanan" value={formatDate(spj.tanggal_pemesanan)} />
                            <InfoRow label="Tanggal Kegiatan" value={formatDate(spj.tanggal_kegiatan)} />
                            <InfoRow label="Deadline SPJ" value={formatDate(spj.deadline_spj)} />
                        </div>
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Info Kegiatan</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <InfoRow label="Kegiatan" value={spj.kegiatan} />
                            <InfoRow label="Penyedia" value={spj.penyedia?.nama ?? null} />
                            <InfoRow label="PIC Penanggung Jawab" value={spj.pic ? `${spj.pic.nama}${spj.pic.jabatan ? ` (${spj.pic.jabatan})` : ''}` : null} />
                            <InfoRow label="Kasubbag / Kasi" value={spj.kasubbag_kasi} />
                            
                            <div className="sm:col-span-2 mt-2">
                                <label className="mb-2 block text-sm font-semibold text-violet-700 dark:text-violet-300">Daftar Item HPS</label>
                                {spj.spj_items?.map((spjItem, idx) => (
                                    <div key={idx} className="mb-3 flex flex-col gap-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-800/50 dark:bg-violet-900/10 sm:flex-row sm:items-start">
                                        <div className="flex-1">
                                            <InfoRow label={`Item HPS ${idx + 1}`} value={spjItem.item_hps?.nama_item} />
                                        </div>
                                        <div className="w-full sm:w-32">
                                            <InfoRow label="Jumlah" value={spjItem.jumlah_order?.toLocaleString('id-ID')} />
                                        </div>
                                        <div className="w-full sm:w-48">
                                            <InfoRow label="Subtotal" value={
                                                <span className="font-semibold text-violet-800 dark:text-violet-300">
                                                    {formatRupiah(spjItem.total_harga || 0)}
                                                </span>
                                            } />
                                        </div>
                                    </div>
                                ))}
                                
                                <div className="mt-4 flex justify-end">
                                    <div className="rounded-lg bg-violet-600 px-6 py-3 text-white shadow-md">
                                        <p className="text-xs text-violet-200 uppercase tracking-wide">Total Harga</p>
                                        <p className="text-xl font-bold">
                                            {formatRupiah(spj.total_harga || 0)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                                Dokumen SPJ
                            </h2>
                            <span className="text-xs font-medium text-slate-600">
                                {dokumenProgress.done}/{dokumenProgress.total} terupload
                            </span>
                        </div>
                        {applicableDokumen.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Belum ada dokumen yang diaktifkan pada item-item ini.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {applicableDokumen.map((jenis) => {
                                    const upload = uploadsByJenis.get(jenis.id);
                                    return (
                                        <div key={jenis.id} className="flex items-center justify-between gap-3 rounded-lg border border-violet-100 px-4 py-3 bg-white shadow-sm hover:border-violet-300 transition-colors dark:bg-gray-800 dark:border-violet-800/50">
                                            <div className="flex items-center gap-3">
                                                {upload ? (
                                                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="h-5 w-5 text-slate-300" />
                                                )}
                                                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{jenis.nama}</span>
                                            </div>
                                            {upload ? (
                                                <a
                                                    href={upload.url ?? '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 hover:underline bg-violet-50 px-3 py-1.5 rounded-md transition-colors"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    Lihat Dokumen
                                                </a>
                                            ) : (
                                                <span className="text-xs font-medium text-slate-400 bg-slate-50 px-3 py-1.5 rounded-md border border-slate-100">Belum ada file</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Tracking & Status SPJ</h2>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <InfoRow label="Kelengkapan Dokumen" value={
                                    <span className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold mt-1 ${dokumenProgress.total > 0 && dokumenProgress.done === dokumenProgress.total ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-600 border border-red-200'}`}>
                                        {dokumenProgress.total > 0 && dokumenProgress.done === dokumenProgress.total ? 'Lengkap' : 'Tidak Lengkap'}
                                    </span>
                                } />
                            </div>
                            <div>
                                <InfoRow label="Tracking Saat Ini" value={
                                    <span className="inline-flex mt-1 items-center rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-900/30 dark:text-blue-300 dark:ring-blue-900/50">
                                        {(spj.tracking_spj === 'SPPD & SOPD' ? 'SSPD & SPOD' : spj.tracking_spj) || 'Belum ada tracking spesifik'}
                                    </span>
                                } />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 flex justify-end">
                    <Link href="/spj" className="rounded-lg border border-violet-300 px-5 py-2.5 text-sm font-medium text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/20 shadow-sm transition-colors">
                        Kembali ke daftar
                    </Link>
                </div>
            </div>
        </AppLayout>
    );
}
