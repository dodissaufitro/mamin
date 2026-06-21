import { glassBtnPrimaryClass, glassBtnSecondaryClass, glassInputClass, glassLabelClass, glassPageTitleClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface RoleOption {
    value: string;
    label: string;
}

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface Props {
    user: UserItem;
    roles: RoleOption[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Kelola User', href: '/users' },
    { title: 'Edit User', href: '#' },
];

export default function UsersEdit({ user, roles }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        name: user.name,
        email: user.email,
        password: '',
        password_confirmation: '',
        role: user.role,
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/users/${user.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit User" />
            <div className="mx-auto max-w-lg p-4 md:p-6">
                <h1 className={`mb-6 ${glassPageTitleClass}`}>Edit User</h1>
                <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 rounded-2xl p-5">
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Nama <span className="text-rose-500">*</span></label>
                        <input type="text" className={glassInputClass} value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Email <span className="text-rose-500">*</span></label>
                        <input type="email" className={glassInputClass} value={data.email} onChange={(e) => setData('email', e.target.value)} />
                        {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Password Baru</label>
                        <input type="password" className={glassInputClass} value={data.password} onChange={(e) => setData('password', e.target.value)} placeholder="Kosongkan jika tidak diubah" />
                        {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Konfirmasi Password Baru</label>
                        <input type="password" className={glassInputClass} value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Role <span className="text-rose-500">*</span></label>
                        <select className={glassInputClass} value={data.role} onChange={(e) => setData('role', e.target.value)}>
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>{role.label}</option>
                            ))}
                        </select>
                        {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <a href="/users" className={glassBtnSecondaryClass}>Batal</a>
                        <button type="submit" disabled={processing} className={`${glassBtnPrimaryClass} disabled:opacity-60`}>
                            {processing ? 'Menyimpan...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
