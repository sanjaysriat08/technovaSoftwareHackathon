import React, { useState } from 'react';
import { Bell, Code, User, ChevronDown, CheckCheck, PanelLeft, ShieldCheck, UserCheck, ArrowRightLeft, Wrench } from 'lucide-react';
import { UserProfile, ModeratorProfile, StaffProfile, NotificationItem, UserRole } from '../../types';

interface HeaderProps {
  user: UserProfile;
  moderator?: ModeratorProfile;
  staff?: StaffProfile;
  activeRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  notifications: NotificationItem[];
  unreadCount: number;
  onNotificationClick: (id: string, complaintId?: string) => void;
  onMarkAllRead: () => void;
  onOpenProfile: () => void;
  onOpenApiDocs: () => void;
  onToggleSidebar?: () => void;
  isSidebarCollapsed?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  moderator,
  staff,
  activeRole,
  onRoleChange,
  notifications,
  unreadCount,
  onNotificationClick,
  onMarkAllRead,
  onOpenProfile,
  onOpenApiDocs,
  onToggleSidebar,
  isSidebarCollapsed,
}) => {
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isMod = activeRole === 'moderator';
  const isStaff = activeRole === 'staff';

  const displayName = isStaff
    ? (staff?.fullName || 'Mr. Arun Kumar')
    : isMod
    ? (moderator?.fullName || 'Dr. Ramesh V')
    : user.fullName;

  const displaySub = isStaff
    ? 'Maintenance Staff'
    : isMod
    ? 'Chief Moderator'
    : `Student (${user.rollNo})`;

  const portalTitle = isStaff ? 'Staff Portal' : isMod ? 'Moderator Portal' : 'Student Portal';

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Overview Title & Sidebar Toggle & Role Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle Sidebar"
          >
            <PanelLeft className="w-5 h-5" />
          </button>
        )}
        
        <div>
          <h1 className="text-base sm:text-xl font-bold text-slate-800 leading-tight truncate max-w-[130px] sm:max-w-none">
            {portalTitle}
          </h1>
        </div>

        {/* Role Switcher Dropdown Button */}
        <div className="relative hidden sm:inline-block">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`ml-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
              isStaff
                ? 'bg-purple-100 text-purple-800 hover:bg-purple-200 ring-1 ring-purple-200'
                : isMod
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200 ring-1 ring-amber-200'
                : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200 ring-1 ring-indigo-200'
            }`}
            title="Switch Module View"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Switch Module</span>
            <ChevronDown className="w-3 h-3 ml-0.5" />
          </button>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3.5">
        {/* Mobile Switcher Button */}
        <button
          onClick={() => onRoleChange(isMod ? 'student' : 'moderator')}
          className="sm:hidden p-2 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100"
          title="Switch Role"
        >
          <ArrowRightLeft className="w-4 h-4" />
        </button>

        {/* API Docs Button */}
        <button
          onClick={onOpenApiDocs}
          className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
          title="Open API Specs & Postman Collection"
        >
          <Code className="w-4 h-4 text-purple-600" />
          <span>API Docs</span>
        </button>

        {/* Notification Bell Popup */}
        <div className="relative">
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-slate-800">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    className="text-xs text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No notifications right now.
                  </div>
                ) : (
                  notifications.slice(0, 5).map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onNotificationClick(n.id, n.complaintId);
                        setShowNotifMenu(false);
                      }}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-start gap-3 ${
                        !n.read ? 'bg-purple-50/30' : ''
                      }`}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          !n.read ? 'bg-purple-600' : 'bg-slate-300'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs ${!n.read ? 'font-bold text-slate-800' : 'font-medium text-slate-600'}`}>
                          {n.title}
                        </p>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-medium">{n.timestamp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 pr-3 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-purple-700 text-white border-2 border-white overflow-hidden flex items-center justify-center shrink-0 font-bold text-xs">
              {isStaff ? 'AK' : isMod ? 'RM' : user.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{displayName}</p>
              <p className="text-[9px] font-semibold text-purple-700 leading-none">{displaySub}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-800">{displayName}</p>
                <p className="text-[11px] text-slate-500 truncate">
                  {isStaff
                    ? (staff?.email || 'arunkumar.m@bitsathy.ac.in')
                    : isMod
                    ? (moderator?.email || 'ramesh.v@bitsathy.ac.in')
                    : user.email}
                </p>
                <p className="text-[10px] text-purple-600 font-semibold mt-0.5">
                  {isStaff
                    ? 'Staff / Senior Maintenance'
                    : isMod
                    ? (moderator?.role || 'Chief Moderator')
                    : `Roll: ${user.rollNo}`}
                </p>
              </div>

              <div className="py-1 border-b border-slate-100 space-y-0.5">
                <p className="px-4 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Switch Portal</p>
                
                <button
                  onClick={() => {
                    onRoleChange('student');
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeRole === 'student' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Student Portal</span>
                  {activeRole === 'student' && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                </button>

                <button
                  onClick={() => {
                    onRoleChange('moderator');
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeRole === 'moderator' ? 'bg-amber-50 text-amber-800' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Moderator Portal</span>
                  {activeRole === 'moderator' && <span className="w-2 h-2 rounded-full bg-amber-600" />}
                </button>

                <button
                  onClick={() => {
                    onRoleChange('staff');
                    setShowUserMenu(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-xs font-semibold flex items-center justify-between transition-colors ${
                    activeRole === 'staff' ? 'bg-purple-50 text-purple-700' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>Staff Portal</span>
                  {activeRole === 'staff' && <span className="w-2 h-2 rounded-full bg-purple-600" />}
                </button>
              </div>

              <button
                onClick={() => {
                  onOpenProfile();
                  setShowUserMenu(false);
                }}
                className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-purple-700 flex items-center gap-2 mt-1"
              >
                <User className="w-4 h-4 text-slate-400" />
                <span>View Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

