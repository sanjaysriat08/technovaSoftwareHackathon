import React from 'react';
import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Activity,
  Bell,
  User,
  LogOut,
  ShieldAlert,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  ClipboardList,
  Upload,
  TrendingUp,
  CheckCircle,
  History,
  Wrench,
  Check
} from 'lucide-react';
import { ActiveTab, UserRole } from '../../types';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  activeRole: UserRole;
  unreadCount: number;
  onLogoutClick: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasPlusPill?: boolean;
  badge?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeRole,
  unreadCount,
  onLogoutClick,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const isMod = activeRole === 'moderator';
  const isStaff = activeRole === 'staff';

  const studentNavItems: NavItem[] = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'raise' as ActiveTab, label: 'Raise Complaint', icon: FilePlus, hasPlusPill: true },
    { id: 'my-complaints' as ActiveTab, label: 'My Complaints', icon: FileText },
    { id: 'status' as ActiveTab, label: 'Status Tracking', icon: Activity },
    { id: 'notifications' as ActiveTab, label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'profile' as ActiveTab, label: 'Profile', icon: User },
  ];

  const moderatorNavItems: NavItem[] = [
    { id: 'mod-dashboard' as ActiveTab, label: 'Command Center', icon: LayoutDashboard },
    { id: 'mod-pending' as ActiveTab, label: 'Pending Approvals', icon: Clock },
    { id: 'mod-approved' as ActiveTab, label: 'Approved Complaints', icon: CheckCircle2 },
    { id: 'mod-rejected' as ActiveTab, label: 'Rejected Complaints', icon: XCircle },
    { id: 'mod-notifications' as ActiveTab, label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'mod-profile' as ActiveTab, label: 'Moderator Profile', icon: ShieldCheck },
  ];

  const staffNavItems: NavItem[] = [
    { id: 'staff-dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'staff-assigned' as ActiveTab, label: 'Assigned Complaints', icon: ClipboardList },
    { id: 'staff-history' as ActiveTab, label: 'Work History', icon: History },
    { id: 'staff-notifications' as ActiveTab, label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'staff-profile' as ActiveTab, label: 'Staff Profile', icon: User },
  ];

  const navItems = isStaff ? staffNavItems : isMod ? moderatorNavItems : studentNavItems;

  const handleTabClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`bg-white border-r border-slate-200 flex flex-col h-screen fixed lg:sticky top-0 left-0 select-none shrink-0 z-50 lg:z-30 transition-all duration-300 ${
          isMobileOpen ? 'translate-x-0 w-64 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-16' : 'lg:w-64'}`}
      >
      {/* Brand Header */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b border-slate-100 h-16`}>
        {!isCollapsed && (
          <div className="flex items-center gap-3 overflow-hidden">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0 ${
              isStaff ? 'bg-purple-700' : isMod ? 'bg-amber-600' : 'bg-purple-700'
            }`}>
              {isStaff ? <Wrench className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div className="truncate">
              <h1 className="font-bold text-base tracking-tight text-slate-800 leading-tight">Campus Voice</h1>
              <p className="text-[10px] text-slate-500 font-medium">
                {isStaff ? 'Staff Module' : isMod ? 'Moderator Desk' : 'Grievance Portal'}
              </p>
            </div>
          </div>
        )}

        {/* Close / Collapse Sidebar Button */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Close Sidebar'}
          aria-label={isCollapsed ? 'Expand Sidebar' : 'Close Sidebar'}
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5 text-purple-700" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-3'
              } rounded-xl transition-colors text-left font-medium text-sm group relative ${
                isActive
                  ? isMod
                    ? 'bg-amber-50 text-amber-800 font-bold'
                    : 'bg-purple-50 text-purple-700 font-bold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                    isActive
                      ? isMod ? 'text-amber-700' : 'text-purple-700'
                      : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                {!isCollapsed && (
                  <div className="truncate">
                    <span className="block truncate">{item.label}</span>
                  </div>
                )}
              </div>

              {/* Extra badges / pill when expanded */}
              {!isCollapsed && (
                <>
                  {item.hasPlusPill && (
                    <span className="w-5 h-5 rounded-full bg-purple-200 flex items-center justify-center text-purple-800 text-xs font-bold shrink-0">
                      <Plus className="w-3 h-3" />
                    </span>
                  )}

                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold shrink-0">
                      {item.badge}
                    </span>
                  )}
                </>
              )}

              {/* Badge dot when collapsed */}
              {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Logout Footer */}
      <div className="p-3 border-t border-slate-100">
        <button
          onClick={onLogoutClick}
          title={isCollapsed ? 'Log out' : undefined}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center p-2.5' : 'justify-between p-3'
          } bg-slate-50 hover:bg-slate-100 rounded-2xl transition-colors text-slate-700 text-xs font-semibold`}
        >
          <div className="flex items-center gap-2">
            <LogOut className="w-4 h-4 text-slate-400" />
            {!isCollapsed && <span>Log out</span>}
          </div>
          {!isCollapsed && <span className="text-[10px] text-slate-400">{isMod ? 'Moderator Session' : 'JWT Session'}</span>}
        </button>
      </div>
    </aside>
  </>
  );
};


