import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { GlassPanel } from '@/components/glass-panel';
import { ItemVolumeChart, type ItemVolumeDatum } from '@/components/item-volume-chart';
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
    itemVolumes: ItemVolumeDatum[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

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
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dokumenProgress(item: SpjItem) {
    const total = dokumenKeys.length;
    const done = dokumenKeys.filter((d) => item[d.key] === true).length;
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

const statCardStyles = [
    { accent: 'text-slate-900', iconBg: 'bg-slate-100', iconBorder: 'border-slate-200' },
    { accent: 'text-emerald-700', iconBg: 'bg-emerald-100', iconBorder: 'border-emerald-200' },
    { accent: 'text-rose-700', iconBg: 'bg-rose-100', iconBorder: 'border-rose-200' },
    { accent: 'text-sky-700', iconBg: 'bg-sky-100', iconBorder: 'border-sky-200' },
    { accent: 'text-orange-700', iconBg: 'bg-orange-100', iconBorder: 'border-orange-200' },
    { accent: 'text-red-700', iconBg: 'bg-red-100', iconBorder: 'border-red-200' },
];

export default function Dashboard({ stats, recent, itemVolumes }: Props) {
    const statCards = [
        { label: 'Total SPJ', value: stats.total, icon: ClipboardList },
        { label: 'Sudah Dibayar', value: stats.sudah_bayar, icon: CheckCircle2 },
        { label: 'Belum Dibayar', value: stats.belum_bayar, icon: XCircle },
        { label: 'Dokumen Lengkap', value: stats.dokumen_lengkap, icon: FileCheck2 },
        { label: 'Deadline ≤ 7 Hari', value: stats.deadline_dekat, icon: AlertTriangle },
        { label: 'Terlambat', value: stats.terlambat, icon: Clock },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard SPJ Makan Minum Rapat" />
            <div className="flex flex-col gap-6 p-4 md:p-6">
                <AppPageHeader title="Dashboard" description="Ringkasan SPJ Makan Minum Rapat" />

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {statCards.map((card, i) => {
                        const Icon = card.icon;
                        const style = statCardStyles[i];
                        return (
                            <GlassPanel key={card.label} className="flex flex-col gap-3 rounded-2xl p-4">
                                <div
                                    className={`flex h-10 w-10 items-center justify-center rounded-xl border ${style.iconBorder} ${style.iconBg}`}
                                >
                                    <Icon className={`h-5 w-5 ${style.accent}`} />
                                </div>
                                <p className={`text-3xl font-bold ${style.accent}`}>{card.value}</p>
                                <p className="text-xs font-medium leading-tight text-slate-600">{card.label}</p>
                            </GlassPanel>
                        );
                    })}
                </div>

                <GlassPanel className="rounded-2xl p-5">
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">Volume Item HPS Tersisa</h2>
                            <p className="mt-0.5 text-xs text-slate-600">
                                Sisa volume per item setelah pemesanan SPJ
                            </p>
                        </div>
                        <Link
                            href="/item-hps"
                            className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline"
                        >
                            Kelola Item HPS →
                        </Link>
                    </div>
                    <ItemVolumeChart data={itemVolumes} />
                </GlassPanel>

                {stats.total > 0 && (
                    <GlassPanel className="rounded-2xl p-5">
                        <h2 className="mb-4 text-sm font-bold text-slate-900">Progres Keseluruhan SPJ</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div>
                                <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700">
                                    <span>Pembayaran SPJ</span>
                                    <span>
                                        {stats.sudah_bayar} / {stats.total}
                                    </span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-slate-200">
                                    <div
                                        className="h-3 rounded-full bg-emerald-500 transition-all"
                                        style={{ width: `${stats.total ? Math.round((stats.sudah_bayar / stats.total) * 100) : 0}%` }}
                                    />
                                </div>
                                <p className="mt-1.5 text-xs font-semibold text-emerald-700">
                                    {stats.total ? Math.round((stats.sudah_bayar / stats.total) * 100) : 0}% selesai
                                </p>
                            </div>
                            <div>
                                <div className="mb-1 flex justify-between text-xs font-semibold text-slate-700">
                                    <span>Kelengkapan Dokumen</span>
                                    <span>
                                        {stats.dokumen_lengkap} / {stats.total}
                                    </span>
                                </div>
                                <div className="h-3 w-full rounded-full bg-slate-200">
                                    <div
                                        className="h-3 rounded-full bg-sky-500 transition-all"
                                        style={{ width: `${stats.total ? Math.round((stats.dokumen_lengkap / stats.total) * 100) : 0}%` }}
                                    />
                                </div>
                                <p className="mt-1.5 text-xs font-semibold text-sky-700">
                                    {stats.total ? Math.round((stats.dokumen_lengkap / stats.total) * 100) : 0}% lengkap
                                </p>
                            </div>
                        </div>
                    </GlassPanel>
                )}

                <AppContentCard className="p-0">
                    <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-5 py-4">
                        <h2 className="text-sm font-bold text-slate-900">SPJ Terbaru</h2>
                        <Link href="/spj" className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline">
                            Lihat semua →
                        </Link>
                    </div>
                    {recent.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                            <ClipboardList className="mb-3 h-10 w-10 opacity-50" />
                            <p className="text-sm font-medium">Belum ada data SPJ</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="glass-table-head">
                                        <th className="px-4 py-3">Kegiatan</th>
                                        <th className="px-4 py-3">Tgl Kegiatan</th>
                                        <th className="px-4 py-3">Deadline SPJ</th>
                                        <th className="px-4 py-3">Penyedia</th>
                                        <th className="px-4 py-3">PIC</th>
                                        <th className="px-4 py-3 text-center">Dokumen</th>
                                        <th className="px-4 py-3 text-center">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/70">
                                    {recent.map((item) => {
                                        const { done, total, pct } = dokumenProgress(item);
                                        return (
                                            <tr key={item.id} className="glass-table-row">
                                                <td className="max-w-[200px] px-4 py-3">
                                                    <p className="truncate font-semibold text-slate-900">{item.kegiatan ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDate(item.tanggal_kegiatan)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDate(item.deadline_spj)}</td>
                                                <td className="max-w-[140px] px-4 py-3">
                                                    <p className="truncate text-slate-700">{item.penyedia?.nama ?? '-'}</p>
                                                </td>
                                                <td className="max-w-[120px] px-4 py-3">
                                                    <p className="truncate text-slate-700">{item.pic?.nama ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex min-w-[80px] flex-col items-center gap-1">
                                                        <div className="h-2 w-full rounded-full bg-slate-200">
                                                            <div
                                                                className={`h-2 rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-orange-400' : 'bg-rose-500'}`}
                                                                style={{ width: `${pct}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-600">
                                                            {done}/{total}
                                                        </span>
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
                </AppContentCard>
            </div>
        </AppLayout>
    );
}
