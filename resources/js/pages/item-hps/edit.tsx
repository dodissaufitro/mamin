import { JenisDokumenSelectFields } from '@/components/spj-dokumen-upload-fields';
import {
    glassBtnPrimaryClass,
    glassBtnSecondaryClass,
    glassInputClass,
    glassLabelClass,
    glassPageTitleClass,
} from '@/lib/glass-styles';
import { type JenisDokumenItem } from '@/lib/dokumen';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface ItemHpsRow {
    id: number;
    nama_item: string;
    volume: string | number;
    harga_unit: string | number;
    jenis_dokumens: JenisDokumenItem[];
}

interface Props {
    item: ItemHpsRow;
    jenisDokumens: JenisDokumenItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Item HPS', href: '/item-hps' },
    { title: 'Edit Item', href: '#' },
];

export default function ItemHpsEdit({ item, jenisDokumens }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        nama_item: item.nama_item,
        volume: String(item.volume),
        harga_unit: String(item.harga_unit),
        jenis_dokumen_ids: item.jenis_dokumens.map((d) => d.id),
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post(`/item-hps/${item.id}`);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit Item HPS" />
            <div className="mx-auto max-w-3xl p-4 md:p-6">
                <h1 className={`mb-6 ${glassPageTitleClass}`}>Edit Item HPS</h1>
                <form onSubmit={handleSubmit} className="glass-panel flex flex-col gap-6 rounded-2xl p-5">
                    <div className="grid gap-4 sm:grid-cols-3">
                        <div className="flex flex-col gap-1 sm:col-span-3">
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
                    </div>

                    <div>
                        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-violet-700">
                            Dokumen yang Berlaku
                        </h2>
                        <JenisDokumenSelectFields
                            jenisDokumens={jenisDokumens}
                            selectedIds={data.jenis_dokumen_ids}
                            onChange={(ids) => setData('jenis_dokumen_ids', ids)}
                            description="Centang dokumen yang berlaku untuk item HPS ini. Upload file dilakukan di halaman Edit SPJ."
                        />
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
