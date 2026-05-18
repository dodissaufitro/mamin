import { GlassPanel } from '@/components/glass-panel';
import { glassPageSubtitleClass, glassPageTitleClass } from '@/lib/glass-styles';
import { cn } from '@/lib/utils';
import { type ReactNode } from 'react';

export function AppPageHeader({
    title,
    description,
    action,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
                <h1 className={glassPageTitleClass}>{title}</h1>
                {description && <p className={glassPageSubtitleClass}>{description}</p>}
            </div>
            {action}
        </div>
    );
}

export function AppContentCard({ children, className }: { children: ReactNode; className?: string }) {
    return <GlassPanel className={cn('overflow-hidden rounded-2xl', className)}>{children}</GlassPanel>;
}
