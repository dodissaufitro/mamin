import { useState } from 'react';
import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { DokumenProgressBar } from '@/components/dokumen-tracking-fields';
import { glassBtnPrimaryClass } from '@/lib/glass-styles';
import { calcTotalHarga, formatRupiah } from '@/lib/spj-format';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Clock, Eye, Pencil, Plus, Trash2, XCircle } from 'lucide-react';

import { type DokumenProgress } from '@/lib/dokumen';

interface SpjItemData {
    id: number;
    jumlah_order: number;
    total_harga: number | string;
    item_hps?: {
        id: number;
        nama_item: string;
        harga_unit?: string | number;
    } | null;
}

interface SpjItem {
    id: number;
    tanggal_kegiatan: string | null;
    deadline_spj: string | null;
    pic: { id: number; nama: string; jabatan: string | null } | null;
    penyedia: { id: number; nama: string } | null;
    spj_items?: SpjItemData[];
    dokumen_progress?: DokumenProgress;
    kegiatan: string | null;
    total_harga: number | string | null;
    pembayaran_spj: boolean;
    tracking_spj: string | null;
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
    filters?: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'SPJ Makan Minum', href: '/spj' },
];

function formatDate(dateStr: string | null) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

function StatusBadge({ item }: { item: SpjItem }) {
    if (!item.tracking_spj) {
        return <span className="text-xs text-slate-500">-</span>;
    }

    let displayTracking = item.tracking_spj;
    if (displayTracking === 'SPPD & SOPD') displayTracking = 'SSPD & SPOD';
    if (displayTracking === 'Belum Lengkap') displayTracking = 'Tidak Lengkap';

    let colorClass = "border-sky-200 bg-sky-100 text-sky-700";
    if (displayTracking === 'Selesai') {
        colorClass = "border-emerald-200 bg-emerald-100 text-emerald-700";
    } else if (displayTracking === 'Dokumen Tidak Lengkap' || displayTracking === 'Menunggu Kelengkapan' || displayTracking === 'Tidak Lengkap' || displayTracking === 'SSPD & SPOD') {
        colorClass = "border-red-200 bg-red-100 text-red-600";
    }

    return (
        <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold leading-tight text-center min-w-[85px] max-w-[110px] whitespace-normal shadow-sm ${colorClass}`}>
            {displayTracking}
        </span>
    );
}

export default function SpjIndex({ data, filters: propFilters }: Props) {
    const { auth } = usePage<SharedData>().props;
    const permissions = auth.permissions ?? {};

    const initialFilters = {
        kegiatan: propFilters?.kegiatan || '',
        item_hps: propFilters?.item_hps || '',
        tanggal_kegiatan: propFilters?.tanggal_kegiatan || '',
        deadline_spj: propFilters?.deadline_spj || '',
        penyedia: propFilters?.penyedia || '',
        pic: propFilters?.pic || '',
        tracking_spj: propFilters?.tracking_spj || '',
        total_harga: propFilters?.total_harga || '',
        kelengkapan_dokumen: propFilters?.kelengkapan_dokumen || '',
    };
    const [filters, setFilters] = useState(initialFilters);

    function handleFilterChange(key: string, value: string) {
        setFilters(prev => ({ ...prev, [key]: value }));
    }

    function applyFilters() {
        const query = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
        router.get('/spj', query as any, { preserveState: true, replace: true });
    }

    function applyFilterImmediate(key: string, value: string) {
        const newFilters = { ...filters, [key]: value };
        const query = Object.fromEntries(Object.entries(newFilters).filter(([_, v]) => v !== ''));
        router.get('/spj', query as any, { preserveState: true, replace: true });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    }

    function handleDelete(id: number) {
        if (confirm('Hapus data SPJ ini?')) {
            router.delete(`/spj/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="SPJ Makan Minum Rapat" />
            
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6 min-w-0 w-full">
                <AppPageHeader
                    title="SPJ Makan Minum"
                    description="Kelola data SPJ makan dan minum rapat"
                />

                <div className="flex flex-col gap-4">
                    
<div className="flex w-full items-center justify-between">
    <p className="text-sm text-slate-500">Ketik pada kolom pencarian di tabel lalu tekan <kbd className="px-2 py-1 bg-slate-100 rounded border font-mono text-xs shadow-sm">Enter</kbd> untuk mencari.</p>
</div>

                    
                    <div>
                        {permissions['spj.create'] && (
                            <Link href="/spj/create" className={glassBtnPrimaryClass}>
                                <Plus className="h-4 w-4" /> Tambah SPJ
                            </Link>
                        )}
                    </div>
                </div>

                <AppContentCard className="p-0">
                    {data.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <p className="text-sm font-medium">Belum ada data SPJ.</p>
                            {permissions['spj.create'] && (
                                <Link href="/spj/create" className="mt-3 text-sm font-semibold text-sky-700 hover:underline">
                                    + Tambah sekarang
                                </Link>
                            )}
                        </div>
                    ) : (
                        <div className="max-h-[60vh] overflow-auto w-full">
                            <table className="w-full min-w-max text-sm">
                                <thead className="sticky top-0 z-10 bg-white/95 shadow-sm backdrop-blur dark:bg-slate-900/95">
                                    <tr className="glass-table-head text-xs font-bold tracking-wider text-slate-500 uppercase">
                                        <th className="px-4 pt-3 pb-1 text-center whitespace-nowrap">#</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">KEGIATAN</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">ITEM HPS</th>
                                        <th className="px-4 pt-3 pb-1 text-right whitespace-nowrap">TOTAL HARGA</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">TGL KEGIATAN</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">DEADLINE SPJ</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">PENYEDIA</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">PIC</th>
                                        <th className="px-4 pt-3 pb-1 text-center whitespace-nowrap">DOKUMEN</th>
                                        <th className="px-4 pt-3 pb-1 text-center whitespace-nowrap">KELENGKAPAN DOKUMEN</th>
                                        <th className="px-4 pt-3 pb-1 text-center whitespace-nowrap">TRACKING SPJ</th>
                                        <th className="px-4 pt-3 pb-1 text-center whitespace-nowrap">AKSI</th>
                                    </tr>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                                        <th className="px-2 py-1"></th>
                                        <th className="px-2 py-1 min-w-[150px]">
                                            <input type="text" placeholder="Cari Kegiatan..." value={filters.kegiatan} onChange={e => handleFilterChange('kegiatan', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1 min-w-[120px]">
                                            <input type="text" placeholder="Cari Item..." value={filters.item_hps} onChange={e => handleFilterChange('item_hps', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1 min-w-[120px]">
                                            <input type="text" placeholder="Cari Harga..." value={filters.total_harga || ''} onChange={e => handleFilterChange('total_harga', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1 min-w-[110px]">
                                            <input type="date" placeholder="YYYY-MM-DD" value={filters.tanggal_kegiatan} onChange={e => handleFilterChange('tanggal_kegiatan', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1 min-w-[110px]">
                                            <input type="date" placeholder="YYYY-MM-DD" value={filters.deadline_spj} onChange={e => handleFilterChange('deadline_spj', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1 min-w-[120px]">
                                            <input type="text" placeholder="Cari Penyedia..." value={filters.penyedia} onChange={e => handleFilterChange('penyedia', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1 min-w-[120px]">
                                            <input type="text" placeholder="Cari PIC..." value={filters.pic} onChange={e => handleFilterChange('pic', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1"></th>
                                        <th className="px-2 py-1 min-w-[110px]">
                                            <select value={filters.kelengkapan_dokumen || ''} onChange={e => { handleFilterChange('kelengkapan_dokumen', e.target.value); applyFilterImmediate('kelengkapan_dokumen', e.target.value); }} className="w-full rounded border border-slate-200 px-1 py-1 text-[11px] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal">
                                                <option value="">Semua</option>
                                                <option value="Lengkap">Lengkap</option>
                                                <option value="Tidak Lengkap">Tidak Lengkap</option>
                                            </select>
                                        </th>
                                        <th className="px-2 py-1 min-w-[130px]">
                                            <select value={filters.tracking_spj} onChange={e => { handleFilterChange('tracking_spj', e.target.value); applyFilterImmediate('tracking_spj', e.target.value); }} className="w-full rounded border border-slate-200 px-1 py-1 text-[11px] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal">
                                                <option value="">Semua</option>
                                                <option value="Tidak Lengkap">Tidak Lengkap</option>
                                                <option value="SSPD & SPOD">SSPD & SPOD</option>
                                                <option value="Bendahara Pengeluaran (Biling Pajak PPH23)">Bendahara Pengeluaran (Biling Pajak PPH23)</option>
                                                <option value="Approval Pejabat Penatausahaan Keuangan">Approval Pejabat Penatausahaan Keuangan</option>
                                                <option value="Approval PPATK">Approval PPATK</option>
                                                <option value="Approval KPA I">Approval KPA I</option>
                                                <option value="Bendahara Pengeluaran (CMS)">Bendahara Pengeluaran (CMS)</option>
                                                <option value="Approval KPA II">Approval KPA II</option>
                                                <option value="Upload Bukti Pembayaran">Upload Bukti Pembayaran</option>
                                                <option value="Selesai">Selesai</option>
                                            </select>
                                        </th>
                                        <th className="px-2 py-1"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/70">
                                    {data.data.map((item, index) => {
                                        const rowNum = (data.current_page - 1) * data.per_page + index + 1;

                                        const totalDok = item.dokumen_progress?.total ?? 0;
                                        const doneDok = item.dokumen_progress?.done ?? 0;
                                        const isLengkap = totalDok > 0 && doneDok === totalDok;

                                        return (
                                            <tr key={item.id} className="glass-table-row">
                                                <td className="px-4 py-3 text-center font-medium text-slate-500">{rowNum}</td>
                                                <td className="px-4 py-3 max-w-[200px]">
                                                    <p className="truncate font-semibold text-slate-900">{item.kegiatan ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3 max-w-[140px]">
                                                    <p className="truncate text-slate-700" title={item.spj_items?.map(i => i.item_hps?.nama_item).filter(Boolean).join(', ')}>
                                                        {item.spj_items?.map(i => i.item_hps?.nama_item).filter(Boolean).join(', ') || '-'}
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-slate-800">
                                                    {formatRupiah(item.total_harga || 0)}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDate(item.tanggal_kegiatan)}</td>
                                                <td className="px-4 py-3 whitespace-nowrap text-slate-700">{formatDate(item.deadline_spj)}</td>
                                                <td className="px-4 py-3 max-w-[140px]">
                                                    <p className="truncate text-slate-700">{item.penyedia?.nama ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3 max-w-[120px]">
                                                    <p className="truncate text-slate-700">{item.pic?.nama ?? '-'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex justify-center">
                                                        <DokumenProgressBar progress={item.dokumen_progress} />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-semibold leading-tight text-center min-w-[90px] shadow-sm ${isLengkap ? 'border-emerald-200 bg-emerald-100 text-emerald-700' : 'border-red-200 bg-red-100 text-red-600'}`}>
                                                        {isLengkap ? 'Lengkap' : 'Tidak Lengkap'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-center"><StatusBadge item={item} /></td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Link href={`/spj/${item.id}`} className="text-slate-600 hover:text-slate-900 transition-colors" title="Detail">
                                                            <Eye className="h-4 w-4" />
                                                        </Link>
                                                        {permissions['spj.update'] && item.tracking_spj !== 'Selesai' && (
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
                                        className={`rounded px-3 py-1 text-xs ${link.active
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
