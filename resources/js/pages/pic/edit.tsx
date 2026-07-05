import { glassBtnPrimaryClass, glassBtnSecondaryClass, glassInputClass, glassLabelClass, glassPageTitleClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface PicItem {
    id: number;
    nama: string;
    jabatan: string | null;
}

interface Props {
    pic: PicItem;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Data PIC', href: '/pic' },
    { title: 'Edit PIC', href: '#' },
];

export default function PicEdit({ pic }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        nama: pic.nama,
        jabatan: pic.jabatan ?? '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/pic/${pic.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit PIC" />
            <div className="mx-auto max-w-lg p-4 md:p-6">
                <h1 className={`mb-6 ${glassPageTitleClass}`}>Edit PIC</h1>
                <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Nama <span className="text-rose-500">*</span></label>
                        <input type="text" className={glassInputClass} value={data.nama} onChange={e => setData('nama', e.target.value)} />
                        {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Jabatan</label>
                        <select className={glassInputClass} value={data.jabatan} onChange={e => setData('jabatan', e.target.value)}>
                            <option value="">Pilih Jabatan (opsional)</option>
                            <option value="Staff Seksi Pembiayaan Perumahan">Staff Seksi Pembiayaan Perumahan</option>
                            <option value="Staff Seksi Investasi dan Manajemen Keuangan">Staff Seksi Investasi dan Manajemen Keuangan</option>
                            <option value="Staff Sub Bagian Tata Usaha">Staff Sub Bagian Tata Usaha</option>
                            <option value="Staff Sub Bagian Keuangan">Staff Sub Bagian Keuangan</option>
                        </select>
                        {errors.jabatan && <p className="text-xs text-red-500">{errors.jabatan}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <a href="/pic" className={glassBtnSecondaryClass}>Batal</a>
                        <button type="submit" disabled={processing} className={`${glassBtnPrimaryClass} disabled:opacity-60`}>
                            {processing ? 'Menyimpan...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
