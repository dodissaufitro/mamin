export interface ItemAnggaranDatum {
    id: number;
    nama_item: string;
    volume: number;
    terpakai: number;
    harga_unit: number;
}

const BAR_COLORS = [
    '#ef4444', // Merah
    '#f97316', // Jingga
    '#eab308', // Kuning
    '#22c55e', // Hijau
    '#3b82f6', // Biru
    '#4f46e5', // Nila
    '#a855f7', // Ungu
];

function formatRupiah(value: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

interface Props {
    data: ItemAnggaranDatum[];
}

export function ItemAnggaranChart({ data }: Props) {
    if (data.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-slate-500">
                Belum ada data Item HPS.
            </p>
        );
    }

    const chartData = data
        .map((item) => {
            const terpakai = item.terpakai ?? 0;
            const totalAnggaran = (item.volume + terpakai) * item.harga_unit;
            const anggaranDigunakan = terpakai * item.harga_unit;

            return {
                ...item,
                totalAnggaran,
                anggaranDigunakan,
            };
        })
        .filter((item) => item.totalAnggaran > 0)
        .sort((a, b) => b.totalAnggaran - a.totalAnggaran);

    if (chartData.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-slate-500">
                Belum ada data anggaran Item HPS.
            </p>
        );
    }

    const maxTotal = chartData[0].totalAnggaran;

    return (
        <div className="flex flex-col gap-6 py-2">
            {chartData.map((item, index) => {
                const color = BAR_COLORS[index % BAR_COLORS.length];
                const totalBarWidth = maxTotal > 0 ? (item.totalAnggaran / maxTotal) * 100 : 0;
                const usedBarWidth = maxTotal > 0 ? (item.anggaranDigunakan / maxTotal) * 100 : 0;

                return (
                    <div key={item.id} className="flex flex-col gap-2">
                        <p className="text-sm font-semibold text-slate-800">{item.nama_item}</p>

                        <div className="flex items-center gap-4">
                            <div className="w-32 shrink-0 text-xs font-medium text-slate-600 sm:w-36">
                                Total Anggaran
                            </div>
                            <div className="relative min-w-0 flex-1">
                                <div
                                    className="h-7 rounded-r-md transition-all"
                                    style={{
                                        width: `${totalBarWidth}%`,
                                        backgroundColor: color,
                                        minWidth: totalBarWidth > 0 ? '6px' : 0,
                                    }}
                                    title={`Total Anggaran: ${formatRupiah(item.totalAnggaran)}`}
                                />
                            </div>
                            <div className="w-28 shrink-0 text-right text-xs font-medium text-slate-600 sm:w-32">
                                {formatRupiah(item.totalAnggaran)}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-32 shrink-0 text-xs font-medium text-slate-600 sm:w-36">
                                Sudah Digunakan
                            </div>
                            <div className="relative min-w-0 flex-1">
                                <div
                                    className="h-7 rounded-r-md transition-all"
                                    style={{
                                        width: `${usedBarWidth}%`,
                                        backgroundColor: color,
                                        opacity: 0.55,
                                        minWidth: usedBarWidth > 0 ? '6px' : 0,
                                    }}
                                    title={`Sudah Digunakan: ${formatRupiah(item.anggaranDigunakan)}`}
                                />
                            </div>
                            <div className="w-28 shrink-0 text-right text-xs font-medium text-slate-600 sm:w-32">
                                {formatRupiah(item.anggaranDigunakan)}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
