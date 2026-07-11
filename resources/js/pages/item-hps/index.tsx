import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { DokumenCountBadge } from '@/components/dokumen-tracking-fields';
import { glassBtnPrimaryClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface ItemHpsRow {
    id: number;
    nama_item: string;
    volume: string | number;
    sisa_volume: string | number;
    harga_unit: string | number;
    jenis_dokumens_count: number;
}

interface Props {
    items: ItemHpsRow[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Item HPS', href: '/item-hps' },
];

function formatRupiah(value: string | number) {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatVolume(value: string | number) {
    const amount = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(amount);
}

export default function ItemHpsIndex({ items }: Props) {
    function handleDelete(id: number) {
        if (confirm('Hapus item HPS ini?')) {
            router.delete(`/item-hps/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Item HPS" />
            <div className="flex flex-col gap-4 p-4 md:p-6 min-w-0 w-full">
                <AppPageHeader
                    title="Item HPS"
                    description="Kelola daftar item dan harga satuan HPS"
                    action={
                        <Link href="/item-hps/create" className={glassBtnPrimaryClass}>
                            <Plus className="h-4 w-4" /> Tambah Item
                        </Link>
                    }
                />

                <AppContentCard className="p-0">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <p className="text-sm font-medium">Belum ada data item HPS.</p>
                            <Link href="/item-hps/create" className="mt-3 text-sm font-semibold text-sky-700 hover:underline">
                                + Tambah sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm min-w-max">
                            <thead>
                                <tr className="glass-table-head">
                                    <th className="px-4 py-3 whitespace-nowrap">#</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Nama Item</th>
                                    <th className="px-4 py-3 text-right whitespace-nowrap">Volume (Total)</th>
                                    <th className="px-4 py-3 text-right whitespace-nowrap">Volume (Digunakan)</th>
                                    <th className="px-4 py-3 text-right whitespace-nowrap">Sisa Volume</th>
                                    <th className="px-4 py-3 text-right whitespace-nowrap">Harga Unit</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap">Dokumen Berlaku</th>
                                    <th className="px-4 py-3 text-center whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/70">
                                {items.map((item, idx) => (
                                    <tr key={item.id} className="glass-table-row">
                                        <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-900">{item.nama_item}</td>
                                        <td className="px-4 py-3 text-right text-slate-700">{formatVolume(item.volume)}</td>
                                        <td className="px-4 py-3 text-right text-rose-600 font-medium">
                                            {formatVolume(Number(item.volume) - Number(item.sisa_volume))}
                                        </td>
                                        <td className="px-4 py-3 text-right text-emerald-700 font-semibold">{formatVolume(item.sisa_volume)}</td>
                                        <td className="px-4 py-3 text-right font-medium text-slate-800">{formatRupiah(item.harga_unit)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <DokumenCountBadge count={item.jenis_dokumens_count} />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/item-hps/${item.id}/edit`}
                                                    className="text-slate-600 transition-colors hover:text-slate-900"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(item.id)}
                                                    className="text-rose-600 transition-colors hover:text-rose-800"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            </table>
                        </div>
                    )}
                </AppContentCard>
            </div>
        </AppLayout>
    );
}
