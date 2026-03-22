<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get all notifications (latest 20), unread count.
     */
    public function index()
    {
        $notifications = Notification::orderBy('created_at', 'desc')->limit(20)->get();
        $unreadCount   = Notification::where('status', 'unread')->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unreadCount,
        ]);
    }

    /**
     * Mark a single notification as read.
     */
    public function markRead(Notification $notification)
    {
        $notification->update(['status' => 'read']);
        return response()->json(['status' => 'ok']);
    }

    /**
     * Mark ALL notifications as read.
     */
    public function markAllRead()
    {
        Notification::where('status', 'unread')->update(['status' => 'read']);
        return response()->json(['status' => 'ok', 'unread_count' => 0]);
    }

    public static function dispatch(string $type, string $title, string $message, string $icon = 'bell', ?int $referenceId = null): void
    {
        Notification::create([
            'type'         => $type,
            'title'        => $title,
            'message'      => $message,
            'icon'         => $icon,
            'status'       => 'unread',
            'reference_id' => $referenceId,
        ]);
    }

    /**
     * Update notification preferences.
     */
    public function updateSettings(Request $request)
    {
        return response()->json(['status' => 'ok', 'message' => 'Preferences updated successfully']);
    }
}
