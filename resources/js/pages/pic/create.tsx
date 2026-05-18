import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data PIC', href: '/pic' },
    { title: 'Tambah PIC', href: '/pic/create' },
];

const inputClass = 'rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-400/30 dark:border-violet-700 dark:bg-gray-900 dark:text-gray-200';

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
                <h1 className="mb-6 text-lg font-bold text-violet-800 dark:text-violet-200">Tambah PIC</h1>
                <form onSubmit={handleSubmit} className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-violet-700 dark:text-violet-300">Nama <span className="text-rose-500">*</span></label>
                        <input type="text" className={inputClass} value={data.nama} onChange={e => setData('nama', e.target.value)} placeholder="Nama lengkap" />
                        {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-semibold text-violet-700 dark:text-violet-300">Jabatan</label>
                        <input type="text" className={inputClass} value={data.jabatan} onChange={e => setData('jabatan', e.target.value)} placeholder="Jabatan (opsional)" />
                        {errors.jabatan && <p className="text-xs text-red-500">{errors.jabatan}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <a href="/pic" className="rounded-lg border border-violet-300 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/20">Batal</a>
                        <button type="submit" disabled={processing} className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors shadow-md shadow-violet-200 dark:shadow-violet-900/30">
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
