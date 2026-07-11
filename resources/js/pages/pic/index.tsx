import AppLayout from '@/layouts/app-layout';
import { Head, Link } from '@inertiajs/react';
import { glassBtnPrimaryClass, glassPageTitleClass } from '@/lib/glass-styles';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Index({ data }: any) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Pic', href: '/pics' }]}>
            <Head title="Pic" />
            <div className="p-4 md:p-6">
                <div className="flex justify-between items-start mb-1">
                    <div>
                        <h1 className={glassPageTitleClass}>Pic</h1>
                        
                    </div>
                    <Link href={`/pics/create`} className={glassBtnPrimaryClass}>Tambah Baru</Link>
                </div>
                
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    {[
                        { title: 'Total Data', value: data.length, color: 'from-blue-500 to-indigo-600' },
                        { title: 'Aktif', value: Math.floor(data.length * 0.8), color: 'from-emerald-400 to-teal-500' },
                        { title: 'Pending', value: Math.floor(data.length * 0.2), color: 'from-amber-400 to-orange-500' },
                        { title: 'Pertumbuhan', value: '+12%', color: 'from-purple-500 to-pink-500' }
                    ].map((stat, i) => (
                        <div key={i} className="p-5 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-xl border border-white/40 shadow-lg relative overflow-hidden">
                            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-20 rounded-bl-full`}></div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{stat.title}</h3>
                            <p className="text-3xl font-extrabold text-gray-800 dark:text-gray-100">{stat.value}</p>
                        </div>
                    ))}
                </div>
                
                
                <div className="glass-panel rounded-2xl p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">Statistik Pic</h2>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={[{name: 'Jan', total: 40}, {name: 'Feb', total: 30}, {name: 'Mar', total: 50}, {name: 'Apr', total: 45}, {name: 'Mei', total: 60}]}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                <div className="glass-panel rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-white/10 border-b border-white/20">
                            <tr>
                                <th className="p-3 text-left font-semibold">ID</th>
<th className="p-3 text-left font-semibold">Nama</th>
<th className="p-3 text-left font-semibold">Jabatan</th>
                                <th className="p-3 text-left font-semibold">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/10">
                            {data.map((item: any) => (
                                <tr key={item.id} className="hover:bg-white/5">
                                    <td className="p-3">{item.id}</td>
<td className="p-3">{item.nama}</td>
<td className="p-3">{item.jabatan}</td>
                                    <td className="p-3 flex gap-2">
                                        <Link href={`/pics/${item.id}/edit`} className="text-blue-400 hover:underline">Edit</Link>
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