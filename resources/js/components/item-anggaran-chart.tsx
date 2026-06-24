import {
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    LabelList,
    Legend,
    ResponsiveContainer,
    XAxis,
    YAxis,
} from 'recharts';

export interface ItemAnggaranDatum {
    id: number;
    nama_item: string;
    volume: number;
    terpakai: number;
    harga_unit: number;
}

const COLOR_TOTAL = '#4472C4';
const COLOR_DIGUNAKAN = '#70AD47';
const MAJOR_STEP = 50_000_000;
const MINOR_STEP = 10_000_000;

interface ChartRow {
    rowId: string;
    namaItem: string;
    showLabel: boolean;
    value: number;
    kind: 'total' | 'used';
}

function formatRupiahLabel(value: number) {
    return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(Math.round(value));
}

function formatJutaTick(value: number) {
    if (value === 0) {
        return '0';
    }

    return `${value / 1_000_000} Juta`;
}

function getAxisMax(maxTotal: number) {
    if (maxTotal <= 0) {
        return MAJOR_STEP;
    }

    return Math.ceil(maxTotal / MAJOR_STEP) * MAJOR_STEP;
}

function buildXTicks(axisMax: number) {
    const ticks: number[] = [];

    for (let tick = 0; tick <= axisMax; tick += MINOR_STEP) {
        ticks.push(tick);
    }

    return ticks;
}

function buildRows(
    items: Array<{ id: number; nama_item: string; totalItemHps: number; sudahDigunakan: number }>,
): ChartRow[] {
    return items.flatMap((item) => [
        {
            rowId: `${item.id}-total`,
            namaItem: item.nama_item,
            showLabel: true,
            value: item.totalItemHps,
            kind: 'total' as const,
        },
        {
            rowId: `${item.id}-used`,
            namaItem: item.nama_item,
            showLabel: false,
            value: item.sudahDigunakan,
            kind: 'used' as const,
        },
    ]);
}

function YAxisTick({
    x = 0,
    y = 0,
    payload,
    rowsById,
}: {
    x?: number;
    y?: number;
    payload?: { value: string };
    rowsById: Map<string, ChartRow>;
}) {
    const row = payload?.value ? rowsById.get(payload.value) : undefined;

    if (!row?.showLabel) {
        return null;
    }

    return (
        <text
            x={x}
            y={y}
            dy={14}
            textAnchor="end"
            fill="#1e293b"
            fontSize={13}
            fontWeight={500}
        >
            {row.namaItem}
        </text>
    );
}

function ValueLabel(props: { x?: number; y?: number; width?: number; height?: number; value?: number }) {
    const { x = 0, y = 0, width = 0, height = 0, value = 0 } = props;

    if (value <= 0) {
        return null;
    }

    return (
        <text
            x={x + width + 6}
            y={y + height / 2}
            dy={4}
            fill="#334155"
            fontSize={11}
            fontWeight={500}
        >
            {formatRupiahLabel(value)}
        </text>
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

    const chartItems = data
        .map((item) => {
            const terpakai = item.terpakai ?? 0;
            const totalItemHps = (item.volume + terpakai) * item.harga_unit;
            const sudahDigunakan = terpakai * item.harga_unit;

            return {
                id: item.id,
                nama_item: item.nama_item,
                totalItemHps,
                sudahDigunakan,
            };
        })
        .filter((item) => item.totalItemHps > 0);

    if (chartItems.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-slate-500">
                Belum ada data anggaran Item HPS.
            </p>
        );
    }

    const rows = buildRows(chartItems);
    const rowsById = new Map(rows.map((row) => [row.rowId, row]));

    const maxTotal = Math.max(...chartItems.map((item) => item.totalItemHps));
    const axisMax = getAxisMax(maxTotal);
    const xTicks = buildXTicks(axisMax);
    const chartHeight = Math.max(320, chartItems.length * 72 + 80);

    return (
        <div className="w-full">
            <h3 className="mb-4 text-center text-base font-bold text-slate-900">
                Anggaran Belanja Penyediaan Makanan dan Minuman
            </h3>

            <div className="w-full overflow-x-auto">
                <div style={{ minWidth: 680, height: chartHeight }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={rows}
                            layout="vertical"
                            margin={{ top: 8, right: 120, left: 8, bottom: 48 }}
                            barCategoryGap="18%"
                            barGap={2}
                        >
                            <CartesianGrid horizontal={false} strokeDasharray="4 4" stroke="#e2e8f0" />
                            <XAxis
                                type="number"
                                domain={[0, axisMax]}
                                ticks={xTicks}
                                tickFormatter={formatJutaTick}
                                tick={{ fill: '#475569', fontSize: axisMax <= MAJOR_STEP * 2 ? 11 : 12 }}
                                axisLine={{ stroke: '#94a3b8' }}
                                tickLine={{ stroke: '#94a3b8' }}
                                label={{
                                    value: 'Anggaran (Rupiah)',
                                    position: 'insideBottom',
                                    offset: -28,
                                    fill: '#334155',
                                    fontSize: 13,
                                    fontWeight: 500,
                                }}
                            />
                            <YAxis
                                type="category"
                                dataKey="rowId"
                                width={156}
                                tickLine={false}
                                axisLine={{ stroke: '#94a3b8' }}
                                tick={(props: any) => <YAxisTick {...props} rowsById={rowsById} />}
                            />
                            <Legend
                                verticalAlign="bottom"
                                align="center"
                                content={() => (
                                    <div className="flex justify-center items-center gap-6 pt-9">
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3" style={{ backgroundColor: COLOR_TOTAL }}></div>
                                            <span className="text-sm text-slate-600 font-medium">Total Item HPS</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3" style={{ backgroundColor: COLOR_DIGUNAKAN }}></div>
                                            <span className="text-sm text-slate-600 font-medium">Sudah Digunakan</span>
                                        </div>
                                    </div>
                                )}
                            />
                            <Bar dataKey="value" radius={[0, 2, 2, 0]} barSize={18} isAnimationActive={false}>
                                {rows.map((row) => (
                                    <Cell
                                        key={row.rowId}
                                        fill={row.kind === 'total' ? COLOR_TOTAL : COLOR_DIGUNAKAN}
                                    />
                                ))}
                                <LabelList dataKey="value" content={<ValueLabel />} />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
