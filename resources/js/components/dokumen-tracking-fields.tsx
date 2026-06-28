import { type DokumenProgress } from '@/lib/dokumen';

export function DokumenProgressBar({ progress }: { progress: DokumenProgress | null | undefined }) {
    const total = progress?.total ?? 0;
    const done = progress?.done ?? 0;
    const pct = progress?.pct ?? 0;

    if (total === 0) {
        return <span className="text-xs text-slate-400">-</span>;
    }

    return (
        <div className="flex w-20 flex-col items-center gap-1">
            <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all ${pct === 100 ? 'bg-emerald-500' : pct >= 50 ? 'bg-orange-400' : 'bg-rose-500'}`}
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-xs font-medium text-slate-500">
                {done}/{total}
            </span>
        </div>
    );
}

export function DokumenCountBadge({ count }: { count: number }) {
    if (count === 0) {
        return <span className="text-xs text-slate-400">Belum diatur</span>;
    }

    return (
        <span className="inline-flex rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">
            {count} dokumen
        </span>
    );
}
