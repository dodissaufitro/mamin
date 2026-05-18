import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { glassBtnPrimaryClass } from '@/lib/glass-styles';
import { calcTotalHarga, formatRupiah } from '@/lib/spj-format';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, Eye, Pencil, Plus, Trash2, XCircle } from 'lucide-react';

interface SpjItem {
    id: number;
    tanggal_kegiatan: string | null;
    deadline_spj: string | null;
    pic: { id: number; nama: string; jabatan: string | null } | null;
    penyedia: { id: number; nama: string } | null;
    item_hps?: { id: number; nama_item: string; harga_unit?: string | number } | null;
    kegiatan: string | null;
    jumlah_order: number | null;
    total_harga: number | string | null;
    surat_undangan: boolean;
    memo: boolean;
    invoice: boolean;
    kwitansi: boolean;
    nib: boolean;
    absen: boolean;
    notulen: boolean;
    dokumentasi: boolean;
    kelengkapan_dokumen: boolean;
    pembayaran_spj: boolean;
    kasubbag_kasi: string | null;
    staf: string | null;
}

interface PaginatedData {
    data: SpjItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    data: PaginatedData;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'SPJ Makan Minum Rapat', href: '/spj' },
];

const dokumenKeys: { key: keyof SpjItem; label: string }[] = [
    { key: 'surat_undangan', label: 'Undangan' },
    { key: 'memo', label: 'Memo' },
    { key: 'invoice', label: 'Invoice' },
    { key: 'kwitansi', label: 'Kwitansi' },
    { key: 'nib', label: 'NIB' },
    { key: 'absen', label: 'Absen' },
    { key: 'notulen', label: 'Notulen' },
    { key: 'dokumentasi', label: 'Dokumentasi' },
];

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dokumenProgress(item: SpjItem) {
    const done = dokumenKeys.filter((d) => item[d.key] === true).length;
    const total = dokumenKeys.length;
    return { done, total, pct: Math.round((done / total) * 100) };
}

function StatusBadge({ item }: { item: SpjItem }) {
    if (item.pembayaran_spj) {
        return (
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="h-3 w-3" /> Lunas
            </span>
        );
    }
    if (item.deadline_spj) {
        const diff = new Date(item.deadline_spj).getTime() - Date.now();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full border border-red-300 bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800">
                        <XCircle className="h-3 w-3" /> Terlambat
                    </span>
            );
        }
        if (days <= 7) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full border border-orange-300 bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-800">
                        <AlertTriangle className="h-3 w-3" /> {days}h lagi
                    </span>
            );
        }
    }
    return (
                <span className="inline-flex items-center gap-1 rounded-full border border-sky-300 bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-800">
            <Clock className="h-3 w-3" /> Proses
        </span>
    );
}

export default function SpjIndex({ data }: Props) {
    function handleDelete(id: number) {
        if (confirm('Hapus data SPJ ini?')) {
            router.delete(`/spj/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SPJ Makan Minum Rapat" />
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <AppPageHeader
                    title="SPJ Makan Minum Rapat"
                    description="Kelola data SPJ makan dan minum rapat"
                    action={
                        <Link href="/spj/create" className={glassBtnPrimaryClass}>
                            <Plus className="h-4 w-4" /> Tambah SPJ
                        </Link>
                    }
                />

                <AppContentCard className="p-0">
                    {data.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <p className="text-sm font-medium">Belum ada data SPJ.</p>
                            <Link href="/spj/create" className="mt-3 text-sm font-semibold text-sky-700 hover:underline">
                                + Tambah sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="glass-table-head">
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Kegiatan</th>
                                        <th className="px-4 py-3">Item HPS</th>
                                        <th className="px-4 py-3 text-right">Total Harga</th>
                                        <th className="px-4 py-3">Tgl Kegiatan</th>
                                        <th className="px-4 py-3">Deadline SPJ</th>
                                        <th className="px-4 py-3">Penyedia</th>
                                        <th className="px-4 py-3">PIC</th>
                                        <th className="px-4 py-3 text-center">Dokumen</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/70">
                                    {data.data.map((item, idx) => {
                                        const { done, total, pct } = dokumenProgress(item);
                                        const rowNum = (data.current_page - 1) * data.per_page + idx + 1;
                                        return (
                                            <tr key={item.id} className="glass-table-row">
                                                <td className="px-4 py-3 text-slate-500">{rowNum}</td>
                                                <td className="px-4 py-3 max-w-[200px]">
                                                    <p className="truncate font-semibold text-slate-900">{item.kegiatan ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3 max-w-[140px]">
                                                    <p className="truncate text-slate-700">{item.item_hps?.nama_item ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-slate-800">
                                                    {item.total_harga != null
                                                        ? formatRupiah(item.total_harga)
                                                        : item.jumlah_order && item.item_hps?.harga_unit
                                                          ? formatRupiah(
                                                                calcTotalHarga(item.jumlah_order, item.item_hps.harga_unit),
                                                            )
                                                          : '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDate(item.tanggal_kegiatan)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDate(item.deadline_spj)}</td>
                                                <td className="px-4 py-3 max-w-[140px]">
                                                    <p className="truncate text-slate-700">{item.penyedia?.nama ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3 max-w-[120px]">
                                                    <p className="truncate text-slate-700">{item.pic?.nama ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col items-center gap-1 min-w-[80px]">
                                                        <div className="h-2 w-full rounded-full bg-slate-200">
                                                            <div
                                                                className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-orange-400' : 'bg-rose-500'}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-600">{done}/{total}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center"><StatusBadge item={item} /></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={`/spj/${item.id}`} className="text-sky-600 hover:text-sky-800 transition-colors" title="Detail">
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <Link href={`/spj/${item.id}/edit`} className="text-slate-600 hover:text-slate-900 transition-colors" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <button onClick={() => handleDelete(item.id)} className="text-rose-600 hover:text-rose-800 transition-colors" title="Hapus">
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Pagination */}
                    {data.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/60 px-4 py-3">
                            <p className="text-xs text-slate-600">
                                Menampilkan {(data.current_page - 1) * data.per_page + 1}–{Math.min(data.current_page * data.per_page, data.total)} dari {data.total} data
                            </p>
                            <div className="flex gap-1">
                                {data.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        className={`rounded px-3 py-1 text-xs ${
                                            link.active
                                                ? 'rounded-lg bg-slate-900 text-white shadow-sm'
                                                : link.url
                                                ? 'rounded-lg text-sky-700 hover:bg-sky-100'
                                                : 'pointer-events-none text-slate-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </AppContentCard>
            </div>
        </AppLayout>
    );
}
