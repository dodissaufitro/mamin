import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

export interface ItemAnggaranDatum {
    id: number;
    nama_item: string;
    volume: number;
    harga_unit: number;
}

const SLICE_COLORS = [
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

interface TooltipPayload {
    payload?: any;
    percent?: number;
}

function ChartTooltip({ active, payload }: { active?: boolean; payload?: TooltipPayload[] }) {
    if (!active || !payload?.length || !payload[0].payload) {
        return null;
    }
    const entry = payload[0];
    const item = entry.payload!;
    const pct = entry.percent != null ? (entry.percent * 100).toFixed(1) : null;
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-lg">
            <p className="text-xs font-semibold text-slate-900">{item.nama_item}</p>
            <p className="mt-0.5 text-sm font-bold text-violet-700">Sisa: {formatRupiah(item.value)}</p>
            {pct != null && <p className="text-xs text-slate-600">{pct}% dari total sisa anggaran</p>}
        </div>
    );
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
        .map(item => ({ ...item, value: item.volume * item.harga_unit }))
        .filter((item) => item.value > 0);

    if (chartData.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-slate-500">
                Anggaran semua item sudah habis.
            </p>
        );
    }

    return (
        <div className="h-80 w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="nama_item"
                        cx="40%"
                        cy="50%"
                        outerRadius={100}
                        paddingAngle={1}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={entry.id} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                        layout="vertical"
                        verticalAlign="middle"
                        align="right"
                        iconType="circle"
                        formatter={(value, entry: any) => (
                            <span className="text-xs font-medium text-slate-700 ml-1">
                                {value} ({formatRupiah(entry.payload.value)})
                            </span>
                        )}
                        wrapperStyle={{ paddingLeft: 16 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
