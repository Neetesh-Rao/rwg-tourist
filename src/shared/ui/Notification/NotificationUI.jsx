import React, { useState } from 'react';
import { Bell, X, CheckCheck } from 'lucide-react';
import { useGetNotificationsQuery, useMarkAllNotificationsReadMutation } from '@/app/store/slices/notification.api';

const typeIcons = {
  rider_assigned: "🚗",
  ride_completed: "✅",
  booking_cancelled: "❌",
  new_booking: "📋",
  payment_received: "💰",
  payout_processed: "💸",
  payout_rejected: "⚠️",
  general: "🔔",
};

export function NotificationBell({ onClick }) {
  const { data } = useGetNotificationsQuery(1, { pollingInterval: 30000 });
  const unread = data?.data?.unreadCount || 0;

  return (
    <button onClick={onClick} className="relative w-9 h-9 rounded-xl flex items-center justify-center text-ink-500 dark:text-ink-400 hover:bg-surface-2 dark:hover:bg-surface-3 transition-all" aria-label="Notifications">
      <Bell className="w-4.5 h-4.5" />
      {unread > 0 && (
        <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border border-[var(--bg)] animate-pulse">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </button>
  );
}

export function NotificationPanel({ onClose }) {
  const { data, isLoading } = useGetNotificationsQuery(1);
  const [markAllRead] = useMarkAllNotificationsReadMutation();

  const notifications = data?.data?.notifications || [];

  return (
    <>
      <div className="fixed inset-0 z-[101]" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-[var(--surface)] shadow-card rounded-2xl border border-[var(--border)] z-[102] overflow-hidden flex flex-col max-h-[80vh] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-surface-2 dark:bg-surface-3">
          <h2 className="text-sm font-semibold text-ink-900 dark:text-ink-100">Notifications</h2>
          <div className="flex gap-2">
            <button onClick={() => markAllRead()} title="Mark all as read" className="text-brand-500 hover:text-brand-600 transition-colors">
              <CheckCheck size={18} />
            </button>
            <button onClick={onClose} className="text-ink-500 hover:text-ink-700 dark:hover:text-ink-300 transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-8 text-center text-ink-500 text-sm">Loading notifications...</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-ink-500 text-sm flex flex-col items-center gap-2">
              <Bell className="w-8 h-8 text-ink-300 dark:text-ink-700" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {notifications.map((n) => (
                <div
                  key={n._id}
                  className={`p-4 transition-colors ${!n.isRead ? "bg-brand-50/50 dark:bg-brand-900/10" : "hover:bg-surface-2 dark:hover:bg-surface-3"}`}
                >
                  <div className="flex gap-3">
                    <span className="text-2xl leading-none flex-shrink-0">
                      {typeIcons[n.type] || "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${!n.isRead ? 'font-semibold text-ink-900 dark:text-ink-100' : 'font-medium text-ink-800 dark:text-ink-200'} truncate`}>{n.title}</p>
                      <p className="text-xs text-ink-600 dark:text-ink-400 mt-1 line-clamp-2 leading-relaxed">{n.message}</p>
                      <p className="text-[10px] text-ink-400 dark:text-ink-500 mt-2 font-medium uppercase tracking-wider">
                        {new Date(n.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!n.isRead && (
                      <span className="w-2 h-2 bg-brand-500 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(var(--brand-500),0.5)]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
