import React, { useState } from 'react';
import { NotificationItem } from '../types';
import { Bell, CheckCheck, Trash2, Search, CheckCircle2, AlertCircle, FileText, Info } from 'lucide-react';

interface NotificationsPageProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
  onDelete: (id: string) => void;
  onSelectComplaint?: (complaintId: string) => void;
}

export const NotificationsPage: React.FC<NotificationsPageProps> = ({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onDelete,
  onSelectComplaint,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'important'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = notifications.filter((n) => {
    const matchesSearch =
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'unread') return matchesSearch && !n.read;
    if (activeTab === 'important') return matchesSearch && n.important;
    return matchesSearch;
  });

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Notifications</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Stay updated with real-time progress on your submitted complaints.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={onMarkAllRead}
            className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Controls: Tabs & Search */}
      <div className="bg-white rounded-3xl border border-slate-100 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'all'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All ({notifications.length})
          </button>
          <button
            onClick={() => setActiveTab('unread')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'unread'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('important')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'important'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Important
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search notifications..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications found under this tab.
          </div>
        ) : (
          filtered.map((item) => {
            let iconBg = 'bg-purple-100 text-purple-700';
            if (item.type === 'resolved') iconBg = 'bg-emerald-100 text-emerald-700';
            if (item.type === 'assigned') iconBg = 'bg-indigo-100 text-indigo-700';
            if (item.type === 'updated') iconBg = 'bg-amber-100 text-amber-700';
            if (item.type === 'system') iconBg = 'bg-slate-100 text-slate-700';

            return (
              <div
                key={item.id}
                className={`p-5 flex items-start justify-between gap-4 transition-colors ${
                  !item.read ? 'bg-purple-50/20' : 'hover:bg-slate-50/50'
                }`}
              >
                <div
                  onClick={() => {
                    if (!item.read) onMarkRead(item.id);
                    if (item.complaintId && onSelectComplaint) {
                      onSelectComplaint(item.complaintId);
                    }
                  }}
                  className="flex items-start gap-4 flex-1 min-w-0 cursor-pointer"
                >
                  <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
                    <Bell className="w-5 h-5" />
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className={`text-xs ${!item.read ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>
                        {item.title}
                      </h4>
                      {!item.read && (
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                      )}
                      {item.important && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold">
                          Important
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.message}</p>
                    <span className="text-[10px] text-slate-400 font-medium block pt-1">{item.timestamp}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!item.read && (
                    <button
                      onClick={() => onMarkRead(item.id)}
                      className="p-2 rounded-lg text-purple-700 hover:bg-purple-100 text-xs font-semibold"
                      title="Mark as read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete notification"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
