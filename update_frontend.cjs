const fs = require('fs');
let file = fs.readFileSync('resources/js/pages/spj/index.tsx', 'utf8');

file = file.replace('interface Props {\n    data: PaginatedData;\n}', 'interface Props {\n    data: PaginatedData;\n    filters?: Record<string, string>;\n}');

file = file.replace(
    '    const [searchQuery, setSearchQuery] = useState(\'\');\n    const [statusFilter, setStatusFilter] = useState(\'\');',
    `    const initialFilters = {
        kegiatan: data.filters?.kegiatan || '',
        item_hps: data.filters?.item_hps || '',
        tanggal_kegiatan: data.filters?.tanggal_kegiatan || '',
        deadline_spj: data.filters?.deadline_spj || '',
        penyedia: data.filters?.penyedia || '',
        pic: data.filters?.pic || '',
        tracking_spj: data.filters?.tracking_spj || '',
    };
    const [filters, setFilters] = useState(initialFilters);

    function handleFilterChange(key: string, value: string) {
        setFilters(prev => ({ ...prev, [key]: value }));
    }

    function applyFilters() {
        const query = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== ''));
        router.get('/spj', query as any, { preserveState: true, replace: true });
    }

    function handleKeyDown(e: React.KeyboardEvent) {
        if (e.key === 'Enter') {
            applyFilters();
        }
    }`
);

file = file.replace(/<div className="flex flex-col sm:flex-row gap-3 w-full">[\s\S]*?<\/div>/, `
<div className="flex w-full items-center justify-between">
    <p className="text-sm text-slate-500">Ketik pada kolom pencarian di tabel lalu tekan <kbd className="px-2 py-1 bg-slate-100 rounded border font-mono text-xs shadow-sm">Enter</kbd> untuk mencari.</p>
</div>
`);

const newThead = `<thead className="sticky top-0 z-10 bg-white/95 shadow-sm backdrop-blur dark:bg-slate-900/95">
                                    <tr className="glass-table-head text-xs font-bold tracking-wider text-slate-500 uppercase">
                                        <th className="px-4 pt-3 pb-1 text-center whitespace-nowrap">#</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">KEGIATAN</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">ITEM HPS</th>
                                        <th className="px-4 pt-3 pb-1 text-right whitespace-nowrap">TOTAL HARGA</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">TGL KEGIATAN</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">DEADLINE SPJ</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">PENYEDIA</th>
                                        <th className="px-4 pt-3 pb-1 text-left whitespace-nowrap">PIC</th>
                                        <th className="px-4 pt-3 pb-1 text-center whitespace-nowrap">DOKUMEN</th>
                                        <th className="px-4 pt-3 pb-1 text-center whitespace-nowrap">KELENGKAPAN DOKUMEN</th>
                                        <th className="px-4 pt-3 pb-1 text-center whitespace-nowrap">TRACKING SPJ</th>
                                        <th className="px-4 pt-3 pb-1 text-center whitespace-nowrap">AKSI</th>
                                    </tr>
                                    <tr className="bg-slate-50/80 border-b border-slate-200 dark:bg-slate-800/80 dark:border-slate-700">
                                        <th className="px-2 py-1"></th>
                                        <th className="px-2 py-1 min-w-[150px]">
                                            <input type="text" placeholder="Cari Kegiatan..." value={filters.kegiatan} onChange={e => handleFilterChange('kegiatan', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1 min-w-[120px]">
                                            <input type="text" placeholder="Cari Item..." value={filters.item_hps} onChange={e => handleFilterChange('item_hps', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1"></th>
                                        <th className="px-2 py-1 min-w-[110px]">
                                            <input type="text" placeholder="YYYY-MM-DD" value={filters.tanggal_kegiatan} onChange={e => handleFilterChange('tanggal_kegiatan', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1 min-w-[110px]">
                                            <input type="text" placeholder="YYYY-MM-DD" value={filters.deadline_spj} onChange={e => handleFilterChange('deadline_spj', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1 min-w-[120px]">
                                            <input type="text" placeholder="Cari Penyedia..." value={filters.penyedia} onChange={e => handleFilterChange('penyedia', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1 min-w-[120px]">
                                            <input type="text" placeholder="Cari PIC..." value={filters.pic} onChange={e => handleFilterChange('pic', e.target.value)} onKeyDown={handleKeyDown} onBlur={applyFilters} className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal" />
                                        </th>
                                        <th className="px-2 py-1"></th>
                                        <th className="px-2 py-1"></th>
                                        <th className="px-2 py-1 min-w-[130px]">
                                            <select value={filters.tracking_spj} onChange={e => { handleFilterChange('tracking_spj', e.target.value); setTimeout(applyFilters, 100); }} className="w-full rounded border border-slate-200 px-1 py-1 text-[11px] outline-none focus:border-sky-400 focus:ring-1 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 font-normal">
                                                <option value="">Semua</option>
                                                <option value="Selesai">Selesai</option>
                                                <option value="SSPD & SPOD">SSPD & SPOD</option>
                                                <option value="Tidak Lengkap">Tidak Lengkap</option>
                                            </select>
                                        </th>
                                        <th className="px-2 py-1"></th>
                                    </tr>
                                </thead>`;

file = file.replace(/<thead[\s\S]*?<\/thead>/, newThead);

// Replace the old frontend filter logic
const oldFilterCode = `                                    {data.data
                                        .filter(item => {
                                            const matchSearch = !searchQuery || 
                                                (item.kegiatan?.toLowerCase() || '').includes(searchQuery.toLowerCase()) || 
                                                (item.pic?.nama?.toLowerCase() || '').includes(searchQuery.toLowerCase());
                                            
                                            const matchStatus = !statusFilter || 
                                                (statusFilter === 'Tidak Lengkap' ? 
                                                    ['Dokumen Tidak Lengkap', 'Menunggu Kelengkapan', 'Tidak Lengkap', 'Belum Lengkap'].includes(item.tracking_spj || '') : 
                                                    (statusFilter === 'SSPD & SPOD' ? ['SSPD & SPOD', 'SPPD & SOPD'].includes(item.tracking_spj || '') : item.tracking_spj === statusFilter));
                                            
                                            return matchSearch && matchStatus;
                                        })
                                        .map((item, index) => {`;
                                        
const newFilterCode = `                                    {data.data.map((item, index) => {`;

file = file.replace(oldFilterCode, newFilterCode);

fs.writeFileSync('resources/js/pages/spj/index.tsx', file);
