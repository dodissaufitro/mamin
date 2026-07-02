import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/icon';
import { Bell } from 'lucide-react';
import { Link, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { cn } from '@/lib/utils';

interface NotificationData {
    spj_id?: number;
    message?: string;
}

interface NotificationItem {
    id: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

export function NotificationBellDropdown() {
    const { auth } = usePage<SharedData>().props;
    const notifications = (auth.user?.notifications as NotificationItem[]) ?? [];
    const unreadCount = (auth.user?.unread_notifications_count as number) ?? 0;

    if (!auth.permissions?.viewInbox) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="group relative h-9 w-9 cursor-pointer">
                    <Icon iconNode={Bell} className="!size-5 text-slate-700 opacity-80 group-hover:opacity-100" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white/50">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <div className="flex items-center justify-between border-b px-4 py-2 font-semibold">
                    <span>Notifikasi</span>
                    {unreadCount > 0 && (
                        <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
                            {unreadCount} baru
                        </span>
                    )}
                </div>
                <div className="flex max-h-80 flex-col overflow-y-auto py-1">
                    {notifications.length > 0 ? (
                        notifications.map((notification) => (
                            <Link
                                key={notification.id}
                                href={`/notifications/${notification.id}/open`}
                                className={cn(
                                    'px-4 py-3 text-sm transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800',
                                    notification.read_at === null ? 'bg-sky-50 dark:bg-sky-900/20' : '',
                                )}
                            >
                                <div className="font-medium">{notification.data.message ?? 'SPJ baru masuk'}</div>
                                <div className="mt-1 text-xs text-neutral-500">
                                    {new Date(notification.created_at).toLocaleString('id-ID')}
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="px-4 py-3 text-center text-sm text-neutral-500">
                            Belum ada notifikasi
                        </div>
                    )}
                </div>
                <div className="border-t px-4 py-2">
                    <Link href="/spj" className="text-sm font-medium text-violet-600 hover:underline">
                        Lihat semua di SPJ Makan Minum
                    </Link>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
