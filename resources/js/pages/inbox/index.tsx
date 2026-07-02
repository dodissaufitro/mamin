import { AppContentCard, AppPageHeader } from '@/components/app-page';
import { glassBtnSecondaryClass } from '@/lib/glass-styles';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import { Bell, CheckCheck, ClipboardList, ExternalLink } from 'lucide-react';

interface NotificationData {
    type?: string;
    spj_id?: number;
    kegiatan?: string;
    item_hps?: string;
    pic?: string;
    penyedia?: string;
    submitted_by?: string;
    message?: string;
}

interface NotificationItem {
    id: string;
    type: string;
    data: NotificationData;
    read_at: string | null;
    created_at: string;
}

interface PaginatedNotifications {
    data: NotificationItem[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

interface Props {
    notifications: PaginatedNotifications;
    unreadCount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Inbox / Notifikasi', href: '/inbox' },
];

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function InboxIndex({ notifications, unreadCount }: Props) {
    function handleMarkAllRead() {
        router.post('/notifications/read-all');
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Inbox / Notifikasi" />
            <div className="flex flex-col gap-4 p-4 md:p-6">
                <AppPageHeader
                    title="Inbox / Notifikasi"
                    description="Notifikasi SPJ Makan Minum yang baru masuk."
                    action={
                        unreadCount > 0 ? (
                            <button
                                type="button"
                                onClick={handleMarkAllRead}
                                className={`${glassBtnSecondaryClass} inline-flex items-center gap-2`}
                            >
                                <CheckCheck className="h-4 w-4" />
                                Tandai semua dibaca
                            </button>
                        ) : undefined
                    }
                />

                <AppContentCard className="p-0">
                    {notifications.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                            <Bell className="mb-3 h-10 w-10 text-slate-300" />
                            <p className="text-sm font-medium">Belum ada notifikasi.</p>
                            <p className="mt-1 text-xs">Notifikasi SPJ baru akan muncul di sini.</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-slate-200/70">
                            {notifications.data.map((notification) => {
                                const isUnread = notification.read_at === null;
                                const data = notification.data;

                                return (
                                    <li key={notification.id}>
                                        <Link
                                            href={`/notifications/${notification.id}/open`}
                                            className={`flex gap-4 px-4 py-4 transition-colors hover:bg-sky-50/80 ${
                                                isUnread ? 'bg-sky-50/50' : 'bg-white'
                                            }`}
                                        >
                                            <div
                                                className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                                                    isUnread ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-500'
                                                }`}
                                            >
                                                <ClipboardList className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <p className={`text-sm ${isUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                                                            {data.message ?? 'SPJ baru masuk'}
                                                        </p>
                                                        <p className="mt-1 text-xs text-slate-500">
                                                            {formatDateTime(notification.created_at)}
                                                            {isUnread && (
                                                                <span className="ml-2 inline-flex rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                                    Baru
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />
                                                </div>
                                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                                                    {data.item_hps && (
                                                        <span className="rounded-full bg-violet-100 px-2 py-0.5">
                                                            Item: {data.item_hps}
                                                        </span>
                                                    )}
                                                    {data.pic && (
                                                        <span className="rounded-full bg-sky-100 px-2 py-0.5">
                                                            PIC: {data.pic}
                                                        </span>
                                                    )}
                                                    {data.penyedia && (
                                                        <span className="rounded-full bg-amber-100 px-2 py-0.5">
                                                            Penyedia: {data.penyedia}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                    {notifications.last_page > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-200/80 bg-slate-50/60 px-4 py-3">
                            <p className="text-xs text-slate-600">
                                Halaman {notifications.current_page} dari {notifications.last_page}
                            </p>
                            <div className="flex gap-1">
                                {notifications.links.map((link, i) => (
                                    <Link
                                        key={i}
                                        href={link.url ?? '#'}
                                        className={`rounded px-3 py-1 text-xs ${
                                            link.active
                                                ? 'rounded-lg bg-slate-900 text-white shadow-sm'
                                                : link.url
                                                  ? 'rounded-lg text-sky-700 hover:bg-sky-100'
                                                  : 'pointer-events-none text-slate-300'
                                        }`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </AppContentCard>
            </div>
        </AppLayout>
    );
}
