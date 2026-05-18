import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { glassBtnPrimaryClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface PenyediaItem {
    id: number;
    nama: string;
    alamat: string | null;
    telepon: string | null;
}

interface Props {
    penyedias: PenyediaItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data Penyedia', href: '/penyedia' },
];

export default function PenyediaIndex({ penyedias }: Props) {
    function handleDelete(id: number) {
        if (confirm('Hapus data penyedia ini?')) {
            router.delete(`/penyedia/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Data Penyedia" />
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <AppPageHeader
                    title="Data Penyedia"
                    description="Kelola daftar penyedia catering"
                    action={
                        <Link href="/penyedia/create" className={glassBtnPrimaryClass}>
                            <Plus className="h-4 w-4" /> Tambah Penyedia
                        </Link>
                    }
                />

                <AppContentCard className="p-0">
                    {penyedias.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <p className="text-sm font-medium">Belum ada data penyedia.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="glass-table-head">
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Nama</th>
                                    <th className="px-4 py-3">Alamat</th>
                                    <th className="px-4 py-3">Telepon</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/70">
                                {penyedias.map((item, idx) => (
                                    <tr key={item.id} className="glass-table-row">
                                        <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                        <td className="px-4 py-3 font-semibold text-slate-900">{item.nama}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.alamat ?? '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{item.telepon ?? '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/penyedia/${item.id}/edit`} className="text-slate-600 hover:text-slate-900 transition-colors" title="Edit">
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
