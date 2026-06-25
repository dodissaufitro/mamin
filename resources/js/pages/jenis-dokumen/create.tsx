import { glassBtnPrimaryClass, glassBtnSecondaryClass, glassInputClass, glassLabelClass, glassPageTitleClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Dokumen Berlaku', href: '/jenis-dokumen' },
    { title: 'Tambah Dokumen', href: '/jenis-dokumen/create' },
];

export default function JenisDokumenCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nama: '',
        kode: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/jenis-dokumen');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Dokumen Berlaku" />
            <div className="mx-auto max-w-lg p-4 md:p-6">
                <h1 className={`mb-6 ${glassPageTitleClass}`}>Tambah Dokumen Berlaku</h1>
                <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 rounded-2xl p-5">
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>
                            Nama Dokumen <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={glassInputClass}
                            value={data.nama}
                            onChange={(e) => setData('nama', e.target.value)}
                            placeholder="Contoh: Surat Undangan"
                        />
                        {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <a href="/jenis-dokumen" className={glassBtnSecondaryClass}>
                            Batal
                        </a>
                        <button type="submit" disabled={processing} className={`${glassBtnPrimaryClass} disabled:opacity-60`}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
