import React, { useState, useEffect } from 'react';
import { Search, Eye, XCircle, AlertCircle } from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ModeratorDetailModal } from '../../components/moderator/ModeratorDetailModal';

interface RejectedComplaintsPageProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const RejectedComplaintsPage: React.FC<RejectedComplaintsPageProps> = ({ addToast }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRejected = async () => {
    try {
      setIsLoading(true);
      const list = await api.getRejectedComplaints();
      setComplaints(list);
    } catch (err) {
      addToast('error', 'Failed to load rejected complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRejected();
  }, []);

  const filtered = complaints.filter((item) =>
    item.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
          <XCircle className="w-4 h-4" />
          <span>Declined Requests</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Rejected Complaints
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Grievances declined during moderator verification with justification logs.
        </p>
      </div>

      {/* Search Input */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rejected complaints..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-purple-600"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Complaint ID</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Reason / Remarks</th>
                <th className="py-4 px-6">Rejected Date</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No rejected complaints recorded.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const lastRemark = item.remarks && item.remarks.length > 0 ? item.remarks[item.remarks.length - 1].text : 'Declined by moderator';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-purple-700">{item.complaintId}</td>
                      <td className="py-4 px-6 font-semibold text-slate-800 max-w-xs truncate">{item.subject}</td>
                      <td className="py-4 px-6 text-slate-600">Arjun Kumar</td>
                      <td className="py-4 px-6 text-slate-500 max-w-xs truncate font-mono text-[11px]">{lastRemark}</td>
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
                  );
                })
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
