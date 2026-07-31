import React, { useState } from 'react';
import { Complaint } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import { Search, Filter, Eye, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';

interface MyComplaintsPageProps {
  complaints: Complaint[];
  onViewComplaint: (complaintId: string) => void;
}

export const MyComplaintsPage: React.FC<MyComplaintsPageProps> = ({ complaints, onViewComplaint }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter complaints
  const filtered = complaints.filter((c) => {
    const matchesSearch =
      c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.complaintId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.department.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || c.status.toLowerCase() === statusFilter.toLowerCase();
    const matchesDept = departmentFilter === 'All' || c.department.toLowerCase() === departmentFilter.toLowerCase();

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const departmentsList = Array.from(new Set(complaints.map((c) => c.department)));

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">My Complaints</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            View and manage all grievances you have submitted.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search complaint ID or subject..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 shadow-2xs"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 shadow-2xs cursor-pointer"
            >
              <option value="All">All Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>

            <select
              value={departmentFilter}
              onChange={(e) => {
                setDepartmentFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600/20 shadow-2xs cursor-pointer"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Complaints Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Complaint ID</th>
                <th className="py-4 px-6">Subject</th>
                <th className="py-4 px-6">Department</th>
                <th className="py-4 px-6">Priority</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Submitted On</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No complaints found matching criteria.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6 font-mono font-bold text-purple-700">{item.complaintId}</td>
                    <td className="py-4 px-6 font-semibold text-slate-800 max-w-xs truncate">{item.subject}</td>
                    <td className="py-4 px-6 text-slate-500">{item.department}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : item.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-400">{item.submittedOn}</td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => onViewComplaint(item.complaintId)}
                        className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs transition-colors inline-flex items-center gap-1.5"
                        title="View Details & Tracking"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Track</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing {paginated.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, filtered.length)} of {filtered.length} complaints
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentPage(idx + 1)}
                className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                  currentPage === idx + 1
                    ? 'bg-purple-700 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {idx + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
