import React, { useState, useEffect } from 'react';
import { Search, Filter, Eye, CheckCircle2, XCircle, ShieldAlert, Clock, ArrowUpDown } from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';
import { ModeratorDetailModal } from '../../components/moderator/ModeratorDetailModal';

interface PendingApprovalsPageProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const PendingApprovalsPage: React.FC<PendingApprovalsPageProps> = ({ addToast }) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPending = async () => {
    try {
      setIsLoading(true);
      const list = await api.getPendingApprovals();
      setComplaints(list);
    } catch (err) {
      addToast('error', 'Failed to load pending approvals');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (id: string, remark?: string, department?: string) => {
    try {
      await api.approveComplaint(id, { remark, department });
      addToast('success', 'Complaint Approved', `Complaint ${id} verified and assigned.`);
      fetchPending();
    } catch (err) {
      addToast('error', 'Failed to approve complaint');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    try {
      await api.rejectComplaint(id, reason);
      addToast('info', 'Complaint Rejected', `Complaint ${id} has been rejected.`);
      fetchPending();
    } catch (err) {
      addToast('error', 'Failed to reject complaint');
    }
  };

  // Filter & Search Logic
  const filtered = complaints.filter((item) => {
    const matchesSearch =
      item.complaintId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPriority = selectedPriority === 'All' || item.priority === selectedPriority;
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    return matchesSearch && matchesPriority && matchesCategory;
  });

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const categories = Array.from(new Set(complaints.map((c) => c.category)));

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header Title */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">
          <Clock className="w-4 h-4" />
          <span>Queue Management</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">
          Pending Approvals
        </h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Review and approve newly logged student complaints before forwarding to department heads.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by ID, subject, category..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:border-purple-600"
          />
        </div>

        {/* Priority & Category Dropdowns */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
            >
              <option value="All">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          {categories.length > 0 && (
            <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-2xl border border-slate-100">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none"
              >
                <option value="All">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Complaint ID</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Student</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Date</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No pending complaints in the approval queue.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-purple-700">{item.complaintId}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800">{item.category}</td>
                    <td className="py-4 px-6 text-slate-600">
                      <div>
                        <span className="font-bold text-slate-800 block">Arjun Kumar</span>
                        <span className="text-[10px] text-slate-400">22BIT045</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
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
                    <td className="py-4 px-6 text-slate-400">{item.submittedOn}</td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedComplaint(item);
                            setIsModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View & Triage</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {paginated.length} of {filtered.length} pending complaints
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-semibold"
              >
                Previous
              </button>
              <span className="font-bold text-slate-700">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                className="px-3 py-1 rounded-xl border border-slate-200 disabled:opacity-40 hover:bg-slate-50 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
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
