import {
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
} from 'recharts';

export interface ItemVolumeDatum {
    id: number;
    nama_item: string;
    volume: number;
}

const SLICE_COLORS = [
    '#7c3aed',
    '#6366f1',
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#8b5cf6',
    '#14b8a6',
    '#ef4444',
    '#84cc16',
];

function formatVolume(value: number) {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 }).format(value);
}

interface TooltipPayload {
    payload?: ItemVolumeDatum;
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
            <p className="mt-0.5 text-sm font-bold text-violet-700">Tersisa: {formatVolume(item.volume)}</p>
            {pct != null && <p className="text-xs text-slate-600">{pct}% dari total volume</p>}
        </div>
    );
}

interface Props {
    data: ItemVolumeDatum[];
}

export function ItemVolumeChart({ data }: Props) {
    if (data.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-slate-500">
                Belum ada data Item HPS.
            </p>
        );
    }

    const chartData = data.filter((item) => item.volume > 0);

    if (chartData.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-slate-500">
                Volume semua item sudah habis.
            </p>
        );
    }

    return (
        <div className="h-80 w-full min-h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={chartData}
                        dataKey="volume"
                        nameKey="nama_item"
                        cx="50%"
                        cy="45%"
                        outerRadius={110}
                        paddingAngle={1}
                    >
                        {chartData.map((entry, index) => (
                            <Cell key={entry.id} fill={SLICE_COLORS[index % SLICE_COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                    <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        formatter={(value) => (
                            <span className="text-xs font-medium text-slate-700">{value}</span>
                        )}
                        wrapperStyle={{ paddingTop: 16 }}
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
}
