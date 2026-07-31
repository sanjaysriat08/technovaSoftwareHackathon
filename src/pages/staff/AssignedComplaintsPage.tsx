import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Building2,
  Calendar,
  CheckCircle
} from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SolveComplaintModal } from '../../components/staff/SolveComplaintModal';

interface AssignedComplaintsPageProps {
  onSelectComplaint: (id: string) => void;
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const AssignedComplaintsPage: React.FC<AssignedComplaintsPageProps> = ({
  onSelectComplaint,
  addToast,
}) => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [solvingComplaint, setSolvingComplaint] = useState<Complaint | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchAssigned = async () => {
    try {
      setIsLoading(true);
      const list = await api.getAssignedComplaints();
      setComplaints(list || []);
    } catch (err) {
      console.error(err);
      addToast('error', 'Error Loading Complaints', 'Failed to fetch assigned complaints list.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssigned();
  }, []);

  const handleAcceptAssignment = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.acceptAssignment(id);
      addToast('success', 'Assignment Accepted', `Complaint ${id} status set to In Progress.`);
      fetchAssigned();
    } catch (err) {
      addToast('error', 'Error', 'Failed to accept assignment.');
    }
  };

  // Filtered complaints
  const filtered = complaints.filter((item) => {
    const matchesSearch =
      item.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || item.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesPriority = priorityFilter === 'all' || item.priority.toLowerCase() === priorityFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Assigned Complaints</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            View, inspect, and manage grievance tickets assigned for technical resolution.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-purple-50 text-purple-700 font-bold text-xs rounded-full border border-purple-100">
            {filtered.length} Total Tickets
          </span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Field */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by ID, title, or category..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 transition-all"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="under review">Under Review / Submitted</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-xl px-3 py-2 text-slate-700 focus:outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Complaint ID</th>
                <th className="py-4 px-6">Title & Department</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Assigned Date</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-700 mb-2"></div>
                    <p>Loading assigned complaints...</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No complaints match your search criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectComplaint(item.complaintId)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-purple-700">{item.complaintId}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800 max-w-xs truncate group-hover:text-purple-700 transition-colors">
                        {item.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-300" />
                        <span>{item.department}</span>
                      </p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{item.category}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : item.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.submittedOn || 'Today'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={item.status} />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {item.status !== 'In Progress' && item.status !== 'Resolved' && (
                          <button
                            onClick={(e) => handleAcceptAssignment(item.complaintId, e)}
                            className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                            title="Accept task assignment"
                          >
                            <ClipboardCheck className="w-3.5 h-3.5" />
                            <span>Accept</span>
                          </button>
                        )}

                        {item.status !== 'Resolved' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSolvingComplaint(item);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1 shadow-xs"
                            title="Solve complaint and upload image proof"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Solve & Proof</span>
                          </button>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectComplaint(item.complaintId);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-purple-50 hover:text-purple-700 font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {!isLoading && filtered.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {Math.min((currentPage - 1) * itemsPerPage + 1, filtered.length)} to{' '}
              {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} entries
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-slate-600" />
              </button>
              <span className="font-bold text-slate-700 font-mono px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                className="p-2 rounded-xl bg-slate-50 border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors"
              >
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Solve & Evidence Proof Modal */}
      <SolveComplaintModal
        isOpen={!!solvingComplaint}
        complaint={solvingComplaint}
        onClose={() => setSolvingComplaint(null)}
        onSuccess={fetchAssigned}
        addToast={addToast}
      />
    </div>
  );
};
