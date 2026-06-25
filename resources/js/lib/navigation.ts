import { type NavItem, type SharedData } from '@/types';
import { ClipboardList, FileCheck2, LayoutGrid, Package, Store, UserCog, Users } from 'lucide-react';

export function getNavItems(auth: SharedData['auth']): NavItem[] {
    const permissions = auth.permissions ?? {};
    const items: NavItem[] = [];

    if (permissions['dashboard.view']) {
        items.push({
            title: 'Dashboard',
            url: '/dashboard',
            icon: LayoutGrid,
        });
    }

    if (permissions['spj.view']) {
        items.push({
            title: 'SPJ Makan Minum Rapat',
            url: '/spj',
            icon: ClipboardList,
        });
    }

    if (permissions['pic.view']) {
        items.push({
            title: 'Data PIC',
            url: '/pic',
            icon: Users,
        });
    }
    
    if (permissions['penyedia.view']) {
        items.push({
            title: 'Data Penyedia',
            url: '/penyedia',
            icon: Store,
        });
    }
    
    if (permissions['item_hps.view']) {
        items.push({
            title: 'Item HPS',
            url: '/item-hps',
            icon: Package,
        });
    }
    
    if (permissions['jenis_dokumen.view']) {
        items.push({
            title: 'Dokumen Berlaku',
            url: '/jenis-dokumen',
            icon: FileCheck2,
        });
    }

    if (permissions['users.view']) {
        items.push({
            title: 'Kelola User',
            url: '/users',
            icon: UserCog,
        });
    }
    
    if (permissions['roles.view']) {
        items.push({
            title: 'Manajemen Role',
            url: '/roles',
            icon: UserCog,
        });
    }

    return items;
}

export function roleBadgeClass(role: string): string {
    switch (role) {
        case 'super_admin':
            return 'bg-violet-100 text-violet-800';
        case 'pic':
            return 'bg-sky-100 text-sky-800';
        case 'bendahara':
            return 'bg-amber-100 text-amber-800';
        default:
            return 'bg-slate-100 text-slate-700';
    }
}

export function roleLabel(role: string): string {
    switch (role) {
        case 'super_admin':
            return 'Super Admin';
        case 'pic':
            return 'PIC';
        case 'bendahara':
            return 'Bendahara';
        default:
            return role;
    }
}
