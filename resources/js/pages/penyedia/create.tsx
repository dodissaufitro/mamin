import { glassBtnPrimaryClass, glassBtnSecondaryClass, glassInputClass, glassLabelClass, glassPageTitleClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data Penyedia', href: '/penyedia' },
    { title: 'Tambah Penyedia', href: '/penyedia/create' },
];



export default function PenyediaCreate() {
    const { data, setData, post, processing, errors } = useForm({ nama: '', alamat: '', telepon: '' });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/penyedia');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Penyedia" />
            <div className="mx-auto max-w-lg p-4 md:p-6">
                <h1 className={`mb-6 ${glassPageTitleClass}`}>Tambah Penyedia</h1>
                <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Nama <span className="text-rose-500">*</span></label>
                        <input type="text" className={glassInputClass} value={data.nama} onChange={e => setData('nama', e.target.value)} placeholder="Nama penyedia" />
                        {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Alamat</label>
                        <textarea rows={2} className={glassInputClass} value={data.alamat} onChange={e => setData('alamat', e.target.value)} placeholder="Alamat (opsional)" />
                        {errors.alamat && <p className="text-xs text-red-500">{errors.alamat}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Telepon</label>
                        <input type="text" className={glassInputClass} value={data.telepon} onChange={e => setData('telepon', e.target.value)} placeholder="08xx (opsional)" />
                        {errors.telepon && <p className="text-xs text-red-500">{errors.telepon}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <a href="/penyedia" className={glassBtnSecondaryClass}>Batal</a>
                        <button type="submit" disabled={processing} className={`${glassBtnPrimaryClass} disabled:opacity-60`}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
