import {
    glassBtnPrimaryClass,
    glassBtnSecondaryClass,
    glassInputClass,
    glassLabelClass,
    glassPageTitleClass,
} from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Item HPS', href: '/item-hps' },
    { title: 'Tambah Item', href: '/item-hps/create' },
];

export default function ItemHpsCreate() {
    const { data, setData, post, processing, errors } = useForm({
        nama_item: '',
        volume: '',
        harga_unit: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/item-hps');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Item HPS" />
            <div className="mx-auto max-w-lg p-4 md:p-6">
                <h1 className={`mb-6 ${glassPageTitleClass}`}>Tambah Item HPS</h1>
                <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-4 rounded-2xl p-5">
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>
                            Nama Item <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="text"
                            className={glassInputClass}
                            value={data.nama_item}
                            onChange={(e) => setData('nama_item', e.target.value)}
                            placeholder="Contoh: Snack box"
                        />
                        {errors.nama_item && <p className="text-xs text-red-500">{errors.nama_item}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>
                            Volume <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            className={glassInputClass}
                            value={data.volume}
                            onChange={(e) => setData('volume', e.target.value)}
                            placeholder="0"
                        />
                        {errors.volume && <p className="text-xs text-red-500">{errors.volume}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>
                            Harga Unit <span className="text-rose-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="1"
                            className={glassInputClass}
                            value={data.harga_unit}
                            onChange={(e) => setData('harga_unit', e.target.value)}
                            placeholder="0"
                        />
                        {errors.harga_unit && <p className="text-xs text-red-500">{errors.harga_unit}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <a href="/item-hps" className={glassBtnSecondaryClass}>
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
