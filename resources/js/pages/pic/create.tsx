import { glassBtnPrimaryClass, glassBtnSecondaryClass, glassInputClass, glassLabelClass, glassPageTitleClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data PIC', href: '/pic' },
    { title: 'Tambah PIC', href: '/pic/create' },
];



export default function PicCreate() {
    const { data, setData, post, processing, errors } = useForm({ nama: '', jabatan: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/pic');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah PIC" />
            <div className="mx-auto max-w-lg p-4 md:p-6">
                <h1 className={`mb-6 ${glassPageTitleClass}`}>Tambah PIC</h1>
                <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Nama <span className="text-rose-500">*</span></label>
                        <input type="text" className={glassInputClass} value={data.nama} onChange={e => setData('nama', e.target.value)} placeholder="Nama lengkap" />
                        {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Jabatan</label>
                        <input type="text" className={glassInputClass} value={data.jabatan} onChange={e => setData('jabatan', e.target.value)} placeholder="Jabatan (opsional)" />
                        {errors.jabatan && <p className="text-xs text-red-500">{errors.jabatan}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <a href="/pic" className={glassBtnSecondaryClass}>Batal</a>
                        <button type="submit" disabled={processing} className={`${glassBtnPrimaryClass} disabled:opacity-60`}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
