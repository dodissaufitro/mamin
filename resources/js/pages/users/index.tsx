import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { glassBtnPrimaryClass } from '@/lib/glass-styles';
import { roleBadgeClass } from '@/lib/navigation';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    role_label: string;
}

interface Props {
    users: UserItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kelola User', href: '/users' },
];

export default function UsersIndex({ users }: Props) {
    function handleDelete(id: number) {
        if (confirm('Hapus user ini?')) {
            router.delete(`/users/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Kelola User" />
            <div className="flex flex-col gap-4 p-4 md:p-6 min-w-0 w-full">
                <AppPageHeader
                    title="Kelola User"
                    description="Manajemen akun pengguna dan role akses"
                    action={
                        <Link href="/users/create" className={glassBtnPrimaryClass}>
                            <Plus className="h-4 w-4" /> Tambah User
                        </Link>
                    }
                />

                <AppContentCard className="p-0">
                    {users.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <p className="text-sm font-medium">Belum ada data user.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm min-w-max">
                                <thead>
                                    <tr className="glass-table-head">
                                        <th className="px-4 py-3 whitespace-nowrap">#</th>
                                        <th className="px-4 py-3 text-left whitespace-nowrap">Nama</th>
                                        <th className="px-4 py-3 text-left whitespace-nowrap">Email</th>
                                        <th className="px-4 py-3 text-left whitespace-nowrap">Role</th>
                                        <th className="px-4 py-3 text-center whitespace-nowrap">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/70">
                                    {users.map((item, idx) => (
                                        <tr key={item.id} className="glass-table-row">
                                            <td className="px-4 py-3 text-slate-500">{idx + 1}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-900">{item.name}</td>
                                            <td className="px-4 py-3 text-slate-700">{item.email}</td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(item.role)}`}>
                                                    {item.role_label}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link href={`/users/${item.id}/edit`} className="text-slate-600 hover:text-slate-900 transition-colors" title="Edit">
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
                        </div>
                    )}
                </AppContentCard>
            </div>
        </AppLayout>
    );
}
