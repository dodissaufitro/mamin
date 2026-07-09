import AppLayout from '@/layouts/app-layout';
import { Head, useForm, Link } from '@inertiajs/react';
import { glassBtnPrimaryClass, glassBtnSecondaryClass, glassInputClass, glassLabelClass, glassPageTitleClass } from '@/lib/glass-styles';

export default function Edit({ model }: any) {
    const { data, setData, put, processing } = useForm({ ...model });

    function submit(e: any) {
        e.preventDefault();
        put(`/nama-penyedia/${model.id}`);
    }

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'NamaPenyedium', href: '/nama-penyedia' }, { title: 'Edit', href: '#' }]}>
            <Head title="Edit NamaPenyedium" />
            <div className="mx-auto max-w-lg p-4 md:p-6">
                <h1 className={`mb-6 ${glassPageTitleClass}`}>Edit NamaPenyedium</h1>
                <form onSubmit={submit} className="glass-panel rounded-2xl p-5 flex flex-col gap-4">

                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Nama</label>
                        <input type="text" className={glassInputClass} value={data.nama} onChange={e => setData('nama', e.target.value)} />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className={`text-sm font-semibold ${glassLabelClass}`}>Alamat</label>
                        <input type="text" className={glassInputClass} value={data.alamat} onChange={e => setData('alamat', e.target.value)} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <Link href={`/nama-penyedia`} className={glassBtnSecondaryClass}>Batal</Link>
                        <button type="submit" disabled={processing} className={glassBtnPrimaryClass}>Update</button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}