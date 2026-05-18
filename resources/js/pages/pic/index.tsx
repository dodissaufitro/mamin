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
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold text-violet-800 dark:text-violet-200">Data PIC</h1>
                    <Link
                        href="/pic/create"
                        className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors shadow-md shadow-violet-200 dark:shadow-violet-900/30"
                    >
                        <Plus className="h-4 w-4" /> Tambah PIC
                    </Link>
                </div>

                <div className="rounded-xl border border-violet-200 bg-white shadow-sm dark:bg-sidebar dark:border-violet-800 overflow-hidden">
                    {pics.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <p className="text-sm">Belum ada data PIC.</p>
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-violet-50 dark:bg-violet-900/20 text-left text-xs font-semibold text-violet-700 dark:text-violet-300 uppercase tracking-wide">
                                    <th className="px-4 py-3">#</th>
                                    <th className="px-4 py-3">Nama</th>
                                    <th className="px-4 py-3">Jabatan</th>
                                    <th className="px-4 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {pics.map((item, idx) => (
                                    <tr key={item.id} className="hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
                                        <td className="px-4 py-3 text-gray-400">{idx + 1}</td>
                                        <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{item.nama}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{item.jabatan ?? '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link href={`/pic/${item.id}/edit`} className="text-sky-400 hover:text-sky-600 transition-colors" title="Edit">
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
