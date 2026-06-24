import AppLayout from '@/layouts/app-layout';
import { SpjDokumenUploadFields } from '@/components/spj-dokumen-upload-fields';
import { calcTotalHarga, formatRupiah } from '@/lib/spj-format';
import { type DokumenProgress, type JenisDokumenItem, type SpjDokumenItem } from '@/lib/dokumen';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { useMemo, useState } from 'react';

interface ItemHpsOption {
    id: number;
    nama_item: string;
    volume: string | number;
    harga_unit: string | number;
    available_volume: number;
    jenis_dokumens: JenisDokumenItem[];
}

interface ItemHpsDetail {
    id: number;
    nama_item: string;
    jenis_dokumens: JenisDokumenItem[];
}

interface SpjItem {
    id: number;
    tanggal_pemesanan: string | null;
    tanggal_kegiatan: string | null;
    deadline_spj: string | null;
    pic_id: number | null;
    penyedia_id: number | null;
    item_hps_id: number | null;
    kegiatan: string | null;
    jumlah_order: number | null;
    item_hps?: ItemHpsDetail | null;
    spj_dokumens?: SpjDokumenItem[];
    pembayaran_spj: boolean;
    kelengkapan_dokumen: boolean;
    kasubbag_kasi: string | null;
    staf: string | null;
    link_spj: string | null;
    tracking_spj: string | null;
}

interface Props {
    spj: SpjItem;
    pics: { id: number; nama: string; jabatan: string | null }[];
    penyedias: { id: number; nama: string }[];
    items: ItemHpsOption[];
    dokumenProgress: DokumenProgress;
}

function formatQty(value: number) {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'SPJ Makan Minum Rapat', href: '/spj' },
    { title: 'Edit SPJ', href: '#' },
];

const trackingOptions = [
    'Dokumen Tidak Lengkap',
    'Dokumen Lengkap',
    'SPPD & SOPD',
    'Bendahara Pengeluaran (Biling Pajak PPH23)',
    'Approval Pejabat Penatausahaan Keuangan',
    'Approval PPATK',
    'Approval KPA I',
    'Bendahara Pengeluaran (CMS)',
    'Approval KPA II',
    'Upload Bukti Pembayaran',
    'Selesai',
];

type FormData = {
    tanggal_pemesanan: string;
    tanggal_kegiatan: string;
    deadline_spj: string;
    pic_id: string;
    kegiatan: string;
    penyedia_id: string;
    item_hps_id: string;
    jumlah_order: string;
    pembayaran_spj: boolean;
    tracking_spj: string;
    kasubbag_kasi: string;
    staf: string;
    link_spj: string;
    _method: string;
};

function InputField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-violet-700 dark:text-violet-300">{label}</label>
            {children}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}

const inputClass =
    'rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-400/30 dark:border-violet-700 dark:bg-gray-900 dark:text-gray-200';

export default function SpjEdit({ spj, pics, penyedias, items, dokumenProgress }: Props) {
    const { data, setData, processing, errors } = useForm<FormData>({
        _method: 'PUT',
        tanggal_pemesanan: spj.tanggal_pemesanan ?? '',
        tanggal_kegiatan: spj.tanggal_kegiatan ?? '',
        deadline_spj: spj.deadline_spj ?? '',
        pic_id: spj.pic_id?.toString() ?? '',
        kegiatan: spj.kegiatan ?? '',
        penyedia_id: spj.penyedia_id?.toString() ?? '',
        item_hps_id: spj.item_hps_id?.toString() ?? '',
        jumlah_order: spj.jumlah_order?.toString() ?? '',
        pembayaran_spj: spj.pembayaran_spj,
        tracking_spj: spj.tracking_spj ?? '',
        kasubbag_kasi: spj.kasubbag_kasi ?? '',
        staf: spj.staf ?? '',
        link_spj: spj.link_spj ?? '',
    });

    const [pendingUploads, setPendingUploads] = useState<Record<number, File | null>>({});
    const [removeIds, setRemoveIds] = useState<number[]>([]);

    const selectedItem = items.find((i) => String(i.id) === data.item_hps_id);
    const applicableDokumen = useMemo(
        () => selectedItem?.jenis_dokumens ?? spj.item_hps?.jenis_dokumens ?? [],
        [selectedItem, spj.item_hps?.jenis_dokumens],
    );
    const maxOrder = selectedItem?.available_volume ?? 0;
    const totalHarga =
        selectedItem && data.jumlah_order
            ? calcTotalHarga(data.jumlah_order, selectedItem.harga_unit)
            : 0;

    function handleSelectFile(jenisId: number, file: File | null) {
        setPendingUploads((prev) => ({ ...prev, [jenisId]: file }));
        if (file) {
            setRemoveIds((prev) => prev.filter((id) => id !== jenisId));
        }
    }

    function handleToggleRemove(jenisId: number, remove: boolean) {
        if (remove) {
            setRemoveIds((prev) => [...prev, jenisId]);
            setPendingUploads((prev) => ({ ...prev, [jenisId]: null }));
            return;
        }

        setRemoveIds((prev) => prev.filter((id) => id !== jenisId));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const qty = parseFloat(data.jumlah_order);
        if (!data.item_hps_id || !qty || qty <= 0) {
            return;
        }
        if (selectedItem && qty > selectedItem.available_volume) {
            return;
        }

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('tanggal_pemesanan', data.tanggal_pemesanan);
        formData.append('tanggal_kegiatan', data.tanggal_kegiatan);
        formData.append('deadline_spj', data.deadline_spj);
        formData.append('pic_id', data.pic_id);
        formData.append('kegiatan', data.kegiatan);
        formData.append('penyedia_id', data.penyedia_id);
        formData.append('item_hps_id', data.item_hps_id);
        formData.append('jumlah_order', data.jumlah_order);
        formData.append('pembayaran_spj', data.pembayaran_spj ? '1' : '0');
        formData.append('tracking_spj', data.tracking_spj);
        formData.append('kasubbag_kasi', data.kasubbag_kasi);
        formData.append('staf', data.staf);
        formData.append('link_spj', data.link_spj);

        Object.entries(pendingUploads).forEach(([jenisId, file]) => {
            if (file) {
                formData.append(`dokumen_uploads[${jenisId}]`, file);
            }
        });

        removeIds.forEach((jenisId) => {
            formData.append('dokumen_hapus[]', String(jenisId));
        });

        router.post(`/spj/${spj.id}`, formData, { forceFormData: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Edit SPJ" />
            <div className="mx-auto max-w-3xl p-4 md:p-6">
                <h1 className="mb-6 text-lg font-bold text-violet-800 dark:text-violet-200">Edit SPJ Makan Minum Rapat</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Tanggal</h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <InputField label="Tanggal Pemesanan" error={errors.tanggal_pemesanan}>
                                <input type="date" className={inputClass} value={data.tanggal_pemesanan} onChange={(e) => setData('tanggal_pemesanan', e.target.value)} />
                            </InputField>
                            <InputField label="Tanggal Kegiatan" error={errors.tanggal_kegiatan}>
                                <input type="date" className={inputClass} value={data.tanggal_kegiatan} onChange={(e) => setData('tanggal_kegiatan', e.target.value)} />
                            </InputField>
                            <InputField label="Deadline SPJ" error={errors.deadline_spj}>
                                <input type="date" className={inputClass} value={data.deadline_spj} onChange={(e) => setData('deadline_spj', e.target.value)} />
                            </InputField>
                        </div>
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Info Kegiatan</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <InputField label="Kegiatan" error={errors.kegiatan}>
                                <input type="text" className={inputClass} value={data.kegiatan} onChange={(e) => setData('kegiatan', e.target.value)} placeholder="Nama kegiatan" />
                            </InputField>
                            <InputField label="Penyedia" error={errors.penyedia_id}>
                                <select className={inputClass} value={data.penyedia_id} onChange={(e) => setData('penyedia_id', e.target.value)}>
                                    <option value="">-- Pilih Penyedia --</option>
                                    {penyedias.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nama}</option>
                                    ))}
                                </select>
                            </InputField>
                            <InputField label="PIC Penanggung Jawab" error={errors.pic_id}>
                                <select className={inputClass} value={data.pic_id} onChange={(e) => setData('pic_id', e.target.value)}>
                                    <option value="">-- Pilih PIC --</option>
                                    {pics.map((p) => (
                                        <option key={p.id} value={p.id}>{p.nama}{p.jabatan ? ` (${p.jabatan})` : ''}</option>
                                    ))}
                                </select>
                            </InputField>
                            <InputField label="Item HPS" error={errors.item_hps_id}>
                                <select
                                    className={inputClass}
                                    value={data.item_hps_id}
                                    onChange={(e) => {
                                        setData((prev) => ({
                                            ...prev,
                                            item_hps_id: e.target.value,
                                            jumlah_order: '',
                                        }));
                                        setPendingUploads({});
                                        setRemoveIds([]);
                                    }}
                                >
                                    <option value="">-- Pilih Item --</option>
                                    {items.map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {item.nama_item} (tersedia: {formatQty(item.available_volume)})
                                        </option>
                                    ))}
                                </select>
                            </InputField>
                            <InputField label="Jumlah Order" error={errors.jumlah_order}>
                                <input
                                    type="number"
                                    className={inputClass}
                                    value={data.jumlah_order}
                                    onChange={(e) => setData('jumlah_order', e.target.value)}
                                    placeholder="0"
                                    min="0.01"
                                    step="0.01"
                                    max={maxOrder > 0 ? maxOrder : undefined}
                                    disabled={!data.item_hps_id}
                                />
                                {selectedItem && (
                                    <p className="text-xs text-slate-600">
                                        Volume tersedia: <span className="font-semibold">{formatQty(selectedItem.available_volume)}</span>
                                        {parseFloat(data.jumlah_order) > selectedItem.available_volume && (
                                            <span className="ml-2 text-red-600">Melebihi volume tersedia</span>
                                        )}
                                    </p>
                                )}
                            </InputField>
                            <InputField label="Total Harga">
                                <p className={`${inputClass} bg-violet-50 font-semibold text-violet-800 ${!selectedItem || !data.jumlah_order ? 'text-slate-400' : ''}`}>
                                    {selectedItem && data.jumlah_order ? formatRupiah(totalHarga) : '-'}
                                </p>
                            </InputField>
                        </div>
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h2 className="text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">
                                Upload Dokumen
                            </h2>
                            <span className="text-xs font-medium text-slate-600">
                                {dokumenProgress.done}/{dokumenProgress.total} terupload
                            </span>
                        </div>
                        <SpjDokumenUploadFields
                            jenisDokumens={applicableDokumen}
                            existingUploads={spj.spj_dokumens ?? []}
                            pendingUploads={pendingUploads}
                            removeIds={removeIds}
                            onSelectFile={handleSelectFile}
                            onToggleRemove={handleToggleRemove}
                            errors={errors}
                            description="Upload file untuk setiap dokumen yang berlaku pada Item HPS terpilih."
                        />
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Tracking SPJ</h2>
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {trackingOptions.map((opt) => (
                                <label key={opt} className="flex cursor-pointer items-start gap-2 rounded-lg border border-violet-200 px-3 py-2 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-900/20">
                                    <input
                                        type="radio"
                                        name="tracking_spj"
                                        className="mt-0.5 h-4 w-4 accent-violet-600"
                                        checked={data.tracking_spj === opt}
                                        onChange={() => setData('tracking_spj', opt)}
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300 leading-tight">{opt}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Pembayaran</h2>
                        <div className="flex gap-4">
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2 hover:bg-emerald-100">
                                <input
                                    type="radio"
                                    name="pembayaran_spj"
                                    className="h-4 w-4 accent-emerald-600"
                                    checked={data.pembayaran_spj === true}
                                    onChange={() => setData('pembayaran_spj', true)}
                                />
                                <span className="text-sm font-medium text-emerald-800">Pembayaran SPJ</span>
                            </label>
                            <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-4 py-2 hover:bg-rose-100">
                                <input
                                    type="radio"
                                    name="pembayaran_spj"
                                    className="h-4 w-4 accent-rose-600"
                                    checked={data.pembayaran_spj === false}
                                    onChange={() => setData('pembayaran_spj', false)}
                                />
                                <span className="text-sm font-medium text-rose-800">Belum Pembayaran SPJ</span>
                            </label>
                        </div>
                    </div>

                    <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">PIC & Link</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <InputField label="Kasubbag / Kasi" error={errors.kasubbag_kasi}>
                                <select className={inputClass} value={data.kasubbag_kasi} onChange={(e) => setData('kasubbag_kasi', e.target.value)}>
                                    <option value="">-- Pilih Kasubbag/Kasi --</option>
                                    <option value="Sub Bagian Tata Usaha">Sub Bagian Tata Usaha</option>
                                    <option value="Sub Bagian Keuangan">Sub Bagian Keuangan</option>
                                    <option value="Seksi Investasi dan Manajemen Resiko">Seksi Investasi dan Manajemen Resiko</option>
                                    <option value="Seksi Pembiayaan Perumahan">Seksi Pembiayaan Perumahan</option>
                                </select>
                            </InputField>
                            <InputField label="Staf" error={errors.staf}>
                                <input type="text" className={inputClass} value={data.staf} onChange={(e) => setData('staf', e.target.value)} placeholder="Nama staf" />
                            </InputField>
                            <div className="sm:col-span-2">
                                <InputField label="Link SPJ" error={errors.link_spj}>
                                    <input type="text" className={inputClass} value={data.link_spj} onChange={(e) => setData('link_spj', e.target.value)} placeholder="https://..." />
                                </InputField>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3">
                        <a href="/spj" className="rounded-lg border border-violet-300 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/20">
                            Batal
                        </a>
                        <button
                            type="submit"
                            disabled={
                                processing ||
                                !data.item_hps_id ||
                                !data.jumlah_order ||
                                parseFloat(data.jumlah_order) <= 0 ||
                                (!!selectedItem && parseFloat(data.jumlah_order) > selectedItem.available_volume)
                            }
                            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors shadow-md shadow-violet-200 dark:shadow-violet-900/30"
                        >
                            {processing ? 'Menyimpan...' : 'Update'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
