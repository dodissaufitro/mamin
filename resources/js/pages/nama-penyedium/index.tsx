import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { glassBtnPrimaryClass, glassPageTitleClass } from '@/lib/glass-styles';


export default function Index({ data }: any) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'NamaPenyedium', href: '/nama-penyedia' }]}>
            <Head title="NamaPenyedium" />
            <div className="p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className={glassPageTitleClass}>NamaPenyedium</h1>
                    <Link href={`/nama-penyedia/create`} className={glassBtnPrimaryClass}>Tambah Baru</Link>
                </div>
                
                
                
                
                
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/10 border-b border-white/20">
                            <tr>
                                <th className="p-3 text-left font-semibold">ID</th>
<th className="p-3 text-left font-semibold">Nama</th>
<th className="p-3 text-left font-semibold">Alamat</th>
                                <th className="p-3 text-left font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {data.map((item: any) => (
                                <tr key={item.id} className="hover:bg-white/5">
                                    <td className="p-3">{item.id}</td>
<td className="p-3">{item.nama}</td>
<td className="p-3">{item.alamat}</td>
                                    <td className="p-3 flex gap-2">
                                        <Link href={`/nama-penyedia/${item.id}/edit`} className="text-blue-400 hover:underline">Edit</Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}