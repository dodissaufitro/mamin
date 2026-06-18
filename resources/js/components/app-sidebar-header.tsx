import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { Bell } from 'lucide-react';
import { usePage, Link } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { cn } from '@/lib/utils';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage<SharedData>().props;

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/70 bg-white/40 px-6 backdrop-blur-md transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-2 text-slate-800 [&_a]:text-slate-600 [&_a:hover]:text-slate-900 [&_span]:text-slate-900">
                <SidebarTrigger className="-ml-1 text-slate-700 hover:bg-sky-100/80 hover:text-slate-900" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            <div className="flex items-center gap-2">
                {auth.user.role === 'admin' && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="group relative h-9 w-9 cursor-pointer">
                                <Icon iconNode={Bell} className="!size-5 text-slate-700 opacity-80 group-hover:opacity-100" />
                                {(auth.user.unread_notifications_count as number) > 0 && (
                                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white/50">
                                        {auth.user.unread_notifications_count as number}
                                    </span>
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80" align="end">
                            <div className="flex items-center justify-between px-4 py-2 font-semibold border-b">
                                Notifications
                            </div>
                            <div className="flex flex-col py-1">
                                {((auth.user.notifications as any[]) || []).length > 0 ? (
                                    ((auth.user.notifications as any[]) || []).map((notification) => (
                                        <Link 
                                            key={notification.id} 
                                            href={`/spj/${notification.data.spj_id}/edit`} 
                                            method="post"
                                            data={{ _method: 'get' }}
                                            className={cn(
                                                "px-4 py-3 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors",
                                                notification.read_at === null ? "bg-sky-50 dark:bg-sky-900/20" : ""
                                            )}
                                        >
                                            <div className="font-medium">{notification.data.message}</div>
                                            <div className="text-xs text-neutral-500 mt-1">{new Date(notification.created_at).toLocaleString()}</div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="px-4 py-3 text-sm text-center text-neutral-500">
                                        No recent notifications
                                    </div>
                                )}
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    );
}
