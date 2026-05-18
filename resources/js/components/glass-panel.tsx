import { cn } from '@/lib/utils';
import * as React from 'react';

interface GlassPanelProps extends React.ComponentProps<'div'> {
    children: React.ReactNode;
}

export function GlassPanel({ children, className, ...props }: GlassPanelProps) {
    return (
        <div className={cn('glass-panel', className)} {...props}>
            {children}
        </div>
    );
}
