import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { glassBtnPrimaryClass } from '@/lib/glass-styles';
import { roleBadgeClass } from '@/lib/navigation';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';

interface Permission {
    id: number;
    name: string;
}

interface RoleItem {
    id: number;
    name: string;
    permissions: Permission[];
}

interface Props {
    roles: RoleItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Manajemen Role', href: '/roles' },
];

const PERMISSION_LABELS: Record<string, string> = {
    dashboard: 'Dashboard',
    spj: 'SPJ Mamin',
    pic: 'Data PIC',
    penyedia: 'Penyedia',
    item_hps: 'Item HPS',
    jenis_dokumen: 'Dokumen',
    users: 'Kelola User',
    roles: 'Role Akses',
    inbox: 'Inbox',
    tracking_spj: 'Tracking SPJ'
};

export default function RolesIndex({ roles }: Props) {
    function handleDelete(id: number) {
        if (confirm('Hapus role ini? User yang memiliki role ini mungkin kehilangan akses!')) {
            router.delete(`/roles/${id}`);
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Role" />
            <div className="flex flex-col gap-4 p-4 md:p-6 max-w-7xl mx-auto min-w-0 w-full">
                <AppPageHeader
                    title="Manajemen Role"
                    description="Atur role dan kelompok hak akses pengguna secara visual"
                    action={
                        <Link href="/roles/create" className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition-all hover:bg-violet-700 hover:shadow-violet-600/30 hover:-translate-y-0.5">
                            <Plus className="h-4 w-4" /> Tambah Role
                        </Link>
                    }
                />

                <AppContentCard className="p-0 border border-slate-200/60 shadow-lg shadow-slate-200/40 bg-white/60 backdrop-blur-xl">
                    {roles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <p className="text-sm font-medium">Belum ada data role.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto w-full">
                            <table className="w-full text-sm min-w-max">
                            <thead>
                                <tr className="bg-slate-50/80 border-b border-slate-200/80">
                                    <th className="px-5 py-4 text-left font-bold text-slate-600 w-16 uppercase tracking-wider text-xs whitespace-nowrap">#</th>
                                    <th className="px-5 py-4 text-left font-bold text-slate-600 w-48 uppercase tracking-wider text-xs whitespace-nowrap">Nama Role</th>
                                    <th className="px-5 py-4 text-left font-bold text-slate-600 uppercase tracking-wider text-xs whitespace-nowrap">Hak Akses Modul (Permissions)</th>
                                    <th className="px-5 py-4 text-center font-bold text-slate-600 w-24 uppercase tracking-wider text-xs whitespace-nowrap">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100/80">
                                {roles.map((item, idx) => {
                                    const grouped = item.permissions.reduce((acc, p) => {
                                        const [mod, crud] = p.name.split('.');
                                        if (!acc[mod]) acc[mod] = [];
                                        acc[mod].push(crud);
                                        return acc;
                                    }, {} as Record<string, string[]>);

                                    return (
                                        <tr key={item.id} className="hover:bg-white/80 transition-colors group">
                                            <td className="px-5 py-4 text-slate-400 font-medium">{idx + 1}</td>
                                            <td className="px-5 py-4">
                                                <span className={`inline-flex rounded-xl px-3 py-1 text-xs font-bold shadow-sm border border-white/50 ${roleBadgeClass(item.name)}`}>
                                                    {item.name.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex flex-wrap gap-2.5">
                                                    {Object.entries(grouped).map(([mod, cruds]) => {
                                                        const isFullAccess = ['view', 'create', 'update', 'delete'].every(c => cruds.includes(c));
                                                        const label = PERMISSION_LABELS[mod] || mod;
                                                        
                                                        return (
                                                            <div key={mod} className="flex overflow-hidden rounded-lg border border-violet-100 shadow-sm text-xs bg-white group-hover:border-violet-200 transition-colors">
                                                                <div className="bg-violet-50/80 text-violet-700 font-bold px-2.5 py-1.5 border-r border-violet-100">
                                                                    {label}
                                                                </div>
                                                                <div className={`px-2.5 py-1.5 font-medium tracking-tight ${isFullAccess ? 'text-emerald-600 bg-emerald-50/30' : 'text-slate-500'}`}>
                                                                    {isFullAccess ? 'Akses Penuh' : cruds.join(', ')}
                                                                </div>
                                                            </div>
                                                        );
                                                    })}
                                                    {item.permissions.length === 0 && (
                                                        <span className="text-slate-400 italic text-xs font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">Belum ada hak akses dikonfigurasi</span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex items-center justify-center gap-3">
                                                    <Link href={`/roles/${item.id}/edit`} className="text-slate-400 hover:text-violet-600 hover:bg-violet-50 p-2 rounded-lg transition-all" title="Edit Hak Akses">
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    {item.name !== 'super_admin' && (
                                                        <button onClick={() => handleDelete(item.id)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-all" title="Hapus Role">
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
