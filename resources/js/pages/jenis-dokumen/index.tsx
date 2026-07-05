import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { glassBtnPrimaryClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface JenisDokumenRow {
    id: number;
    nama: string;
    kode: string;
    item_hps_count: number;
}

interface Props {
    jenisDokumens: JenisDokumenRow[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Dokumen Berlaku', href: '/jenis-dokumen' },
];

export default function JenisDokumenIndex({ jenisDokumens }: Props) {
    function handleDelete(id: number) {
        if (confirm('Hapus jenis dokumen ini?')) {
            router.delete(`/jenis-dokumen/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dokumen Berlaku" />
            <div className="flex flex-col gap-4 p-4 md:p-6 min-w-0 w-full">
                <AppPageHeader
                    title="Dokumen Berlaku"
                    description="Kelola jenis dokumen yang dapat dipilih pada Item HPS"
                    action={
                        <Link href="/jenis-dokumen/create" className={glassBtnPrimaryClass}>
                            <Plus className="h-4 w-4" /> Tambah Dokumen
                        </Link>
                    }
                />

                <AppContentCard className="p-0">
                    {jenisDokumens.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <p className="text-sm font-medium">Belum ada jenis dokumen.</p>
                            <Link href="/jenis-dokumen/create" className="mt-3 text-sm font-semibold text-sky-700 hover:underline">
                                + Tambah sekarang
                            </Link>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm min-w-max">
                                <thead>
                                    <tr className="glass-table-head">
                                        <th className="px-4 py-3 whitespace-nowrap">#</th>
                                        <th className="px-4 py-3 whitespace-nowrap">Nama Dokumen</th>
                                        <th className="px-4 py-3 text-center whitespace-nowrap">Digunakan Item HPS</th>
                                        <th className="px-4 py-3 text-center whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/70">
                                    {jenisDokumens.map((item, idx) => (
                                        <tr key={item.id} className="glass-table-row">
                                            <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-900">{item.nama}</td>
                                            <td className="px-4 py-3 text-center text-slate-700">{item.item_hps_count}</td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                <Link
                                                    href={`/jenis-dokumen/${item.id}/edit`}
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
