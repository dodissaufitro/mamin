import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { glassBtnPrimaryClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface PicItem {
    id: number;
    nama: string;
    jabatan: string | null;
}

interface Props {
    pics: PicItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data PIC', href: '/pic' },
];

export default function PicIndex({ pics }: Props) {
    function handleDelete(id: number) {
        if (confirm('Hapus data PIC ini?')) {
            router.delete(`/pic/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data PIC" />
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <AppPageHeader
                    title="Data PIC"
                    description="Kelola penanggung jawab kegiatan"
                    action={
                        <Link href="/pic/create" className={glassBtnPrimaryClass}>
                            <Plus className="h-4 w-4" /> Tambah PIC
                        </Link>
                    }
                />

                <AppContentCard className="p-0">
                    {pics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <p className="text-sm font-medium">Belum ada data PIC.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="glass-table-head">
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Nama</th>
                                    <th className="px-4 py-3">Jabatan</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/70">
                                {pics.map((item, idx) => (
                                    <tr key={item.id} className="glass-table-row">
                                        <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-900">{item.nama}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.jabatan ?? '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/pic/${item.id}/edit`} className="text-slate-600 hover:text-slate-900 transition-colors" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)} className="text-rose-600 hover:text-rose-800 transition-colors" title="Hapus">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </AppContentCard>
            </div>
        </AppLayout>
    );
}
