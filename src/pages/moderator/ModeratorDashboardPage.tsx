import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Check,
  Eye,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  Building2,
  Wifi,
  Bus,
  BookOpen,
  UtensilsCrossed,
  ShieldAlert,
  Wrench
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Complaint, ModeratorStats } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ModeratorDetailModal } from '../../components/moderator/ModeratorDetailModal';

interface ModeratorDashboardPageProps {
  onNavigateTab: (tab: any) => void;
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ModeratorDashboardPage: React.FC<ModeratorDashboardPageProps> = ({
  onNavigateTab,
  addToast,
}) => {
  const [stats, setStats] = useState<ModeratorStats>({
    totalComplaints: 0,
    pendingApprovals: 0,
    approvedToday: 0,
    rejectedToday: 0,
    resolvedThisMonth: 0,
  });
  const [pendingApprovals, setPendingApprovals] = useState<Complaint[]>([]);
  const [recentActivity, setRecentActivity] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await api.getModeratorDashboard();
      if (data) {
        setStats(data.stats);
        setPendingApprovals(data.pendingApprovals || []);
        setRecentActivity(data.recentActivity || []);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Error Loading Moderator Dashboard', 'Failed to fetch moderation statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const totalCount = stats.totalComplaints ?? recentActivity.length;
  const approvedCount = stats.approvedToday ?? recentActivity.filter(c => c.status === 'In Progress' || c.status === 'Resolved').length;
  const rejectedCount = stats.rejectedToday ?? recentActivity.filter(c => c.status === 'Rejected').length;
  const pendingCount = stats.pendingApprovals ?? recentActivity.filter(c => c.status === 'Submitted' || c.status === 'Under Review').length;
  const resolvedCount = stats.resolvedThisMonth ?? recentActivity.filter(c => c.status === 'Resolved').length;

  const approvedPct = totalCount > 0 ? ((approvedCount / totalCount) * 100).toFixed(1) : '0';
  const rejectedPct = totalCount > 0 ? ((rejectedCount / totalCount) * 100).toFixed(1) : '0';
  const pendingPct = totalCount > 0 ? ((pendingCount / totalCount) * 100).toFixed(1) : '0';

  // Dynamic Top Departments
  const topDepartments = React.useMemo(() => {
    if (recentActivity.length === 0) return [];
    const deptMap: Record<string, number> = {};
    recentActivity.forEach((c) => {
      if (c.department) {
        deptMap[c.department] = (deptMap[c.department] || 0) + 1;
      }
    });

    const icons = [
      { color: 'bg-purple-600', icon: Wifi, iconBg: 'bg-purple-100 text-purple-700' },
      { color: 'bg-emerald-500', icon: Wrench, iconBg: 'bg-emerald-100 text-emerald-700' },
      { color: 'bg-amber-500', icon: Bus, iconBg: 'bg-amber-100 text-amber-700' },
      { color: 'bg-blue-500', icon: BookOpen, iconBg: 'bg-blue-100 text-blue-700' },
      { color: 'bg-pink-500', icon: UtensilsCrossed, iconBg: 'bg-pink-100 text-pink-700' },
    ];

    return Object.entries(deptMap)
      .map(([name, count], index) => {
        const style = icons[index % icons.length];
        const pct = totalCount > 0 ? ((count / totalCount) * 100).toFixed(1) : '0';
        return {
          name,
          count,
          percentage: `${pct}%`,
          color: style.color,
          icon: style.icon,
          iconBg: style.iconBg,
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [recentActivity, totalCount]);

  // Dynamic Priority Data
  const priorityData = React.useMemo(() => {
    const high = recentActivity.filter(c => c.priority === 'High').length;
    const med = recentActivity.filter(c => c.priority === 'Medium').length;
    const low = recentActivity.filter(c => c.priority === 'Low').length;
    const total = recentActivity.length;

    return [
      { name: 'High', value: high, percentage: total > 0 ? `${((high / total) * 100).toFixed(1)}%` : '0%', color: '#ef4444' },
      { name: 'Medium', value: med, percentage: total > 0 ? `${((med / total) * 100).toFixed(1)}%` : '0%', color: '#f59e0b' },
      { name: 'Low', value: low, percentage: total > 0 ? `${((low / total) * 100).toFixed(1)}%` : '0%', color: '#10b981' },
    ];
  }, [recentActivity]);

  // Dynamic Monthly Overview Chart Data
  const monthlyOverviewData = React.useMemo(() => {
    if (recentActivity.length === 0) {
      return [{ date: 'No Data', val: 0 }];
    }
    const dateMap: Record<string, number> = {};
    recentActivity.forEach((c) => {
      const dateKey = c.submittedOn || 'Today';
      dateMap[dateKey] = (dateMap[dateKey] || 0) + 1;
    });

    return Object.entries(dateMap).map(([date, val]) => ({ date, val }));
  }, [recentActivity]);

  // Sparkline data
  const sparkApproved = recentActivity.length > 0 ? [{ v: Math.round(approvedCount / 2) }, { v: approvedCount }] : [{ v: 0 }, { v: 0 }];
  const sparkRejected = recentActivity.length > 0 ? [{ v: Math.round(rejectedCount / 2) }, { v: rejectedCount }] : [{ v: 0 }, { v: 0 }];
  const sparkResolved = recentActivity.length > 0 ? [{ v: Math.round(resolvedCount / 2) }, { v: resolvedCount }] : [{ v: 0 }, { v: 0 }];
  const sparkTotal = recentActivity.length > 0 ? [{ v: Math.round(totalCount / 2) }, { v: totalCount }] : [{ v: 0 }, { v: 0 }];

  const handleApprove = async (id: string, remark?: string, department?: string) => {
    try {
      await api.approveComplaint(id, { remark, department });
      addToast('success', 'Complaint Approved', `Complaint ${id} verified and assigned.`);
      fetchData();
    } catch (err) {
      addToast('error', 'Approval Failed', 'Failed to approve complaint.');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await api.rejectComplaint(id, reason);
      addToast('info', 'Complaint Rejected', `Complaint ${id} rejected.`);
      fetchData();
    } catch (err) {
      addToast('error', 'Rejection Failed', 'Failed to reject complaint.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Welcome Banner Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Welcome back, Moderator! 👋
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Here's what's happening in your portal today.
        </p>
      </div>

      {/* 4 Metric Cards with Sparkline Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Approved Today */}
        <div
          onClick={() => onNavigateTab('mod-approved')}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Approved Today</span>
              <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 mt-2 font-mono">{approvedCount}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Complaints approved</p>
          </div>
          <div className="h-10 mt-3 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkApproved}>
                <Line type="monotone" dataKey="v" stroke="#7c3aed" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rejected Today */}
        <div
          onClick={() => onNavigateTab('mod-rejected')}
          className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Rejected Today</span>
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <XCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 mt-2 font-mono">{rejectedCount}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Complaints rejected</p>
          </div>
          <div className="h-10 mt-3 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkRejected}>
                <Line type="monotone" dataKey="v" stroke="#ea580c" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Resolved (This Month) */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Resolved (This Month)</span>
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 mt-2 font-mono">{resolvedCount}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Successfully resolved</p>
          </div>
          <div className="h-10 mt-3 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkResolved}>
                <Line type="monotone" dataKey="v" stroke="#2563eb" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Total Complaints */}
        <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Total Complaints</span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-slate-800 mt-2 font-mono">{totalCount}</p>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">All time complaints</p>
          </div>
          <div className="h-10 mt-3 -mx-2 -mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkTotal}>
                <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Middle Grid: Area Chart Overview & Top Departments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Panel (2 cols): Complaints Overview */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-xs p-6 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-800">Complaints Overview <span className="text-slate-400 font-normal">(Real-time Analytics)</span></h3>
            </div>
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-200">
              <span>All Records</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center pt-4">
            {/* Area Chart */}
            <div className="md:col-span-3 h-56">
              {recentActivity.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs font-medium border border-dashed border-slate-200 rounded-2xl p-4">
                  <span>No grievance analytics yet.</span>
                  <span className="text-[11px] text-slate-400 mt-1">Analytics will update automatically as new grievances are logged.</span>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyOverviewData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '11px', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="val" stroke="#7c3aed" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Metrics List Panel */}
            <div className="md:col-span-1 space-y-4 border-l border-slate-100 md:pl-6">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Complaints</span>
                <span className="text-xl font-extrabold text-slate-800 font-mono">{totalCount}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Approved</span>
                <span className="text-sm font-bold text-emerald-600">{approvedCount} <span className="text-[11px] font-medium">({approvedPct}%)</span></span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Rejected</span>
                <span className="text-sm font-bold text-rose-600">{rejectedCount} <span className="text-[11px] font-medium">({rejectedPct}%)</span></span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Pending</span>
                <span className="text-sm font-bold text-purple-600">{pendingCount} <span className="text-[11px] font-medium">({pendingPct}%)</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (1 col): Top Departments */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-5 flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-800">Top Departments <span className="text-slate-400 font-normal text-xs">(By Complaints)</span></h3>
          </div>

          <div className="space-y-4">
            {topDepartments.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-medium">
                No department grievance records found.
              </div>
            ) : (
              topDepartments.map((dept) => {
                const IconComponent = dept.icon;
                return (
                  <div key={dept.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 font-bold text-slate-700">
                        <div className={`w-7 h-7 rounded-xl ${dept.iconBg} flex items-center justify-center shrink-0`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <span>{dept.name}</span>
                      </div>
                      <span className="font-semibold text-slate-600 font-mono">{dept.count} <span className="text-slate-400 text-[10px]">({dept.percentage})</span></span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className={`h-full rounded-full ${dept.color}`} style={{ width: dept.percentage }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Priority Overview Section with Donut Chart */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 space-y-4">
        <h3 className="text-sm font-bold text-slate-800">Priority Breakdown</h3>

        {totalCount === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-medium border border-dashed border-slate-200 rounded-2xl">
            No active grievances to classify by priority.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-8 justify-start">
            {/* Donut Chart */}
            <div className="w-48 h-48 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend Table */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-x-12 gap-y-3">
              {priorityData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <div>
                    <span className="text-xs font-bold text-slate-700">{item.name}</span>
                    <p className="text-xs font-mono font-semibold text-slate-500">{item.value} <span className="text-[10px] text-slate-400">({item.percentage})</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Pending Triage Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Pending Student Complaints Queue</h3>
            <p className="text-xs text-slate-500 font-medium">Verify grievances before assigning to department resolution</p>
          </div>
          <button
            onClick={() => onNavigateTab('mod-pending')}
            className="text-xs font-bold text-purple-700 hover:text-purple-800 flex items-center gap-1"
          >
            <span>View Full Queue ({pendingCount})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3.5 px-6">ID</th>
                <th className="py-3.5 px-6">Subject</th>
                <th className="py-3.5 px-6">Category</th>
                <th className="py-3.5 px-6">Priority</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {pendingApprovals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No pending complaints in queue.
                  </td>
                </tr>
              ) : (
                pendingApprovals.slice(0, 5).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-6 font-mono font-bold text-purple-700">{item.complaintId}</td>
                    <td className="py-3.5 px-6 font-semibold text-slate-800 max-w-xs truncate">{item.subject}</td>
                    <td className="py-3.5 px-6 text-slate-500">{item.category}</td>
                    <td className="py-3.5 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : item.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedComplaint(item);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Review & Route</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Moderator Action / Detail Modal */}
      <ModeratorDetailModal
        complaint={selectedComplaint}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaint(null);
        }}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
};
