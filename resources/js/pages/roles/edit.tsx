import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { glassBtnPrimaryClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { 
    ChevronLeft, Save, 
    LayoutDashboard, FileText, Users, Store, Package, FileCheck2, UserCog, ShieldAlert, Inbox,
    Eye, PlusCircle, Edit2, Trash2, MapPin
} from 'lucide-react';

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
    role: RoleItem;
    permissions: Permission[];
}

const PERMISSION_GROUPS = [
    { label: 'Dashboard', key: 'dashboard', cruds: ['view'], icon: LayoutDashboard, desc: 'Akses halaman utama dan statistik ringkasan' },
    { label: 'SPJ Makan Minum', key: 'spj', cruds: ['view', 'create', 'update', 'delete'], icon: FileCheck2, desc: 'Pengelolaan data Surat Pertanggungjawaban' },
    { label: 'Data PIC', key: 'pic', cruds: ['view', 'create', 'update', 'delete'], icon: Users, desc: 'Manajemen person in charge (Penanggung Jawab)' },
    { label: 'Data Penyedia', key: 'penyedia', cruds: ['view', 'create', 'update', 'delete'], icon: Store, desc: 'Manajemen mitra/vendor penyedia jasa' },
    { label: 'Item HPS', key: 'item_hps', cruds: ['view', 'create', 'update', 'delete'], icon: Package, desc: 'Kelola master Harga Perkiraan Sendiri (HPS)' },
    { label: 'Jenis Dokumen', key: 'jenis_dokumen', cruds: ['view', 'create', 'update', 'delete'], icon: FileText, desc: 'Pengaturan jenis dokumen yang wajib di-upload' },
    { label: 'Kelola User', key: 'users', cruds: ['view', 'create', 'update', 'delete'], icon: UserCog, desc: 'Manajemen akun pengguna aplikasi' },
    { label: 'Manajemen Role', key: 'roles', cruds: ['view', 'create', 'update', 'delete'], icon: ShieldAlert, desc: 'Manajemen role dan hak akses sistem' },
    { label: 'Inbox / Notifikasi', key: 'inbox', cruds: ['view'], icon: Inbox, desc: 'Akses ke kotak masuk dan notifikasi' },
    { label: 'Tracking SPJ', key: 'tracking_spj', cruds: ['update'], icon: MapPin, desc: 'Akses mengubah status perjalanan SPJ' },
];

export default function RolesEdit({ role, permissions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Manajemen Role', href: '/roles' },
        { title: 'Edit', href: `/roles/${role.id}/edit` },
    ];

    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        permissions: role.permissions.map(p => p.name),
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        put(`/roles/${role.id}`);
    }

    function togglePermission(permName: string) {
        if (data.permissions.includes(permName)) {
            setData('permissions', data.permissions.filter(p => p !== permName));
        } else {
            setData('permissions', [...data.permissions, permName]);
        }
    }

    function isChecked(key: string, crud: string) {
        return data.permissions.includes(`${key}.${crud}`);
    }

    const isSystemRole = role.name === 'super_admin';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Role ${role.name}`} />
            <div className="flex flex-col gap-4 p-4 md:p-6 max-w-5xl mx-auto min-w-0 w-full">
                <AppPageHeader
                    title={`Edit Role: ${role.name}`}
                    description="Ubah nama role atau hak akses matriksnya"
                    action={
                        <div className="flex items-center gap-2">
                            <Link href="/roles" className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors bg-white/50 px-4 py-2.5 rounded-xl border border-slate-200/60 shadow-sm backdrop-blur-sm">
                                <ChevronLeft className="h-4 w-4" /> Kembali
                            </Link>
                            <button
                                form="role-form"
                                type="submit"
                                disabled={processing}
                                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-violet-600/20 transition-all hover:bg-violet-700 hover:shadow-violet-600/30 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:pointer-events-none"
                            >
                                <Save className="h-4 w-4" /> Simpan Perubahan
                            </button>
                        </div>
                    }
                />

                <AppContentCard className="p-6 md:p-8 bg-white/40 backdrop-blur-md border border-white/60 shadow-xl shadow-slate-200/40">
                    <form id="role-form" onSubmit={handleSubmit} className="flex flex-col gap-8">
                        <div className="flex flex-col gap-1 w-full md:w-1/2">
                            <label className="text-sm font-semibold text-slate-700">Nama Role <span className="text-rose-500">*</span></label>
                            <input
                                type="text"
                                className={`rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium outline-none transition-all w-full shadow-sm ${isSystemRole ? 'bg-slate-100/50 text-slate-500 cursor-not-allowed' : 'bg-white/80 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'}`}
                                value={data.name}
                                onChange={e => !isSystemRole && setData('name', e.target.value)}
                                disabled={isSystemRole}
                            />
                            {isSystemRole && <p className="text-xs font-medium text-amber-600 mt-1.5 flex items-center gap-1"><ShieldAlert className="w-3.5 h-3.5"/> Role sistem (Super Admin) dilindungi secara permanen.</p>}
                            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                        </div>

                        <div className="flex flex-col gap-4 pt-2">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Matriks Hak Akses (Permissions)</h3>
                                <p className="text-sm font-medium text-slate-500 mt-0.5">Tentukan otorisasi fungsi secara mendetail untuk role ini pada setiap modul sistem.</p>
                            </div>
                            
                            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/70 backdrop-blur-sm shadow-sm w-full">
                                <table className="w-full text-sm text-left min-w-max">
                                    <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200/80">
                                        <tr>
                                            <th className="px-5 py-5 font-bold uppercase tracking-wider text-xs whitespace-nowrap">Modul Sistem</th>
                                            <th className="px-3 py-5 text-center w-28 whitespace-nowrap">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="bg-blue-100 text-blue-700 p-2 rounded-xl shadow-sm"><Eye className="w-4 h-4"/></span>
                                                    <span className="font-bold text-xs uppercase tracking-wider text-slate-600">View</span>
                                                </div>
                                            </th>
                                            <th className="px-3 py-5 text-center w-28 whitespace-nowrap">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="bg-emerald-100 text-emerald-700 p-2 rounded-xl shadow-sm"><PlusCircle className="w-4 h-4"/></span>
                                                    <span className="font-bold text-xs uppercase tracking-wider text-slate-600">Create</span>
                                                </div>
                                            </th>
                                            <th className="px-3 py-5 text-center w-28 whitespace-nowrap">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="bg-amber-100 text-amber-700 p-2 rounded-xl shadow-sm"><Edit2 className="w-4 h-4"/></span>
                                                    <span className="font-bold text-xs uppercase tracking-wider text-slate-600">Update</span>
                                                </div>
                                            </th>
                                            <th className="px-3 py-5 text-center w-28 whitespace-nowrap">
                                                <div className="flex flex-col items-center gap-1.5">
                                                    <span className="bg-rose-100 text-rose-700 p-2 rounded-xl shadow-sm"><Trash2 className="w-4 h-4"/></span>
                                                    <span className="font-bold text-xs uppercase tracking-wider text-slate-600">Delete</span>
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100/80">
                                        {PERMISSION_GROUPS.map((group) => {
                                            const Icon = group.icon;
                                            return (
                                                <tr key={group.key} className="hover:bg-white/90 transition-colors group">
                                                    <td className="px-5 py-4">
                                                        <div className="flex items-start gap-3.5">
                                                            <div className="mt-0.5 p-2.5 bg-slate-100/80 rounded-xl text-slate-500 shadow-sm border border-slate-200/50 group-hover:bg-violet-100 group-hover:text-violet-700 group-hover:border-violet-200 transition-all duration-300">
                                                                <Icon className="w-5 h-5" />
                                                            </div>
                                                            <div className="flex flex-col justify-center pt-0.5">
                                                                <h4 className="font-bold text-slate-800 text-sm">{group.label}</h4>
                                                                <p className="text-xs font-medium text-slate-500 mt-0.5">{group.desc}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {['view', 'create', 'update', 'delete'].map((crud) => (
                                                        <td key={crud} className="px-3 py-4 text-center align-middle">
                                                            {group.cruds.includes(crud) ? (
                                                                <label className="inline-flex items-center justify-center cursor-pointer p-2.5 rounded-full hover:bg-slate-100 transition-colors group/check">
                                                                    <input
                                                                        type="checkbox"
                                                                        className="rounded-md border-slate-300 text-violet-600 focus:ring-violet-500 focus:ring-offset-1 w-5 h-5 cursor-pointer shadow-sm transition-transform duration-200 group-hover/check:scale-110"
                                                                        checked={isChecked(group.key, crud)}
                                                                        onChange={() => togglePermission(`${group.key}.${crud}`)}
                                                                    />
                                                                </label>
                                                            ) : (
                                                                <div className="flex justify-center opacity-40">
                                                                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                                                                </div>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                            {errors.permissions && <p className="text-xs font-semibold text-rose-500 mt-1 bg-rose-50 p-2 rounded-lg border border-rose-100 inline-block w-fit">{errors.permissions}</p>}
                        </div>
                    </form>
                </AppContentCard>
            </div>
        </AppLayout>
    );
}
