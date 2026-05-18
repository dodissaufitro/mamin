import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

interface PicItem { id: number; nama: string; jabatan: string | null; }
interface PenyediaItem { id: number; nama: string; }

interface Props {
    pics: PicItem[];
    penyedias: PenyediaItem[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'SPJ Makan Minum Rapat', href: '/spj' },
    { title: 'Tambah SPJ', href: '/spj/create' },
];

const dokumenFields = [
    { key: 'surat_undangan', label: 'Surat Undangan' },
    { key: 'memo', label: 'Memo' },
    { key: 'invoice', label: 'Invoice' },
    { key: 'kwitansi', label: 'Kwitansi' },
    { key: 'nib', label: 'NIB' },
    { key: 'absen', label: 'Absen' },
    { key: 'notulen', label: 'Notulen' },
    { key: 'dokumentasi', label: 'Dokumentasi' },
] as const;

type FormData = {
    tanggal_pemesanan: string;
    tanggal_kegiatan: string;
    deadline_spj: string;
    pic_id: string;
    kegiatan: string;
    penyedia_id: string;
    jumlah_order: string;
    surat_undangan: boolean;
    memo: boolean;
    invoice: boolean;
    kwitansi: boolean;
    nib: boolean;
    absen: boolean;
    notulen: boolean;
    dokumentasi: boolean;
    kelengkapan_dokumen: boolean;
    pembayaran_spj: boolean;
    kasubbag_kasi: string;
    staf: string;
    link_spj: string;
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

export default function SpjCreate({ pics, penyedias }: Props) {
    const { data, setData, post, processing, errors } = useForm<FormData>({
        tanggal_pemesanan: '',
        tanggal_kegiatan: '',
        deadline_spj: '',
        pic_id: '',
        kegiatan: '',
        penyedia_id: '',
        jumlah_order: '',
        surat_undangan: false,
        memo: false,
        invoice: false,
        kwitansi: false,
        nib: false,
        absen: false,
        notulen: false,
        dokumentasi: false,
        kelengkapan_dokumen: false,
        pembayaran_spj: false,
        kasubbag_kasi: '',
        staf: '',
        link_spj: '',
    });

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        post('/spj');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah SPJ" />
            <div className="mx-auto max-w-3xl p-4 md:p-6">
                <h1 className="mb-6 text-lg font-bold text-violet-800 dark:text-violet-200">Tambah SPJ Makan Minum Rapat</h1>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    {/* Tanggal */}
                                        <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Tanggal</h2>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <InputField label="Tanggal Pemesanan" error={errors.tanggal_pemesanan}>
                                <input type="date" className={inputClass} value={data.tanggal_pemesanan} onChange={e => setData('tanggal_pemesanan', e.target.value)} />
                            </InputField>
                            <InputField label="Tanggal Kegiatan" error={errors.tanggal_kegiatan}>
                                <input type="date" className={inputClass} value={data.tanggal_kegiatan} onChange={e => setData('tanggal_kegiatan', e.target.value)} />
                            </InputField>
                            <InputField label="Deadline SPJ" error={errors.deadline_spj}>
                                <input type="date" className={inputClass} value={data.deadline_spj} onChange={e => setData('deadline_spj', e.target.value)} />
                            </InputField>
                        </div>
                    </div>

                    {/* Info Kegiatan */}
                                        <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Info Kegiatan</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <InputField label="Kegiatan" error={errors.kegiatan}>
                                <input type="text" className={inputClass} value={data.kegiatan} onChange={e => setData('kegiatan', e.target.value)} placeholder="Nama kegiatan" />
                            </InputField>
                            <InputField label="Penyedia" error={errors.penyedia_id}>
                                <select className={inputClass} value={data.penyedia_id} onChange={e => setData('penyedia_id', e.target.value)}>
                                    <option value="">-- Pilih Penyedia --</option>
                                    {penyedias.map(p => (
                                        <option key={p.id} value={p.id}>{p.nama}</option>
                                    ))}
                                </select>
                            </InputField>
                            <InputField label="PIC Penanggung Jawab" error={errors.pic_id}>
                                <select className={inputClass} value={data.pic_id} onChange={e => setData('pic_id', e.target.value)}>
                                    <option value="">-- Pilih PIC --</option>
                                    {pics.map(p => (
                                        <option key={p.id} value={p.id}>{p.nama}{p.jabatan ? ` (${p.jabatan})` : ''}</option>
                                    ))}
                                </select>
                            </InputField>
                            <InputField label="Jumlah Order" error={errors.jumlah_order}>
                                <input type="number" className={inputClass} value={data.jumlah_order} onChange={e => setData('jumlah_order', e.target.value)} placeholder="0" min="0" />
                            </InputField>
                        </div>
                    </div>

                    {/* Tracking Dokumen */}
                                        <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Tracking Dokumen</h2>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {dokumenFields.map(({ key, label }) => (
                                <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-violet-200 px-3 py-2 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-900/20">
                                    <input
                                        type="checkbox"
                                                                                className="h-4 w-4 rounded accent-violet-600"
                                        checked={data[key]}
                                        onChange={e => setData(key, e.target.checked)}
                                    />
                                    <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Tracking SPJ */}
                                        <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">Tracking SPJ</h2>
                        <div className="grid grid-cols-2 gap-3">
                            <label                             className="flex cursor-pointer items-center gap-2 rounded-lg border border-violet-200 px-3 py-2 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-900/20">
                                <input type="checkbox" className="h-4 w-4 rounded accent-violet-600" checked={data.kelengkapan_dokumen} onChange={e => setData('kelengkapan_dokumen', e.target.checked)} />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Kelengkapan Dokumen</span>
                            </label>
                            <label                             className="flex cursor-pointer items-center gap-2 rounded-lg border border-violet-200 px-3 py-2 hover:bg-violet-50 dark:border-violet-700 dark:hover:bg-violet-900/20">
                                <input type="checkbox" className="h-4 w-4 rounded accent-violet-600" checked={data.pembayaran_spj} onChange={e => setData('pembayaran_spj', e.target.checked)} />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Pembayaran SPJ</span>
                            </label>
                        </div>
                    </div>

                    {/* PIC & Link */}
                                        <div className="rounded-xl border border-violet-200 bg-white p-5 shadow-sm dark:bg-sidebar dark:border-violet-800">
                        <h2 className="mb-4 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wide">PIC & Link</h2>
                        <div className="grid gap-4 sm:grid-cols-2">
                                                        <InputField label="Kasubbag / Kasi" error={errors.kasubbag_kasi}>
                                <select className={inputClass} value={data.kasubbag_kasi} onChange={e => setData('kasubbag_kasi', e.target.value)}>
                                    <option value="">-- Pilih Kasubbag/Kasi --</option>
                                    {pics.map(p => (
                                        <option key={p.id} value={p.nama}>{p.nama}{p.jabatan ? ` (${p.jabatan})` : ''}</option>
                                    ))}
                                </select>
                            </InputField>
                            <InputField label="Staf" error={errors.staf}>
                                <input type="text" className={inputClass} value={data.staf} onChange={e => setData('staf', e.target.value)} placeholder="Nama staf" />
                            </InputField>
                            <div className="sm:col-span-2">
                                <InputField label="Link SPJ" error={errors.link_spj}>
                                    <input type="text" className={inputClass} value={data.link_spj} onChange={e => setData('link_spj', e.target.value)} placeholder="https://..." />
                                </InputField>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3">
                        <a href="/spj" className="rounded-lg border border-violet-300 px-4 py-2 text-sm font-medium text-violet-700 hover:bg-violet-50 dark:border-violet-700 dark:text-violet-300 dark:hover:bg-violet-900/20">
                            Batal
                        </a>
                        <button
                            type="submit"
                            disabled={processing}
                            className="rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-60 transition-colors shadow-md shadow-violet-200 dark:shadow-violet-900/30"
                        >
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
