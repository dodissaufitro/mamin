<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;

class InboxController extends Controller
{
    public function index()
    {
        $notifications = auth()->user()
            ->notifications()
            ->latest()
            ->paginate(15);

        return Inertia::render('inbox/index', [
            'notifications' => $notifications,
            'unreadCount' => auth()->user()->unreadNotifications()->count(),
        ]);
    }

    public function open(string $id)
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        $spjId = $notification->data['spj_id'] ?? null;

        if (! $spjId) {
            return redirect()->route('inbox.index');
        }

        $user = auth()->user();

        if ($user->isSuperAdmin() || $user->isBendahara()) {
            return redirect()->route('spj.edit', $spjId);
        }

        return redirect()->route('spj.show', $spjId);
    }

    public function markAllRead()
    {
        auth()->user()->unreadNotifications->markAsRead();

        return redirect()->route('inbox.index')
            ->with('success', 'Semua notifikasi ditandai sudah dibaca.');
    }
}
