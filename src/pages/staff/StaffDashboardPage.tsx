import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  RotateCcw,
  MapPin,
  Calendar,
  ChevronRight,
  Upload,
  TrendingUp,
  CheckCircle,
  FileText,
  Utensils,
  Zap,
  Droplets,
  Armchair,
  Trash2,
  Wrench,
  Wifi,
  Bus,
  BookOpen
} from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { Complaint, StaffStats } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';

interface StaffDashboardPageProps {
  onNavigateTab: (tab: any, complaintId?: string) => void;
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const StaffDashboardPage: React.FC<StaffDashboardPageProps> = ({
  onNavigateTab,
  addToast,
}) => {
  const [stats, setStats] = useState<StaffStats>({
    assignedComplaints: 8,
    inProgress: 3,
    resolvedToday: 18,
    pendingUpdates: 1,
    reopenedCount: 1,
    totalAssigned: 30
  });
  const [recentAssignments, setRecentAssignments] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getStaffDashboard();
      if (data) {
        setStats(data.stats);
        setRecentAssignments(data.recentAssignments || []);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Error Loading Dashboard', 'Failed to fetch staff statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Category Icon helper
  const getCategoryIcon = (category: string, index: number) => {
    const catLower = category?.toLowerCase() || '';
    if (catLower.includes('canteen') || catLower.includes('food') || catLower.includes('hygiene')) {
      return { icon: Utensils, bg: 'bg-indigo-100 text-indigo-600' };
    }
    if (catLower.includes('electric') || catLower.includes('power') || catLower.includes('socket')) {
      return { icon: Zap, bg: 'bg-amber-100 text-amber-600' };
    }
    if (catLower.includes('water') || catLower.includes('leakage') || catLower.includes('plumbing')) {
      return { icon: Droplets, bg: 'bg-emerald-100 text-emerald-600' };
    }
    if (catLower.includes('bench') || catLower.includes('furniture') || catLower.includes('carpentry')) {
      return { icon: Armchair, bg: 'bg-purple-100 text-purple-600' };
    }
    if (catLower.includes('garbage') || catLower.includes('waste') || catLower.includes('cleaning')) {
      return { icon: Trash2, bg: 'bg-rose-100 text-rose-600' };
    }
    if (catLower.includes('wifi') || catLower.includes('network') || catLower.includes('internet')) {
      return { icon: Wifi, bg: 'bg-blue-100 text-blue-600' };
    }
    const icons = [
      { icon: Wrench, bg: 'bg-purple-100 text-purple-600' },
      { icon: BookOpen, bg: 'bg-blue-100 text-blue-600' },
      { icon: Bus, bg: 'bg-amber-100 text-amber-600' }
    ];
    return icons[index % icons.length];
  };

  const assignedCount = stats.assignedComplaints ?? 8;
  const inProgressCount = stats.inProgress ?? 3;
  const completedCount = stats.resolvedToday ?? 18;
  const reopenedCount = stats.reopenedCount ?? 1;
  const totalCount = stats.totalAssigned ?? (assignedCount + inProgressCount + completedCount + reopenedCount);

  // Status donut data
  const statusPieData = [
    { name: 'Assigned', value: assignedCount, color: '#8b5cf6' },
    { name: 'In Progress', value: inProgressCount, color: '#f59e0b' },
    { name: 'Completed', value: completedCount, color: '#10b981' },
    { name: 'Reopened', value: reopenedCount, color: '#ef4444' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Page Title Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Dashboard</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Overview of complaints assigned to you and their progress.
        </p>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Assigned */}
        <div
          onClick={() => onNavigateTab('staff-assigned')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">Assigned</span>
            <p className="text-3xl font-extrabold text-slate-800 mt-1 font-mono">{String(assignedCount).padStart(2, '0')}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Total assigned complaints</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ClipboardList className="w-6 h-6" />
          </div>
        </div>

        {/* Card 2: In Progress */}
        <div
          onClick={() => onNavigateTab('staff-assigned')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">In Progress</span>
            <p className="text-3xl font-extrabold text-amber-600 mt-1 font-mono">{String(inProgressCount).padStart(2, '0')}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Currently in progress</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Card 3: Completed */}
        <div
          onClick={() => onNavigateTab('staff-history')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">Completed</span>
            <p className="text-3xl font-extrabold text-emerald-600 mt-1 font-mono">{String(completedCount).padStart(2, '0')}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Successfully resolved</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Card 4: Reopened */}
        <div
          onClick={() => onNavigateTab('staff-assigned')}
          className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between group"
        >
          <div>
            <span className="text-xs font-semibold text-slate-500">Reopened</span>
            <p className="text-3xl font-extrabold text-rose-600 mt-1 font-mono">{String(reopenedCount).padStart(2, '0')}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-1">Reopened complaints</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <RotateCcw className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel (2 Cols): Recent Assignments List */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Recent Assignments</h3>
            <button
              onClick={() => onNavigateTab('staff-assigned')}
              className="text-xs font-bold text-purple-700 hover:text-purple-800 transition-colors"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentAssignments.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl">
                No active assigned complaints found.
              </div>
            ) : (
              recentAssignments.map((item, idx) => {
                const iconInfo = getCategoryIcon(item.category || item.subject, idx);
                const CategoryIcon = iconInfo.icon;

                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigateTab('staff-investigation', item.complaintId)}
                    className="p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-100 transition-all cursor-pointer flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div className={`w-11 h-11 rounded-2xl ${iconInfo.bg} flex items-center justify-center shrink-0`}>
                        <CategoryIcon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-slate-800">{item.complaintId}</span>
                        </div>
                        <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{item.subject}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-medium mt-1">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400" />
                            <span>{item.location || item.department}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            <span>{item.submittedOn ? `Assigned ${item.submittedOn}` : 'Assigned recently'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <StatusBadge status={item.status} />
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Panel (1 Col): Status Overview Donut & Quick Actions */}
        <div className="space-y-6">
          {/* Status Overview Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-800">Status Overview</h3>

            <div className="flex items-center gap-4">
              {/* Donut Chart */}
              <div className="w-32 h-32 relative shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={36}
                      outerRadius={56}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-lg font-extrabold text-slate-800 font-mono leading-none">{totalCount}</span>
                  <span className="text-[9px] text-slate-400 font-medium">Total</span>
                </div>
              </div>

              {/* Status Legend */}
              <div className="flex-1 space-y-2 text-xs">
                {statusPieData.map((item) => {
                  const pct = totalCount > 0 ? ((item.value / totalCount) * 100).toFixed(1) : '0';
                  return (
                    <div key={item.name} className="flex items-center justify-between text-slate-600">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                        <span className="font-semibold text-slate-700">{item.name}</span>
                      </div>
                      <span className="font-mono font-bold text-slate-800">
                        {item.value} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-3">
            <h3 className="text-sm font-bold text-slate-800">Quick Actions</h3>

            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateTab('staff-assigned')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-purple-50/60 border border-slate-100 transition-colors flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                    <ClipboardList className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Assigned Complaints</p>
                    <p className="text-[10px] text-slate-400 font-medium">Inspect, solve & upload image proof</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab('staff-history')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-100 transition-colors flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Work History</p>
                    <p className="text-[10px] text-slate-400 font-medium">Review past resolved grievances</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>

              <button
                onClick={() => onNavigateTab('staff-notifications')}
                className="w-full p-3.5 rounded-2xl bg-slate-50 hover:bg-amber-50/60 border border-slate-100 transition-colors flex items-center justify-between group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Notifications</p>
                    <p className="text-[10px] text-slate-400 font-medium">View new assignment alerts</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
