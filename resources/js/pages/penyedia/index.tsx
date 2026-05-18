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
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-violet-800 dark:text-violet-200">Data Penyedia</h1>
                    <Link
                        href="/penyedia/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors shadow-md shadow-violet-200 dark:shadow-violet-900/30"
                    >
                        <Plus className="h-4 w-4" /> Tambah Penyedia
                    </Link>
                </div>

                <div className="rounded-xl border border-violet-200 bg-white shadow-sm dark:bg-sidebar dark:border-violet-800 overflow-hidden">
                    {penyedias.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <p className="text-sm">Belum ada data penyedia.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-violet-50 dark:bg-violet-900/20 text-left text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Nama</th>
                                    <th className="px-4 py-3">Alamat</th>
                                    <th className="px-4 py-3">Telepon</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {penyedias.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
                                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.nama}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.alamat ?? '-'}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.telepon ?? '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/penyedia/${item.id}/edit`} className="text-sky-400 hover:text-sky-600 transition-colors" title="Edit">
                                                    <Pencil className="h-4 w-4" />
                                                </Link>
                                                <button onClick={() => handleDelete(item.id)} className="text-rose-400 hover:text-rose-600 transition-colors" title="Hapus">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
