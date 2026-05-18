import { AppContent } from '@/components/app-content';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import { CloudBackground } from '@/components/cloud-background';
import { initializeTheme } from '@/hooks/use-appearance';
import { type BreadcrumbItem } from '@/types';
import { useEffect } from 'react';

export default function AppSidebarLayout({ children, breadcrumbs = [] }: { children: React.ReactNode; breadcrumbs?: BreadcrumbItem[] }) {
    useEffect(() => {
        document.documentElement.classList.remove('dark');

        return () => initializeTheme();
    }, []);

    return (
        <div className="glass-theme relative min-h-svh text-slate-900">
            <CloudBackground />
            <AppShell variant="sidebar">
                <AppSidebar />
                <AppContent variant="sidebar">
                    <AppSidebarHeader breadcrumbs={breadcrumbs} />
                    {children}
                </AppContent>
            </AppShell>
        </div>
    );
}
