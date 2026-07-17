import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { GlassPanel } from '@/components/glass-panel';
import { ItemAnggaranChart, type ItemAnggaranDatum } from '@/components/item-anggaran-chart';
import { DokumenProgressBar } from '@/components/dokumen-tracking-fields';
import { dokumenProgressFromCounts, type DokumenProgress, type JenisDokumenItem, type SpjDokumenItem } from '@/lib/dokumen';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import {
    AlertTriangle,
    CheckCircle2,
    ClipboardList,
    Clock,
    FileCheck2,
    XCircle,
    Utensils,
    Layers,
    PieChart,
    TrendingUp,
    User,
    Package,
    Coffee,
    Droplet,
    Info,
    Calendar,
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react';

interface SpjItem {
    id: number;
    tanggal_kegiatan: string | null;
    deadline_spj: string | null;
    pic: { id: number; nama: string } | null;
    penyedia: { id: number; nama: string } | null;
    kegiatan: string | null;
    spj_items?: {
        id: number;
        jumlah_order: number;
        total_harga: number | string;
        item_hps?: {
            id: number;
            nama_item: string;
            jenis_dokumens?: JenisDokumenItem[];
        } | null;
    }[];
    spj_dokumens?: SpjDokumenItem[];
    kelengkapan_dokumen: boolean;
    pembayaran_spj: boolean;
    kasubbag_kasi: string | null;
    staf: string | null;
    link_spj: string | null;
    tracking_spj: string | null;
    total_harga: number | string | null;
}

interface Stats {
    total: number;
    sudah_bayar: number;
    belum_bayar: number;
    dokumen_lengkap: number;
    deadline_dekat: number;
    terlambat: number;
}

interface DistribusiItem {
    unit: string;
    terpakai: number;
    persentase: number;
}

interface ItemHpsStats {
    id: number;
    nama_item: string;
    volume: number;
    terpakai: number;
    sisa: number;
    realisasi: number;
    distribusi: DistribusiItem[];
    status_spj: {
        selesai: number;
        proses: number;
    };
}

interface Props {
    stats: Stats;
    recent: SpjItem[];
    itemVolumes: ItemAnggaranDatum[];
    items: ItemHpsStats[];
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function dokumenProgress(item: SpjItem): DokumenProgress {
    const requiredIds = Array.from(new Set(
        (item.spj_items ?? [])
            .flatMap(i => i.item_hps?.jenis_dokumens ?? [])
            .map(d => d.id)
    ));
    const uploadedIds = item.spj_dokumens?.map((d) => d.jenis_dokumen_id) ?? [];
    const done = requiredIds.filter((id) => uploadedIds.includes(id)).length;

    return dokumenProgressFromCounts(done, requiredIds.length);
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
    { accent: 'text-slate-800' },
    { accent: 'text-emerald-400' },
    { accent: 'text-rose-400' },
    { accent: 'text-sky-300' },
    { accent: 'text-orange-400' },
    { accent: 'text-red-500' },
];

function formatNumber(num: number) {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(num);
}

function getItemIcon(name: string) {
    const lower = name.toLowerCase();
    if (lower.includes('kopi') || lower.includes('teh')) return Coffee;
    if (lower.includes('galon') || lower.includes('air')) return Droplet;
    if (lower.includes('snack') || lower.includes('box')) return Package;
    return Package;
}

export default function Dashboard({ stats, recent, itemVolumes, items = [] }: Props) {
    const { auth } = usePage<SharedData>().props;
    const permissions = auth.permissions ?? {};

    function handleDelete(id: number) {
        if (confirm('Hapus data SPJ ini?')) {
            router.delete(`/spj/${id}`);
        }
    }

    const statCards = [
        { label: 'Total SPJ', value: stats?.total || 0, icon: ClipboardList },
        { label: 'Sudah Dibayar', value: stats?.sudah_bayar || 0, icon: CheckCircle2 },
        { label: 'Belum Dibayar', value: stats?.belum_bayar || 0, icon: XCircle },
        { label: 'Dokumen Lengkap', value: stats?.dokumen_lengkap || 0, icon: FileCheck2 },
        { label: 'Deadline ≤ 7 Hari', value: stats?.deadline_dekat || 0, icon: AlertTriangle },
        { label: 'Terlambat', value: stats?.terlambat || 0, icon: Clock },
    ];

    const itemsArray: ItemHpsStats[] = Array.isArray(items) ? items : (Object.values(items || {}) as ItemHpsStats[]);
    const [selectedId, setSelectedId] = useState<number | null>(itemsArray.length > 0 ? itemsArray[0].id : null);
    const [searchQuery, setSearchQuery] = useState('');
    const selectedItem = itemsArray.find((i) => i.id === selectedId) || itemsArray[0];

    const filteredItems = itemsArray.filter(item =>
        item.nama_item.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const todayDateStr = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex flex-col gap-6 p-4 md:p-6 min-w-0 w-full">

                {/* 1. Header */}
                <AppPageHeader title="Dashboard" description="Ringkasan SPJ Makan Minum" />

                {/* 2. Top Stats Cards */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
                    {statCards.map((card, i) => {
                        const style = statCardStyles[i];
                        return (
                            <div key={card.label} className="flex flex-col rounded-3xl bg-white shadow-sm p-6 justify-center">
                                <p className={`text-4xl font-bold ${style.accent}`}>{card.value}</p>
                                <p className="mt-2 text-xs font-semibold text-slate-500">{card.label}</p>
                            </div>
                        );
                    })}
                </div>

                {/* 3. Sisa Anggaran HPS Chart */}
                <GlassPanel className="rounded-2xl p-5">
                    <ItemAnggaranChart data={itemVolumes} />
                </GlassPanel>

                {/* 4. Realisasi Volume Section (Item-centric Dashboard) */}
                <GlassPanel className="rounded-2xl p-5">
                    <div className="mb-6">
                        <h2 className="text-sm font-bold text-slate-900">Realisasi Volume</h2>
                        <p className="mt-0.5 text-xs text-slate-600">
                            Realisasi Volume Per Item Setelah Pemesanan SPJ
                        </p>
                    </div>

                    {!selectedItem ? (
                        <div className="flex py-12 items-center justify-center text-slate-500">
                            Belum ada data Item HPS.
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-6">
                            {/* Sidebar Items */}
                            <div className="w-full md:w-64 flex-shrink-0">
                                <div className="mb-3 flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-slate-700 tracking-wider">Konsumsi</h3>
                                </div>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        placeholder="Cari item..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full rounded-lg border-slate-200 bg-white/50 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-sky-500 focus:ring-sky-500"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                    {filteredItems.length === 0 ? (
                                        <p className="text-center text-xs text-slate-400 py-4">Item tidak ditemukan</p>
                                    ) : (
                                        filteredItems.map((item) => {
                                            const isActive = item.id === selectedId;
                                            return (
                                                <button
                                                    key={item.id}
                                                    onClick={() => setSelectedId(item.id)}
                                                    className={`w-full rounded-lg px-4 py-2.5 text-left text-sm font-bold transition-all ${isActive
                                                        ? 'bg-blue-200 text-slate-800'
                                                        : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                                        }`}
                                                >
                                                    {item.nama_item}
                                                </button>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Item Content */}
                            <div className="flex-1 min-w-0">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedItem.nama_item}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">Ringkasan Penggunaan Volume</p>
                                </div>

                                {/* Top Stats */}
                                <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                                    <div className="flex flex-col items-center justify-center rounded-[40px] bg-sky-200/80 p-6 text-center shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-700 tracking-widest uppercase mb-1">Total Volume</p>
                                        <p className="text-xl font-bold text-slate-900">{formatNumber(selectedItem.volume)}</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-[40px] bg-sky-200/80 p-6 text-center shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-700 tracking-widest uppercase mb-1">Terpakai</p>
                                        <p className="text-xl font-bold text-slate-900">{formatNumber(selectedItem.terpakai)}</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-[40px] bg-sky-200/80 p-6 text-center shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-700 tracking-widest uppercase mb-1">Sisa</p>
                                        <p className="text-xl font-bold text-slate-900">{formatNumber(selectedItem.sisa)}</p>
                                    </div>
                                    <div className="flex flex-col items-center justify-center rounded-[40px] bg-sky-200/80 p-6 text-center shadow-sm">
                                        <p className="text-[10px] font-bold text-slate-700 tracking-widest uppercase mb-1">Realisasi</p>
                                        <p className="text-xl font-bold text-slate-900">{formatNumber(selectedItem.realisasi)}%</p>
                                    </div>
                                </div>

                                <div className="grid lg:grid-cols-2 gap-6">
                                    {/* Distribusi */}
                                    <div>
                                        <h4 className="mb-3 text-xs font-bold text-slate-700">Distribusi Pelaksanaan</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {selectedItem.distribusi.length === 0 ? (
                                                <div className="col-span-2 py-4 text-sm text-slate-400">Belum ada distribusi</div>
                                            ) : (
                                                selectedItem.distribusi.map((dist, idx) => (
                                                    <div key={idx} className="flex flex-col items-center justify-center rounded-[40px] bg-sky-200/80 p-5 text-center shadow-sm">
                                                        <p className="text-[10px] font-bold text-slate-700 tracking-wider uppercase mb-1">{dist.unit}</p>
                                                        <p className="text-sm font-bold text-slate-900">{formatNumber(dist.terpakai)}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Status SPJ */}
                                    <div>
                                        <h4 className="mb-3 text-xs font-bold text-slate-700">Status SPJ</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="flex flex-col items-center justify-center rounded-[40px] bg-sky-200/80 p-5 text-center shadow-sm">
                                                <p className="text-[10px] font-bold text-slate-700 tracking-wider uppercase mb-1">SPJ SELESAI</p>
                                                <p className="text-sm font-bold text-slate-900">{formatNumber(selectedItem.status_spj.selesai)}</p>
                                            </div>
                                            <div className="flex flex-col items-center justify-center rounded-[40px] bg-sky-200/80 p-5 text-center shadow-sm">
                                                <p className="text-[10px] font-bold text-slate-700 tracking-wider uppercase mb-1">PROSES SPJ</p>
                                                <p className="text-sm font-bold text-slate-900">{formatNumber(selectedItem.status_spj.proses)}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </GlassPanel>

                {/* 5. Tabel SPJ Terbaru */}
                <AppContentCard className="p-0">
                    <div className="flex items-center justify-between border-b border-slate-200/80 bg-slate-50/80 px-5 py-4">
                        <div>
                            <h2 className="text-sm font-bold text-slate-900">SPJ Terbaru</h2>
                            <p className="mt-0.5 text-xs text-slate-600">Riwayat Pemesanan Penyediaan Makanan dan Minuman Terbaru</p>
                        </div>
                        <Link href="/spj" className="text-xs font-semibold text-sky-700 hover:text-sky-900 hover:underline">
                            Lihat Semua →
                        </Link>
                    </div>
                    {recent?.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                            <ClipboardList className="mb-3 h-10 w-10 opacity-50" />
                            <p className="text-sm font-medium">Belum ada data SPJ</p>
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-auto w-full">
                            <table className="w-full text-sm min-w-max">
                                <thead className="sticky top-0 z-10 bg-white/95 shadow-sm backdrop-blur dark:bg-slate-900/95">
                                    <tr className="glass-table-head text-xs font-bold tracking-wider text-slate-500 uppercase">
                                        <th className="px-4 py-3 text-center w-10 whitespace-nowrap">#</th>
                                        <th className="px-4 py-3 text-left whitespace-nowrap">KEGIATAN</th>
                                        <th className="px-4 py-3 text-left whitespace-nowrap">ITEM HPS</th>
                                        <th className="px-4 py-3 text-right whitespace-nowrap">TOTAL HARGA</th>
                                        <th className="px-4 py-3 text-left whitespace-nowrap">TGL KEGIATAN</th>
                                        <th className="px-4 py-3 text-left whitespace-nowrap">DEADLINE SPJ</th>
                                        <th className="px-4 py-3 text-left whitespace-nowrap">PENYEDIA</th>
                                        <th className="px-4 py-3 text-left whitespace-nowrap">PIC</th>
                                        <th className="px-4 py-3 text-center whitespace-nowrap">DOKUMEN</th>
                                        <th className="px-4 py-3 text-center whitespace-nowrap">KELENGKAPAN DOKUMEN</th>
                                        <th className="px-4 py-3 text-center whitespace-nowrap">TRACKING SPJ</th>
                                        <th className="px-4 py-3 text-center whitespace-nowrap">AKSI</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/70">
                                    {recent?.map((item, index) => {
                                        const { done, total, pct } = dokumenProgress(item);
                                        const itemsText = item.spj_items?.map(i => i.item_hps?.nama_item).filter(Boolean).join(', ') || '-';

                                        return (
                                            <tr key={item.id} className="glass-table-row">
                                                <td className="px-4 py-3 text-center font-medium text-slate-500">{index + 1}</td>
                                                <td className="max-w-[150px] px-4 py-3">
                                                    <p className="truncate font-semibold text-slate-900">{item.kegiatan ?? '-'}</p>
                                                </td>
                                                <td className="max-w-[100px] px-4 py-3">
                                                    <p className="truncate text-slate-700" title={itemsText}>{itemsText}</p>
                                                </td>
                                                <td className="px-4 py-3 text-right font-medium text-slate-800">
                                                    {item.total_harga ? `Rp ${new Intl.NumberFormat('id-ID').format(Number(item.total_harga))}` : '-'}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDate(item.tanggal_kegiatan)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDate(item.deadline_spj)}</td>
                                                <td className="max-w-[120px] px-4 py-3">
                                                    <p className="truncate text-slate-700">{item.penyedia?.nama ?? '-'}</p>
                                                </td>
                                                <td className="max-w-[120px] px-4 py-3">
                                                    <p className="truncate text-slate-700">{item.pic?.nama ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center">
                                                        <DokumenProgressBar progress={{ done, total, pct }} />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {(() => {
                                                        const isLengkap = total > 0 && done === total;
                                                        return (
                                                            <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold leading-tight text-center min-w-[90px] shadow-sm ${isLengkap ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-red-200 bg-red-100 text-red-600'}`}>
                                                                {isLengkap ? 'Lengkap' : 'Tidak Lengkap'}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    {(() => {
                                                        if (!item.tracking_spj) return <span className="text-xs text-slate-500">-</span>;
                                                        const displayTracking = item.tracking_spj === 'SPPD & SOPD' ? 'SPPD & SOPD' : item.tracking_spj;
                                                        let colorClass = "border-sky-200 bg-sky-100 text-sky-700";
                                                        if (displayTracking === 'Selesai') {
                                                            colorClass = "border-emerald-200 bg-emerald-100 text-emerald-700";
                                                        } else if (displayTracking === 'Dokumen Tidak Lengkap' || displayTracking === 'Menunggu Kelengkapan' || displayTracking === 'Tidak Lengkap' || displayTracking === 'SPPD & SOPD') {
                                                            colorClass = "border-red-200 bg-red-100 text-red-600";
                                                        }

                                                        return (
                                                            <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold leading-tight text-center min-w-[85px] max-w-[110px] whitespace-normal shadow-sm ${colorClass}`}>
                                                                {displayTracking}
                                                            </span>
                                                        );
                                                    })()}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={`/spj/${item.id}`} className="text-slate-600 hover:text-slate-900 transition-colors" title="Detail">
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        {permissions['spj.update'] && (
                                                            <Link href={`/spj/${item.id}/edit`} className="text-slate-600 hover:text-slate-900 transition-colors" title="Edit">
                                                                <Pencil className="h-4 w-4" />
                                                            </Link>
                                                        )}
                                                        {permissions['spj.delete'] && (
                                                            <button onClick={() => handleDelete(item.id)} className="text-rose-600 hover:text-rose-800 transition-colors" title="Hapus">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                    </div>
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
