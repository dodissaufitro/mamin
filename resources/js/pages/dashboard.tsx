import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileCheck2,
    XCircle,
} from 'lucide-react';

interface SpjItem {
    id: number;
    tanggal_kegiatan: string | null;
    deadline_spj: string | null;
    pic: { id: number; nama: string } | null;
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
    link_spj: string | null;
}

interface Stats {
    total: number;
    sudah_bayar: number;
    belum_bayar: number;
    dokumen_lengkap: number;
    deadline_dekat: number;
    terlambat: number;
}

interface Props {
    stats: Stats;
    recent: SpjItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

const dokumenKeys: { key: keyof SpjItem; label: string }[] = [
    { key: 'surat_undangan', label: 'Surat Undangan' },
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
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dokumenProgress(item: SpjItem) {
    const total = dokumenKeys.length;
    const done = dokumenKeys.filter((d) => item[d.key] === true).length;
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

export default function Dashboard({ stats, recent }: Props) {
    const statCards = [
        {
            label: 'Total SPJ',
            value: stats.total,
            icon: ClipboardList,
            color: 'text-violet-700 dark:text-violet-300',
            bg: 'bg-violet-100 dark:bg-violet-800/40',
        },
        {
            label: 'Sudah Dibayar',
            value: stats.sudah_bayar,
            icon: CheckCircle2,
            color: 'text-emerald-700 dark:text-emerald-300',
            bg: 'bg-emerald-100 dark:bg-emerald-800/40',
        },
        {
            label: 'Belum Dibayar',
            value: stats.belum_bayar,
            icon: XCircle,
            color: 'text-rose-700 dark:text-rose-300',
            bg: 'bg-rose-100 dark:bg-rose-800/40',
        },
        {
            label: 'Dokumen Lengkap',
            value: stats.dokumen_lengkap,
            icon: FileCheck2,
            color: 'text-sky-700 dark:text-sky-300',
            bg: 'bg-sky-100 dark:bg-sky-800/40',
        },
        {
            label: 'Deadline ≤ 7 Hari',
            value: stats.deadline_dekat,
            icon: AlertTriangle,
            color: 'text-orange-700 dark:text-orange-300',
            bg: 'bg-orange-100 dark:bg-orange-800/40',
        },
        {
            label: 'Terlambat',
            value: stats.terlambat,
            icon: Clock,
            color: 'text-red-700 dark:text-red-300',
            bg: 'bg-red-100 dark:bg-red-800/40',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard SPJ Makan Minum Rapat" />
            <div className="flex flex-col gap-6 p-4 md:p-6">

                {/* Stat Cards */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {statCards.map((card) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={card.label}
                                className={`flex flex-col items-start gap-2 rounded-xl border-2 border-white/60 p-4 shadow-md ${card.bg}`}
                            >
                                <div className={`rounded-lg p-2 bg-white/50 dark:bg-white/10`}>
                                    <Icon className={`h-5 w-5 ${card.color}`} />
                                </div>
                                <p className={`text-2xl font-bold ${card.color}`}>{card.value}</p>
                                <p className="text-xs font-medium text-gray-600 dark:text-gray-300 leading-tight">{card.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Progress Ringkasan */}
                {stats.total > 0 && (
                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-700 dark:text-violet-300">Progres Keseluruhan SPJ</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <div className="mb-1 flex justify-between text-xs font-medium text-violet-600 dark:text-violet-400">
                                    <span>Pembayaran SPJ</span>
                                    <span>{stats.sudah_bayar} / {stats.total}</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-violet-100 dark:bg-gray-700">
                                    <div
                                        className="h-2.5 rounded-full bg-emerald-500 transition-all"
                                        style={{ width: `${stats.total ? Math.round((stats.sudah_bayar / stats.total) * 100) : 0}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                    {stats.total ? Math.round((stats.sudah_bayar / stats.total) * 100) : 0}% selesai
                                </p>
                            </div>
                            <div>
                                <div className="mb-1 flex justify-between text-xs font-medium text-violet-600 dark:text-violet-400">
                                    <span>Kelengkapan Dokumen</span>
                                    <span>{stats.dokumen_lengkap} / {stats.total}</span>
                                </div>
                                <div className="h-2.5 w-full rounded-full bg-violet-100 dark:bg-gray-700">
                                    <div
                                        className="h-2.5 rounded-full bg-sky-500 transition-all"
                                        style={{ width: `${stats.total ? Math.round((stats.dokumen_lengkap / stats.total) * 100) : 0}%` }}
                                    />
                                </div>
                                <p className="mt-1 text-xs font-medium text-sky-600 dark:text-sky-400">
                                    {stats.total ? Math.round((stats.dokumen_lengkap / stats.total) * 100) : 0}% lengkap
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tabel SPJ Terbaru */}
                <div className="rounded-xl border border-violet-200 bg-white shadow-sm dark:bg-sidebar dark:border-violet-800 overflow-hidden">
                    <div className="flex items-center justify-between px-5 py-4 border-b border-violet-100 dark:border-violet-800">
                        <h2 className="text-sm font-bold text-violet-700 dark:text-violet-300">SPJ Terbaru</h2>
                        <Link
                            href="/spj"
                            className="text-xs font-semibold text-violet-600 hover:text-violet-800 hover:underline dark:text-violet-400"
                        >
                            Lihat semua →
                        </Link>
                    </div>
                    {recent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-500">
                            <ClipboardList className="mb-3 h-10 w-10 opacity-40" />
                            <p className="text-sm">Belum ada data SPJ</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-violet-50 dark:bg-violet-900/20 text-left text-xs text-violet-700 dark:text-violet-300 uppercase tracking-wide">
                                        <th className="px-4 py-3 font-medium">Kegiatan</th>
                                        <th className="px-4 py-3 font-medium">Tgl Kegiatan</th>
                                        <th className="px-4 py-3 font-medium">Deadline SPJ</th>
                                        <th className="px-4 py-3 font-medium">Penyedia</th>
                                        <th className="px-4 py-3 font-medium">PIC</th>
                                        <th className="px-4 py-3 font-medium text-center">Dokumen</th>
                                        <th className="px-4 py-3 font-medium text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {recent.map((item) => {
                                        const { done, total, pct } = dokumenProgress(item);
                                        return (
                                            <tr key={item.id} className="hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
                                                <td className="px-4 py-3 max-w-[200px]">
                                                    <p className="truncate font-medium text-gray-800 dark:text-gray-200">
                                                        {item.kegiatan ?? '-'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                    {formatDate(item.tanggal_kegiatan)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-gray-600 dark:text-gray-400">
                                                    {formatDate(item.deadline_spj)}
                                                </td>
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
                                                        <span className="text-xs text-gray-400 dark:text-gray-500">{done}/{total}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <StatusBadge item={item} />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </div>
        </AppLayout>
    );
}
