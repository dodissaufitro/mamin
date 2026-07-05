import { JenisDokumenSelectFields } from '@/components/spj-dokumen-upload-fields';
import {
    glassBtnPrimaryClass,
    glassBtnSecondaryClass,
    glassInputClass,
    glassLabelClass,
    glassPageTitleClass,
} from '@/lib/glass-styles';
import { defaultJenisIdsForItem, type JenisDokumenItem } from '@/lib/dokumen';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface Props {
    jenisDokumens: JenisDokumenItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Item HPS', href: '/item-hps' },
    { title: 'Tambah Item', href: '/item-hps/create' },
];

export default function ItemHpsCreate({ jenisDokumens }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        nama_item: '',
        volume: '',
        harga_unit: '',
        kategori: '',
        jenis_dokumen_ids: defaultJenisIdsForItem(jenisDokumens) as number[],
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/item-hps');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Item HPS" />
            <div className="mx-auto max-w-3xl p-4 md:p-6">
                <h1 className={`mb-6 ${glassPageTitleClass}`}>Tambah Item HPS</h1>
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
                        <div className="flex flex-col gap-1">
                            <label className={`text-sm font-semibold ${glassLabelClass}`}>
                                Kategori
                            </label>
                            <select
                                className={glassInputClass}
                                value={data.kategori}
                                onChange={(e) => setData('kategori', e.target.value)}
                            >
                                <option value="">Pilih Kategori (opsional)</option>
                                <option value="Snack dan Makanan">Snack dan Makanan</option>
                                <option value="Kebutuhan Dapur">Kebutuhan Dapur</option>
                            </select>
                            {errors.kategori && <p className="text-xs text-red-500">{errors.kategori}</p>}
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
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
