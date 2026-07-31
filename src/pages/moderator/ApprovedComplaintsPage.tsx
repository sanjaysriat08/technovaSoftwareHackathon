import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle2, Building2 } from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ModeratorDetailModal } from '../../components/moderator/ModeratorDetailModal';

interface ApprovedComplaintsPageProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ApprovedComplaintsPage: React.FC<ApprovedComplaintsPageProps> = ({ addToast }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchApproved = async () => {
    try {
      setIsLoading(true);
      const list = await api.getApprovedComplaints();
      setComplaints(list);
    } catch (err) {
      addToast('error', 'Failed to load approved complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApproved();
  }, []);

  const departments = Array.from(new Set(complaints.map((c) => c.department)));

  const filtered = complaints.filter((item) => {
    const matchesSearch =
      item.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept = selectedDept === 'All' || item.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Moderated Records</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Approved Complaints
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          All student grievances verified by moderator and routed to active department resolution.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search approved complaints..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-purple-600"
          />
        </div>

        {departments.length > 0 && (
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Complaint ID</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Updated Date</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No approved complaints match your search.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-purple-700">{item.complaintId}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800 max-w-xs truncate">{item.subject}</td>
                    <td className="py-4 px-6 text-slate-600">Arjun Kumar</td>
                    <td className="py-4 px-6 font-medium text-slate-600">{item.department}</td>
                    <td className="py-4 px-6">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-400">{item.lastUpdated}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => {
                          setSelectedComplaint(item);
                          setIsModalOpen(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ModeratorDetailModal
        complaint={selectedComplaint}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedComplaint(null);
        }}
        onApprove={async () => {}}
        onReject={async () => {}}
      />
    </div>
  );
};
