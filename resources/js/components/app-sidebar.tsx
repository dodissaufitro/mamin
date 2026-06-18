import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ClipboardList, LayoutGrid, Package, Store, Users, Inbox } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'SPJ Makan Minum Rapat',
        url: '/spj',
        icon: ClipboardList,
    },
    {
        title: 'Data PIC',
        url: '/pic',
        icon: Users,
    },
    {
        title: 'Data Penyedia',
        url: '/penyedia',
        icon: Store,
    },
    {
        title: 'Item HPS',
        url: '/item-hps',
        icon: Package,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;

    const navItems = [...mainNavItems];
    if (auth.user.role === 'admin') {
        const unreadCount = (auth.user.unread_notifications_count as number) || 0;
        navItems.push({
            title: `Inbox / My Task${unreadCount > 0 ? ` (${unreadCount})` : ''}`,
            url: '/inbox',
            icon: Inbox,
        });
    }

    return (
        <Sidebar
            collapsible="icon"
            variant="floating"
            className="[&_[data-sidebar=sidebar]]:glass-sidebar [&_[data-sidebar=sidebar]]:bg-transparent"
        >
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
