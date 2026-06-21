import AppLogoIcon from '@/components/app-logo-icon';
import { CloudBackground } from '@/components/cloud-background';
import { GlassPanel } from '@/components/glass-panel';
import { route } from '@/lib/ziggy';
import { Link } from '@inertiajs/react';

interface AuthLayoutProps {
    children: React.ReactNode;
    name?: string;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="glass-theme relative flex min-h-svh flex-col items-center justify-center p-4 md:p-8">
            <CloudBackground />

            <GlassPanel className="relative w-full max-w-md px-8 py-10 md:px-10">
                <div className="mb-8 flex flex-col items-center text-center">
                    <Link href={route('home')} className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-amber-50/90 shadow-sm">
                        <AppLogoIcon className="size-7 fill-current text-gray-900" />
                    </Link>

                    {title && <h1 className="text-2xl font-bold tracking-tight text-gray-900">{title}</h1>}
                    {description && <p className="mt-2 text-sm text-gray-500">{description}</p>}
                </div>

                {children}
            </GlassPanel>
        </div>
    );
}

