import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { calcTotalHarga, formatRupiah } from '@/lib/spj-format';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Trash2 } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inbox / My Task', href: '/inbox' },
];

const dokumenKeys: any[] = [
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

function dokumenProgress(item: any) {
    const done = dokumenKeys.filter((d) => item[d.key] === true).length;
    const total = dokumenKeys.length;
    return { done, total, pct: Math.round((done / total) * 100) };
}

function StatusBadge({ item }: { item: any }) {
    if (!item.tracking_spj) {
        return <span className="text-xs text-slate-500">-</span>;
    }
    
    let colorClass = "border-sky-300 bg-sky-100 text-sky-800";
    if (item.tracking_spj === 'Selesai') {
        colorClass = "border-emerald-300 bg-emerald-100 text-emerald-800";
    } else if (item.tracking_spj === 'Dokumen Tidak Lengkap') {
        colorClass = "border-red-300 bg-red-100 text-red-800";
    }
    
    return (
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${colorClass}`}>
            {item.tracking_spj}
        </span>
    );
}

export default function InboxIndex({ tasks }: { tasks: any }) {
    function handleDelete(id: number) {
        if (confirm('Hapus data SPJ ini?')) {
            router.delete(`/spj/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inbox / My Task" />
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <AppPageHeader
                    title="Inbox / My Task"
                    description="Tugas dan SPJ yang perlu ditinjau atau diproses."
                />

                <AppContentCard className="p-0">
                    {tasks.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <p className="text-sm font-medium">Tidak ada tugas.</p>
                            <p className="mt-1 text-xs">Semua SPJ sudah selesai diproses.</p>
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
                                    {tasks.data.map((item: any, idx: number) => {
                                        const { done, total, pct } = dokumenProgress(item);
                                        const rowNum = (tasks.current_page - 1) * tasks.per_page + idx + 1;
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
                    {tasks.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/60 px-4 py-3">
                            <p className="text-xs text-slate-600">
                                Menampilkan {(tasks.current_page - 1) * tasks.per_page + 1}–{Math.min(tasks.current_page * tasks.per_page, tasks.total)} dari {tasks.total} data
                            </p>
                            <div className="flex gap-1">
                                {tasks.links.map((link: any, i: number) => (
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
