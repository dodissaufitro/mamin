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

interface ItemHpsRow {
    id: number;
    nama_item: string;
    volume: string | number;
    harga_unit: string | number;
}

interface Props {
    item: ItemHpsRow;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Item HPS', href: '/item-hps' },
    { title: 'Edit Item', href: '#' },
];

export default function ItemHpsEdit({ item }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        nama_item: item.nama_item,
        volume: String(item.volume),
        harga_unit: String(item.harga_unit),
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/item-hps/${item.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Item HPS" />
            <div className="mx-auto max-w-lg p-4 md:p-6">
                <h1 className={`mb-6 ${glassPageTitleClass}`}>Edit Item HPS</h1>
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
                        />
                        {errors.harga_unit && <p className="text-xs text-red-500">{errors.harga_unit}</p>}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <a href="/item-hps" className={glassBtnSecondaryClass}>
                            Batal
                        </a>
                        <button type="submit" disabled={processing} className={`${glassBtnPrimaryClass} disabled:opacity-60`}>
                            {processing ? 'Menyimpan...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
