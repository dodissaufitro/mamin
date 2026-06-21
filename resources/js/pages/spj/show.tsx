import AppLayout from '@/layouts/app-layout';
import { calcTotalHarga, formatRupiah } from '@/lib/spj-format';
import { type DokumenProgress, type JenisDokumenItem, type SpjDokumenItem, uploadedMap } from '@/lib/dokumen';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { CheckCircle2, ExternalLink, FileText, Pencil, Trash2, XCircle } from 'lucide-react';

interface SpjItem {
    id: number;
    tanggal_pemesanan: string | null;
    tanggal_kegiatan: string | null;
    deadline_spj: string | null;
    pic: { id: number; nama: string; jabatan: string | null } | null;
    kegiatan: string | null;
    penyedia: { id: number; nama: string; alamat: string | null; telepon: string | null } | null;
    item_hps?: {
        id: number;
        nama_item: string;
        harga_unit?: string | number;
        jenis_dokumens: JenisDokumenItem[];
    } | null;
    spj_dokumens?: SpjDokumenItem[];
    jumlah_order: number | null;
    total_harga: number | string | null;
    pembayaran_spj: boolean;
    kelengkapan_dokumen: boolean;
    kasubbag_kasi: string | null;
    staf: string | null;
    link_spj: string | null;
}

interface Props {
    spj: SpjItem;
    dokumenProgress: DokumenProgress;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'SPJ Makan Minum Rapat', href: '/spj' },
    { title: 'Detail SPJ', href: '#' },
];

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
}

function BoolBadge({ value, label }: { value: boolean; label: string }) {
    return (
        <div className={`flex items-center gap-2 rounded-lg border px-3 py-2.5 shadow-sm ${value ? 'border-emerald-300 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-800/40' : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30'}`}>
            {value
                ? <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                : <XCircle className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0" />}
            <span className={`text-sm font-medium ${value ? 'text-emerald-700 dark:text-emerald-300' : 'text-gray-400 dark:text-gray-500'}`}>{label}</span>
        </div>
    );
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

    const applicableDokumen = spj.item_hps?.jenis_dokumens ?? [];
    const uploadsByJenis = uploadedMap(spj.spj_dokumens);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail SPJ - ${spj.kegiatan ?? spj.id}`} />
            <div className="mx-auto max-w-3xl p-4 md:p-6">
                <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                        <h1 className="text-lg font-bold text-violet-800 dark:text-violet-200">{spj.kegiatan ?? 'Detail SPJ'}</h1>
                        <p className="text-sm text-violet-500 dark:text-violet-400">#{spj.id} &middot; {spj.penyedia?.nama ?? '-'}</p>
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

                <div className="flex flex-col gap-5">
                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">Informasi Kegiatan</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <InfoRow label="Tanggal Pemesanan" value={formatDate(spj.tanggal_pemesanan)} />
                            <InfoRow label="Tanggal Kegiatan" value={formatDate(spj.tanggal_kegiatan)} />
                            <InfoRow label="Deadline SPJ" value={formatDate(spj.deadline_spj)} />
                            <InfoRow label="Item HPS" value={spj.item_hps?.nama_item ?? null} />
                            <InfoRow label="Jumlah Order" value={spj.jumlah_order?.toLocaleString('id-ID')} />
                            <InfoRow
                                label="Total Harga"
                                value={
                                    spj.total_harga != null
                                        ? formatRupiah(spj.total_harga)
                                        : spj.jumlah_order && spj.item_hps?.harga_unit
                                          ? formatRupiah(calcTotalHarga(spj.jumlah_order, spj.item_hps.harga_unit))
                                          : null
                                }
                            />
                            <InfoRow label="Penyedia" value={spj.penyedia?.nama ?? null} />
                            <InfoRow label="PIC Penanggung Jawab" value={spj.pic ? `${spj.pic.nama}${spj.pic.jabatan ? ` (${spj.pic.jabatan})` : ''}` : null} />
                            <InfoRow label="Kasubbag / Kasi" value={spj.kasubbag_kasi} />
                            <InfoRow label="Staf" value={spj.staf} />
                        </div>
                        {spj.link_spj && (
                            <div className="mt-4 border-t border-violet-100 pt-4 dark:border-violet-800">
                                <p className="mb-1 text-xs font-semibold text-violet-500 dark:text-violet-400">Link SPJ</p>
                                <a href={spj.link_spj} target="_blank" rel="noopener noreferrer"
                                   className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:underline dark:text-violet-400">
                                    <ExternalLink className="h-3.5 w-3.5" />
                                    {spj.link_spj}
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                                Dokumen ({spj.item_hps?.nama_item ?? '-'})
                            </h2>
                            <span className="text-xs font-medium text-slate-600">
                                {dokumenProgress.done}/{dokumenProgress.total} terupload
                            </span>
                        </div>
                        {applicableDokumen.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Belum ada dokumen yang diaktifkan pada Item HPS ini.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-3">
                                {applicableDokumen.map((jenis) => {
                                    const upload = uploadsByJenis.get(jenis.id);
                                    return (
                                        <div key={jenis.id} className="flex items-center justify-between gap-3 rounded-lg border border-violet-100 px-3 py-2.5">
                                            <div className="flex items-center gap-2">
                                                {upload ? (
                                                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                                ) : (
                                                    <XCircle className="h-4 w-4 text-slate-300" />
                                                )}
                                                <span className="text-sm font-medium text-slate-800">{jenis.nama}</span>
                                            </div>
                                            {upload ? (
                                                <a
                                                    href={upload.url ?? '#'}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-xs font-medium text-violet-600 hover:underline"
                                                >
                                                    <FileText className="h-3.5 w-3.5" />
                                                    {upload.original_filename}
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400">Belum diupload</span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-xs font-bold uppercase tracking-wide text-violet-600 dark:text-violet-400">Status SPJ</h2>
                        <div className="grid grid-cols-2 gap-2">
                            <BoolBadge value={spj.kelengkapan_dokumen} label="Kelengkapan Dokumen" />
                            <BoolBadge value={spj.pembayaran_spj} label="Pembayaran SPJ" />
                        </div>
                    </div>
                </div>

                <div className="mt-5">
                    <Link href="/spj" className="text-sm font-semibold text-violet-600 hover:underline dark:text-violet-400">← Kembali ke daftar</Link>
                </div>
            </div>
        </AppLayout>
    );
}
