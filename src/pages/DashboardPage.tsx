import React from 'react';
import { Complaint, ComplaintStats } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { FileText, Clock, CheckCircle2, XCircle, Plus, HelpCircle, ArrowRight, FileSignature } from 'lucide-react';

interface DashboardPageProps {
  stats: ComplaintStats;
  recentComplaints: Complaint[];
  onRaiseNewClick: () => void;
  onViewAllClick: () => void;
  onTrackComplaint: (complaintId: string) => void;
  onOpenHelpModal: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  recentComplaints,
  onRaiseNewClick,
  onViewAllClick,
  onTrackComplaint,
  onOpenHelpModal,
}) => {
  return (
    <div className="p-8 space-y-6 animate-in fade-in duration-200">
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Filed */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Filed</p>
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">In Progress</p>
            <p className="text-2xl font-bold text-slate-900">{stats.inProgress}</p>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-green-100 text-green-700 rounded-2xl flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Resolved</p>
            <p className="text-2xl font-bold text-slate-900">{stats.resolved}</p>
          </div>
        </div>

        {/* Raise Grievance Callout Card */}
        <div
          onClick={onRaiseNewClick}
          className="bg-purple-700 p-5 rounded-3xl shadow-lg shadow-purple-200/50 flex flex-col justify-between cursor-pointer hover:bg-purple-800 transition-all text-white min-h-[96px]"
        >
          <p className="text-white font-medium text-xs">Need help?</p>
          <div className="flex items-center justify-between">
            <p className="text-white text-xs font-bold">Raise a new complaint</p>
            <ArrowRight className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Complaints Table + Action Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Complaints Table (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-bold text-slate-800 text-base">Recent Complaints</h2>
            <button
              onClick={onViewAllClick}
              className="text-xs font-bold text-purple-700 hover:underline flex items-center gap-1"
            >
              View All Records
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-slate-400 font-bold bg-slate-50">
                  <th className="px-6 py-4">Complaint ID</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-slate-50">
                {recentComplaints.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-400">
                      No complaints registered yet.
                    </td>
                  </tr>
                ) : (
                  recentComplaints.slice(0, 5).map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-purple-700">
                        {item.complaintId}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 max-w-[200px] truncate">
                        {item.subject}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{item.department}</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={item.status} size="sm" />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onTrackComplaint(item.complaintId)}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-semibold transition-colors"
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Action Cards Column (1 Col) */}
        <div className="space-y-4">
          <div
            onClick={onRaiseNewClick}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center group cursor-pointer hover:border-purple-200 transition-all"
          >
            <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-700 mb-3 group-hover:scale-110 transition-transform">
              <Plus className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Submit New Grievance</h3>
            <p className="text-xs text-slate-500 mt-0.5">Attach documents, photos and categorize issues</p>
          </div>

          <div
            onClick={onOpenHelpModal}
            className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-center items-center text-center group cursor-pointer hover:border-purple-200 transition-all"
          >
            <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3 group-hover:scale-110 transition-transform">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-sm">Contact Support Desk</h3>
            <p className="text-xs text-slate-500 mt-0.5">Reach out directly to campus grievance officers</p>
          </div>
        </div>
      </div>
    </div>
  );
};
