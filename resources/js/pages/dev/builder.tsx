import React, { useState, useEffect } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Settings, Database, List, Plus, Trash2, Rocket, ArrowLeft, Wrench, BarChart3, LayoutDashboard } from 'lucide-react';

interface Field {
    id: string;
    name: string;
    type: string;
    related_model?: string;
}

export default function Builder() {
    const [schemas, setSchemas] = useState<any[]>([]);

    useEffect(() => {
        fetch('/dev/builder/schemas')
            .then(res => res.json())
            .then(fetchedSchemas => {
                setSchemas(fetchedSchemas);
                const urlParams = new URLSearchParams(window.location.search);
                const schemaParam = urlParams.get('schema');
                if (schemaParam) {
                    const matchedSchema = fetchedSchemas.find((s: any) => s.resource_name === schemaParam);
                    if (matchedSchema) {
                        setData(matchedSchema);
                    }
                }
            })
            .catch(err => console.error("Error loading schemas:", err));
    }, []);

    const { data, setData, post, processing, errors } = useForm<any>({
        resource_name: '',
        description: '',
        has_chart: false,
        has_summary: false,
        fields: [{ id: Date.now().toString(), name: '', type: 'string' }]
    });

    function addField() {
        setData('fields', [...data.fields, { id: Date.now().toString(), name: '', type: 'string' }]);
    }

    function removeField(id: string) {
        if (data.fields.length === 1) return; // minimal 1 field
        setData('fields', data.fields.filter((f: Field) => f.id !== id));
    }

    function updateField(id: string, key: 'name' | 'type' | 'related_model', value: string) {
        setData('fields', data.fields.map((f: Field) => f.id === id ? { ...f, [key]: value } : f));
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (confirm('Anda yakin ingin meng-generate Resource ini? Tindakan ini akan menciptakan/menimpa file fisik di dalam proyek Anda.')) {
            post('/dev/builder', {
                onSuccess: () => alert('Berhasil! Cek file Anda dan jalankan "php artisan migrate".')
            });
        }
    }

    // Modern glass inputs
    const inputClass = "w-full bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500";
    const selectClass = "w-full bg-white/50 dark:bg-black/30 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-gray-800 dark:text-gray-100 appearance-none";

    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#0b1120] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))] py-12 px-4 sm:px-6 relative overflow-hidden font-sans">
            
            {/* Ambient Background Glows */}
            <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob"></div>
            <div className="absolute top-0 -right-4 w-72 h-72 bg-indigo-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-2000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-[128px] opacity-30 animate-blob animation-delay-4000"></div>

            <Head title="Visual Builder Studio" />
            
            <div className="mx-auto max-w-4xl relative z-10">
                
                {/* Header Kustom Builder */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10 p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
                    <div className="flex gap-5 items-center">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 tracking-tight">Visual Builder Studio</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">Buat CRUD secara instan layaknya drag & drop.</p>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <Link href="/dev/builder/menus" className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20 group">
                            <List size={16} />
                            Daftar Menu
                        </Link>
                        <Link href="/dashboard" className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/80 dark:bg-black/30 hover:bg-white dark:hover:bg-black/50 transition-all font-semibold text-gray-700 dark:text-gray-300 shadow-sm border border-gray-200 dark:border-white/10 group">
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Kembali
                        </Link>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-8">
                    
                    {/* Kotak Load Schema */}
                    {schemas.length > 0 && (
                        <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden group">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    Load Resource Lama
                                </label>
                                <select 
                                    className={selectClass} 
                                    onChange={e => {
                                        if (!e.target.value) return;
                                        const schema = schemas.find(s => s.resource_name === e.target.value);
                                        if (schema) {
                                            setData({
                                                resource_name: schema.resource_name,
                                                description: schema.description || '',
                                                has_chart: schema.has_chart || false,
                                                has_summary: schema.has_summary || false,
                                                fields: schema.fields
                                            });
                                        }
                                    }}
                                >
                                    <option value="">-- Pilih Resource untuk di-edit --</option>
                                    {schemas.map((s, idx) => (
                                        <option key={idx} value={s.resource_name}>{s.resource_name}</option>
                                    ))}
                                </select>
                                <p className="text-xs text-orange-500 font-semibold mt-1">⚠️ Peringatan: Mengedit resource lama akan menimpa (replace) file controller, model, dan view lama. Pastikan Anda melakukan migrate ulang tabel jika Anda mengubah struktur data kolom.</p>
                            </div>
                        </div>
                    )}

                    {/* Kotak Pengaturan Utama */}
                    <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl relative overflow-hidden group">
                        {/* Subtle inner glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

                        <div className="flex items-center gap-3 mb-6 border-b border-gray-200 dark:border-white/10 pb-4">
                            <Settings className="text-indigo-500 dark:text-indigo-400" size={20} />
                            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Informasi Resource</h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    Nama Resource Tunggal
                                    <span className="px-2 py-0.5 rounded-md bg-gray-200 dark:bg-white/10 text-[10px] font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Wajib</span>
                                </label>
                                <input 
                                    type="text" 
                                    className={inputClass} 
                                    value={data.resource_name} 
                                    onChange={e => setData('resource_name', e.target.value)} 
                                    placeholder="contoh: Barang, Kategori, Produk..."
                                    required
                                />
                                {errors.resource_name && <p className="text-red-500 text-xs mt-1 font-medium">{errors.resource_name}</p>}
                            </div>
                            
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                    Keterangan (Opsional)
                                </label>
                                <input 
                                    type="text" 
                                    className={inputClass} 
                                    value={data.description || ''} 
                                    onChange={e => setData('description', e.target.value)} 
                                    placeholder="contoh: Manajemen data barang..."
                                />
                                {errors.description && <p className="text-red-500 text-xs mt-1 font-medium">{errors.description}</p>}
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200 dark:border-white/10">
                                <div className="flex-1 flex items-start sm:items-center gap-4 bg-white/50 dark:bg-black/20 p-5 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors hover:bg-white/80 dark:hover:bg-black/30">
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1 sm:mt-0">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={data.has_chart}
                                            onChange={e => setData('has_chart', e.target.checked)}
                                        />
                                        <div className="w-12 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500 shadow-inner"></div>
                                    </label>
                                    <div>
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            Sertakan Chart / Grafik
                                            <BarChart3 size={14} className="text-indigo-500" />
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">Tambahkan komponen visualisasi data interaktif pada halaman index.</span>
                                    </div>
                                </div>

                                <div className="flex-1 flex items-start sm:items-center gap-4 bg-white/50 dark:bg-black/20 p-5 rounded-2xl border border-gray-200 dark:border-white/5 transition-colors hover:bg-white/80 dark:hover:bg-black/30">
                                    <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1 sm:mt-0">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={data.has_summary}
                                            onChange={e => setData('has_summary', e.target.checked)}
                                        />
                                        <div className="w-12 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-500/30 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-indigo-500 shadow-inner"></div>
                                    </label>
                                    <div>
                                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                                            Sertakan Widget Statistik
                                            <LayoutDashboard size={14} className="text-indigo-500" />
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400 mt-1 block">Tambahkan deretan summary cards / widget angka di bagian atas halaman index.</span>
                                    </div>
                                </div>
                            </div>
                    </div>

                    {/* Kotak Pengaturan Kolom */}
                    <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/60 dark:border-white/10 shadow-xl">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-gray-200 dark:border-white/10 pb-4 gap-4">
                            <div className="flex items-center gap-3">
                                <Database className="text-purple-500 dark:text-purple-400" size={20} />
                                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Desain Kolom / Field</h2>
                            </div>
                            <button 
                                type="button" 
                                onClick={addField} 
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-semibold text-sm transition-all border border-indigo-200 dark:border-indigo-500/20"
                            >
                                <Plus size={16} />
                                Tambah Kolom
                            </button>
                        </div>
                        
                        <div className="flex flex-col gap-4">
                            {data.fields.map((field: Field, index: number) => (
                                <div key={field.id} className="flex flex-col sm:flex-row gap-4 items-start sm:items-end bg-white/50 dark:bg-black/20 p-5 rounded-2xl border border-gray-200 dark:border-white/5 relative group transition-all hover:shadow-md dark:hover:border-white/10">
                                    
                                    <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-[#f8fafc] dark:border-[#0b1120] flex items-center justify-center text-[10px] font-bold text-gray-500 dark:text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {index + 1}
                                    </div>

                                    <div className="flex-1 w-full flex flex-col gap-2">
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                            <List size={12} />
                                            Nama Kolom
                                        </label>
                                        <input 
                                            type="text" 
                                            className={inputClass} 
                                            value={field.name} 
                                            onChange={e => updateField(field.id, 'name', e.target.value)} 
                                            placeholder="contoh: nama_barang"
                                            required
                                        />
                                    </div>
                                    <div className="w-full sm:w-1/3 flex flex-col gap-2">
                                        <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Tipe Data</label>
                                        <div className="relative">
                                            <select 
                                                className={selectClass} 
                                                value={field.type} 
                                                onChange={e => updateField(field.id, 'type', e.target.value)}
                                            >
                                                <option value="string">Teks Pendek (String)</option>
                                                <option value="text">Teks Panjang (Text)</option>
                                                <option value="integer">Angka Bulat (Integer)</option>
                                                <option value="date">Tanggal (Date)</option>
                                                <option value="boolean">Benar/Salah (Boolean)</option>
                                                <option value="file">File/Gambar (Upload)</option>
                                                <option value="relation">Relasi (Foreign Key)</option>
                                            </select>
                                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                            </div>
                                        </div>
                                    </div>
                                    {field.type === 'relation' && (
                                        <div className="w-full sm:w-1/3 flex flex-col gap-2">
                                            <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Model Relasi Target</label>
                                            <div className="relative">
                                                <select 
                                                    className={selectClass} 
                                                    value={field.related_model || ''} 
                                                    onChange={e => updateField(field.id, 'related_model', e.target.value)}
                                                    required={field.type === 'relation'}
                                                >
                                                    <option value="">-- Pilih Resource --</option>
                                                    {schemas.map((s, idx) => (
                                                        <option key={idx} value={s.resource_name}>{s.resource_name}</option>
                                                    ))}
                                                </select>
                                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                                                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    <div className="w-full sm:w-auto flex justify-end pb-1">
                                        <button 
                                            type="button" 
                                            onClick={() => removeField(field.id)}
                                            className="p-3 bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-all border border-red-100 dark:border-red-500/20 group/btn"
                                            title="Hapus Kolom"
                                        >
                                            <Trash2 size={18} className="group-hover/btn:scale-110 transition-transform" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 mb-10">
                        <button 
                            type="submit" 
                            disabled={processing || data.fields.length === 0} 
                            className="group relative flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white w-full md:w-auto rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-xl shadow-indigo-500/25 transition-all overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out"></div>
                            <span className="relative flex items-center gap-3">
                                {processing ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                        Sedang Membangun...
                                    </>
                                ) : (
                                    <>
                                        Generate Kode Secara Otomatis
                                    </>
                                )}
                            </span>
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
