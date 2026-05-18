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
    kegiatan: string | null;
    jumlah_order: number | null;
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
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-800/50 dark:text-emerald-300 shadow-sm">
                <CheckCircle2 className="h-3 w-3" /> Lunas
            </span>
        );
    }
    if (item.deadline_spj) {
        const diff = new Date(item.deadline_spj).getTime() - Date.now();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
        if (days < 0) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-700 dark:bg-red-800/50 dark:text-red-300 shadow-sm">
                        <XCircle className="h-3 w-3" /> Terlambat
                    </span>
            );
        }
        if (days <= 7) {
            return (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-800/50 dark:text-orange-300 shadow-sm">
                        <AlertTriangle className="h-3 w-3" /> {days}h lagi
                    </span>
            );
        }
    }
    return (
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 px-2.5 py-1 text-xs font-semibold text-sky-700 dark:bg-sky-800/50 dark:text-sky-300 shadow-sm">
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
                {/* Header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-violet-800 dark:text-violet-200">SPJ Makan Minum Rapat</h1>
                    <Link
                        href="/spj/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors shadow-md shadow-violet-200 dark:shadow-violet-900/30"
                    >
                        <Plus className="h-4 w-4" /> Tambah SPJ
                    </Link>
                </div>

                {/* Table */}
                <div className="rounded-xl border border-violet-200 bg-white shadow-sm dark:bg-sidebar dark:border-violet-800 overflow-hidden">
                    {data.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <p className="text-sm">Belum ada data SPJ.</p>
                            <Link href="/spj/create" className="mt-3 text-sm font-semibold text-violet-600 hover:underline">
                                + Tambah sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-violet-50 dark:bg-violet-900/20 text-left text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Kegiatan</th>
                                        <th className="px-4 py-3">Tgl Kegiatan</th>
                                        <th className="px-4 py-3">Deadline SPJ</th>
                                        <th className="px-4 py-3">Penyedia</th>
                                        <th className="px-4 py-3">PIC</th>
                                        <th className="px-4 py-3 text-center">Dokumen</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                        <th className="px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {data.data.map((item, idx) => {
                                        const { done, total, pct } = dokumenProgress(item);
                                        const rowNum = (data.current_page - 1) * data.per_page + idx + 1;
                                        return (
                                            <tr key={item.id} className="hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
                                                <td className="px-4 py-3 text-gray-400">{rowNum}</td>
                                                <td className="px-4 py-3 max-w-[200px]">
                                                    <p className="truncate font-medium text-gray-800 dark:text-gray-200">{item.kegiatan ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{formatDate(item.tanggal_kegiatan)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">{formatDate(item.deadline_spj)}</td>
                                                <td className="px-4 py-3 max-w-[140px]">
                                                    <p className="truncate text-gray-600 dark:text-gray-400">{item.penyedia?.nama ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3 max-w-[120px]">
                                                    <p className="truncate text-gray-600 dark:text-gray-400">{item.pic?.nama ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex flex-col items-center gap-1 min-w-[80px]">
                                                        <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                                                            <div
                                                                className={`h-1.5 rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-orange-400' : 'bg-rose-500'}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs text-gray-400">{done}/{total}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center"><StatusBadge item={item} /></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={`/spj/${item.id}`} className="text-violet-400 hover:text-violet-700 transition-colors" title="Detail">
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        <Link href={`/spj/${item.id}/edit`} className="text-sky-400 hover:text-sky-600 transition-colors" title="Edit">
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <button onClick={() => handleDelete(item.id)} className="text-rose-400 hover:text-rose-600 transition-colors" title="Hapus">
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
                        <div className="flex items-center justify-between border-t border-violet-100 dark:border-violet-800 px-4 py-3">
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Menampilkan {(data.current_page - 1) * data.per_page + 1}–{Math.min(data.current_page * data.per_page, data.total)} dari {data.total} data
                            </p>
                            <div className="flex gap-1">
                                {data.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        className={`rounded px-3 py-1 text-xs ${
                                            link.active
                                                                                                ? 'bg-violet-600 text-white shadow-sm'
                                                : link.url
                                                ? 'text-violet-600 hover:bg-violet-100 dark:text-violet-400 dark:hover:bg-violet-900/30'
                                                : 'pointer-events-none text-gray-300 dark:text-gray-600'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
