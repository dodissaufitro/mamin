import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Database, Plus, ArrowLeft, LayoutDashboard, BarChart3, List as ListIcon, Edit, Trash2 } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

export default function Menus({ schemas }: { schemas: any[] }) {
    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }, { title: 'Daftar Menu Builder', href: '/dev/builder/menus' }]}>
            <Head title="Daftar Menu - Visual Builder" />

            <div className="p-4 md:p-6 mx-auto max-w-7xl relative z-10">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
                    <div className="flex gap-5 items-center">
                        <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-500">
                            <Database size={32} />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">Daftar Menu</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Kumpulan Resource yang telah Anda buat menggunakan Visual Builder Studio.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <Link href="/dev/builder" className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition-all font-bold text-white shadow-lg shadow-indigo-500/25 w-full sm:w-auto">
                            <Plus size={18} />
                            Buat Menu Baru
                        </Link>
                    </div>
                </div>

                {schemas.length === 0 ? (
                    <div className="p-12 text-center rounded-3xl bg-white/40 dark:bg-black/20 backdrop-blur-xl border border-white/40 dark:border-white/5 shadow-lg flex flex-col items-center gap-4">
                        <Database size={48} className="text-gray-400 dark:text-gray-600" />
                        <div>
                            <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">Belum ada Menu / Resource</h3>
                            <p className="text-gray-500 dark:text-gray-500 text-sm mt-1">Anda belum pernah membuat resource menggunakan Visual Builder Studio.</p>
                        </div>
                        <Link href="/dev/builder" className="mt-4 px-6 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all">
                            Buat Sekarang
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {schemas.map((schema, index) => (
                            <div key={index} className="p-6 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                                
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100">{schema.resource_name}</h3>
                                    <div className="flex gap-2 text-gray-400">
                                        {schema.has_chart && <span title="Ada Chart"><BarChart3 size={16} className="text-indigo-500" /></span>}
                                        {schema.has_summary && <span title="Ada Summary"><LayoutDashboard size={16} className="text-purple-500" /></span>}
                                    </div>
                                </div>
                                
                                <div className="flex flex-col gap-2 mb-6">
                                    <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                        <ListIcon size={14} />
                                        <span>Total {schema.fields?.length || 0} Kolom</span>
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-auto pt-4 border-t border-gray-200 dark:border-white/10">
                                    <Link 
                                        href={`/dev/builder?schema=${encodeURIComponent(schema.resource_name)}`} 
                                        className="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm transition-all border border-indigo-100 dark:border-indigo-500/20"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </Link>
                                    <button 
                                        onClick={() => {
                                            if(confirm(`Yakin ingin MENGHAPUS resource ${schema.resource_name} secara permanen? Ini akan menghapus database, model, controller, view, dan route!`)) {
                                                router.delete(`/dev/builder/menus/${schema.resource_name}`);
                                            }
                                        }}
                                        className="flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 font-bold text-sm transition-all border border-red-100 dark:border-red-500/20"
                                    >
                                        <Trash2 size={16} />
                                        Hapus
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
