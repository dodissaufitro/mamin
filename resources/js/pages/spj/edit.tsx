import AppLayout from '@/layouts/app-layout';
import { SpjDokumenUploadFields } from '@/components/spj-dokumen-upload-fields';
import { calcTotalHarga, formatRupiah } from '@/lib/spj-format';
import { type DokumenProgress, type JenisDokumenItem, type SpjDokumenItem } from '@/lib/dokumen';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { Trash2, Plus } from 'lucide-react';

interface ItemHpsOption {
    id: number;
    nama_item: string;
    volume: string | number;
    harga_unit: string | number;
    available_volume: number;
    jenis_dokumens: JenisDokumenItem[];
}

interface SpjItemData {
    id: number;
    item_hps_id: number;
    jumlah_order: number;
    total_harga: number;
    item_hps?: any | null;
}

interface SpjItem {
    id: number;
    tanggal_pemesanan: string | null;
    tanggal_kegiatan: string | null;
    deadline_spj: string | null;
    pic_id: number | null;
    penyedia_id: number | null;
    kegiatan: string | null;
    jenis_mamin: 'snack dan makanan' | 'kebutuhan dapur';
    spj_items?: SpjItemData[];
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
    _method: 'PUT';
    tanggal_pemesanan: string;
    tanggal_kegiatan: string;
    deadline_spj: string;
    pic_id: string;
    kegiatan: string;
    jenis_mamin: 'snack dan makanan' | 'kebutuhan dapur';
    penyedia_id: string;
    items: { item_hps_id: string; jumlah_order: string }[];
    tracking_spj: string;
    kasubbag_kasi: string;
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

function formatDateForInput(dateStr?: string | null) {
    if (!dateStr) return '';
    const datePart = dateStr.split(/[T ]/)[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return datePart;
    const parts = datePart.split(/[-/]/);
    if (parts.length === 3 && parts[0].length === 2 && parts[2].length === 4) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return datePart;
}

export default function SpjEdit({ spj, pics, penyedias, items, dokumenProgress }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { data, setData, processing, errors } = useForm<FormData>({
        _method: 'PUT',
        tanggal_pemesanan: formatDateForInput(spj.tanggal_pemesanan),
        tanggal_kegiatan: formatDateForInput(spj.tanggal_kegiatan),
        deadline_spj: formatDateForInput(spj.deadline_spj),
        pic_id: spj.pic_id?.toString() ?? '',
        kegiatan: spj.kegiatan ?? '',
        jenis_mamin: spj.jenis_mamin ?? 'snack dan makanan',
        penyedia_id: spj.penyedia_id?.toString() ?? '',
        items: spj.spj_items?.map(i => ({ item_hps_id: i.item_hps_id.toString(), jumlah_order: i.jumlah_order.toString() })) ?? [{ item_hps_id: '', jumlah_order: '' }],
        tracking_spj: spj.tracking_spj ?? '',
        kasubbag_kasi: spj.kasubbag_kasi ?? '',
    });

    const [pendingUploads, setPendingUploads] = useState<Record<number, File | null>>({});
    const [removeIds, setRemoveIds] = useState<number[]>([]);

    const applicableDokumen = useMemo(() => {
        const docsMap = new Map<number, JenisDokumenItem>();
        data.items.forEach(formItem => {
            const selItem = items.find(i => String(i.id) === formItem.item_hps_id);
            if (selItem && selItem.jenis_dokumens) {
                selItem.jenis_dokumens.forEach(doc => {
                    docsMap.set(doc.id, doc);
                });
            }
        });
        return Array.from(docsMap.values());
    }, [data.items, items]);

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
        
        let hasInvalidItems = false;
        data.items.forEach(formItem => {
            const qty = parseFloat(formItem.jumlah_order);
            const selectedItem = items.find((i) => String(i.id) === formItem.item_hps_id);
            if (!formItem.item_hps_id || !qty || qty <= 0) hasInvalidItems = true;
            if (selectedItem && qty > selectedItem.available_volume) hasInvalidItems = true;
        });

        if (hasInvalidItems) return;

        const formData = new FormData();
        formData.append('_method', 'PUT');
        formData.append('tanggal_pemesanan', data.tanggal_pemesanan);
        formData.append('tanggal_kegiatan', data.tanggal_kegiatan);
        formData.append('deadline_spj', data.deadline_spj);
        formData.append('pic_id', data.pic_id);
        formData.append('kegiatan', data.kegiatan);
        formData.append('jenis_mamin', data.jenis_mamin);
        formData.append('penyedia_id', data.penyedia_id);
        
        data.items.forEach((item, idx) => {
            formData.append(`items[${idx}][item_hps_id]`, item.item_hps_id);
            formData.append(`items[${idx}][jumlah_order]`, item.jumlah_order);
        });

        formData.append('tracking_spj', data.tracking_spj);
        formData.append('kasubbag_kasi', data.kasubbag_kasi);

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
                            <InputField label="Jenis Mamin" error={errors.jenis_mamin}>
                                <select className={inputClass} value={data.jenis_mamin} onChange={e => {
                                    const newJenis = e.target.value as any;
                                    setData(prev => ({
                                        ...prev,
                                        jenis_mamin: newJenis,
                                        items: [{ item_hps_id: '', jumlah_order: '' }],
                                        kasubbag_kasi: newJenis === 'kebutuhan dapur' ? 'Sub Bagian Tata Usaha' : prev.kasubbag_kasi,
                                        pic_id: newJenis === 'kebutuhan dapur' ? '' : prev.pic_id,
                                    }));
                                    setPendingUploads({});
                                    setRemoveIds([]);
                                }}>
                                    <option value="snack dan makanan">Snack dan Makanan</option>
                                    <option value="kebutuhan dapur">Kebutuhan Dapur</option>
                                </select>
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
                                    {pics.filter((p) => data.jenis_mamin !== 'kebutuhan dapur' || p.jabatan?.includes('TU')).map((p) => (
                                        <option key={p.id} value={p.id}>{p.nama}{p.jabatan ? ` (${p.jabatan})` : ''}</option>
                                    ))}
                                </select>
                            </InputField>
                            <div className="sm:col-span-2">
                                <InputField label="Kasubbag / Kasi" error={errors.kasubbag_kasi}>
                                    <select 
                                        className={`${inputClass} ${data.jenis_mamin === 'kebutuhan dapur' ? 'bg-gray-100 cursor-not-allowed opacity-70 dark:bg-gray-800' : ''}`} 
                                        value={data.kasubbag_kasi} 
                                        onChange={(e) => setData('kasubbag_kasi', e.target.value)}
                                        disabled={data.jenis_mamin === 'kebutuhan dapur'}
                                    >
                                        {data.jenis_mamin !== 'kebutuhan dapur' && <option value="">-- Pilih Kasubbag/Kasi --</option>}
                                        <option value="Sub Bagian Tata Usaha">Sub Bagian Tata Usaha</option>
                                        {data.jenis_mamin !== 'kebutuhan dapur' && (
                                            <>
                                                <option value="Sub Bagian Keuangan">Sub Bagian Keuangan</option>
                                                <option value="Seksi Investasi dan Manajemen Resiko">Seksi Investasi dan Manajemen Resiko</option>
                                                <option value="Seksi Pembiayaan Perumahan">Seksi Pembiayaan Perumahan</option>
                                            </>
                                        )}
                                    </select>
                                </InputField>
                            </div>
                            
                            <div className="sm:col-span-2 mt-2">
                                <label className="mb-2 block text-sm font-semibold text-violet-700 dark:text-violet-300">Daftar Item HPS</label>
                                {data.items.map((formItem, idx) => {
                                    const selectedItem = items.find((i) => String(i.id) === formItem.item_hps_id);
                                    const subtotal = selectedItem && formItem.jumlah_order ? calcTotalHarga(formItem.jumlah_order, selectedItem.harga_unit) : 0;
                                    
                                    return (
                                        <div key={idx} className="mb-3 flex flex-col gap-4 rounded-xl border border-violet-100 bg-violet-50/50 p-4 dark:border-violet-800/50 dark:bg-violet-900/10 sm:flex-row sm:items-start">
                                            <div className="flex-1">
                                                <InputField label={`Item HPS ${idx + 1}`} error={(errors as any)[`items.${idx}.item_hps_id`]}>
                                                    <select
                                                        className={inputClass}
                                                        value={formItem.item_hps_id}
                                                        onChange={(e) => {
                                                            const newItems = [...data.items];
                                                            newItems[idx].item_hps_id = e.target.value;
                                                            newItems[idx].jumlah_order = '';
                                                            setData('items', newItems);
                                                            setPendingUploads({});
                                                            setRemoveIds([]);
                                                        }}
                                                    >
                                                        <option value="">-- Pilih Item --</option>
                                                        {items.map((item) => {
                                                            const currentlyOrdered = data.items.filter(i => i.item_hps_id === String(item.id)).reduce((acc, i) => acc + (parseFloat(i.jumlah_order) || 0), 0);
                                                            const remaining = item.available_volume - currentlyOrdered;
                                                            
                                                            return (
                                                                <option key={item.id} value={item.id}>
                                                                    {item.nama_item} (tersedia: {formatQty(remaining)})
                                                                </option>
                                                            );
                                                        })}
                                                    </select>
                                                </InputField>
                                            </div>
                                            <div className="w-full sm:w-32">
                                                <InputField label="Jumlah" error={(errors as any)[`items.${idx}.jumlah_order`]}>
                                                    <input
                                                        type="number"
                                                        className={`${inputClass} ${(selectedItem && parseFloat(formItem.jumlah_order) > (selectedItem.available_volume - data.items.filter((_, i) => i !== idx && data.items[i].item_hps_id === String(selectedItem.id)).reduce((acc, i) => acc + (parseFloat(i.jumlah_order) || 0), 0))) ? 'border-red-500 bg-red-50 text-red-700' : ''}`}
                                                        value={formItem.jumlah_order}
                                                        onChange={(e) => {
                                                            const newItems = [...data.items];
                                                            newItems[idx].jumlah_order = e.target.value;
                                                            setData('items', newItems);
                                                        }}
                                                        placeholder="0"
                                                        min="0.01"
                                                        step="0.01"
                                                        disabled={!formItem.item_hps_id}
                                                    />
                                                    {selectedItem && (
                                                        <div className="mt-1 flex flex-col gap-0.5">
                                                            {(() => {
                                                                const otherRowsOrdered = data.items.filter((_, i) => i !== idx && data.items[i].item_hps_id === String(selectedItem.id)).reduce((acc, i) => acc + (parseFloat(i.jumlah_order) || 0), 0);
                                                                const maxAllowed = selectedItem.available_volume - otherRowsOrdered;
                                                                const currentVal = parseFloat(formItem.jumlah_order) || 0;
                                                                if (currentVal > maxAllowed) {
                                                                    return <span className="text-xs font-semibold text-red-600">Maks. {formatQty(maxAllowed)}</span>;
                                                                }
                                                                return null;
                                                            })()}
                                                        </div>
                                                    )}
                                                </InputField>
                                            </div>
                                            <div className="w-full sm:w-48">
                                                <InputField label="Subtotal">
                                                    <p className={`${inputClass} bg-white font-semibold text-violet-800 ${!selectedItem || !formItem.jumlah_order ? 'text-slate-400' : ''}`}>
                                                        {selectedItem && formItem.jumlah_order ? formatRupiah(subtotal) : '-'}
                                                    </p>
                                                </InputField>
                                            </div>
                                            
                                            {data.jenis_mamin === 'kebutuhan dapur' && data.items.length > 1 && (
                                                <div className="pt-6">
                                                    <button type="button" onClick={() => {
                                                        const newItems = data.items.filter((_, i) => i !== idx);
                                                        setData('items', newItems);
                                                    }} className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/30">
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                                
                                {data.jenis_mamin === 'kebutuhan dapur' && (
                                    <div className="mt-2 flex justify-start">
                                        <button
                                            type="button"
                                            onClick={() => setData('items', [...data.items, { item_hps_id: '', jumlah_order: '' }])}
                                            className="flex items-center gap-2 rounded-lg border border-violet-300 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/20"
                                        >
                                            <Plus className="h-4 w-4" /> Tambah Item
                                        </button>
                                    </div>
                                )}
                                
                                <div className="mt-4 flex justify-end">
                                    <div className="rounded-lg bg-violet-600 px-6 py-3 text-white shadow-md">
                                        <p className="text-xs text-violet-200 uppercase tracking-wide">Total Harga</p>
                                        <p className="text-xl font-bold">
                                            {formatRupiah(data.items.reduce((acc, formItem) => {
                                                const sel = items.find((i) => String(i.id) === formItem.item_hps_id);
                                                return acc + (sel && formItem.jumlah_order ? calcTotalHarga(formItem.jumlah_order, sel.harga_unit) : 0);
                                            }, 0))}
                                        </p>
                                    </div>
                                </div>
                            </div>
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

                    {auth.permissions['tracking_spj.update'] && (
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
                    )}





                    <div className="flex items-center justify-end gap-3">
                        <a href="/spj" className="rounded-lg border border-violet-300 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/20">
                            Batal
                        </a>
                        <button
                            type="submit"
                            disabled={
                                processing ||
                                data.items.some((formItem, idx) => {
                                    const qty = parseFloat(formItem.jumlah_order);
                                    const selectedItem = items.find((i) => String(i.id) === formItem.item_hps_id);
                                    if (!formItem.item_hps_id || !qty || qty <= 0) return true;
                                    if (selectedItem) {
                                        const otherRowsOrdered = data.items.filter((_, i) => i !== idx && data.items[i].item_hps_id === String(selectedItem.id)).reduce((acc, i) => acc + (parseFloat(i.jumlah_order) || 0), 0);
                                        if (qty > (selectedItem.available_volume - otherRowsOrdered)) return true;
                                    }
                                    return false;
                                }) ||
                                data.items.length === 0
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
