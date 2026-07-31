import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Search,
  Calendar,
  Building2,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';

interface WorkHistoryPageProps {
  onSelectComplaint: (id: string) => void;
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const WorkHistoryPage: React.FC<WorkHistoryPageProps> = ({
  onSelectComplaint,
  addToast,
}) => {
  const [historyList, setHistoryList] = useState<Complaint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const data = await api.getWorkHistory();
        setHistoryList(data || []);
      } catch (err) {
        console.error(err);
        addToast('error', 'Error', 'Failed to load work history.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const filtered = historyList.filter((item) => {
    const query = searchTerm.toLowerCase();
    return (
      item.complaintId.toLowerCase().includes(query) ||
      item.subject.toLowerCase().includes(query) ||
      item.department.toLowerCase().includes(query) ||
      (item.resolutionDetails?.summary || '').toLowerCase().includes(query)
    );
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Work History</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Archive of successfully investigated and resolved grievance tickets.
          </p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-full border border-emerald-100 w-fit">
          {filtered.length} Total Resolved
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-xs flex items-center justify-between gap-4">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search work history by ID, title, or summary..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-4 px-6">Ticket ID</th>
                <th className="py-4 px-6">Subject & Department</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6">Resolution Summary</th>
                <th className="py-4 px-6">Date Resolved</th>
                <th className="py-4 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-xs font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600 mb-2"></div>
                    <p>Loading work history...</p>
                  </td>
                </tr>
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    No resolved work records found.
                  </td>
                </tr>
              ) : (
                paginated.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => onSelectComplaint(item.complaintId)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-6 font-mono font-bold text-emerald-700">{item.complaintId}</td>
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800 max-w-xs truncate group-hover:text-emerald-700 transition-colors">
                        {item.subject}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-300" />
                        <span>{item.department}</span>
                      </p>
                    </td>
                    <td className="py-4 px-6 font-semibold text-slate-600">{item.category}</td>
                    <td className="py-4 px-6 max-w-xs">
                      <p className="text-slate-700 font-normal line-clamp-2">
                        {item.resolutionDetails?.summary || 'Resolved on-site.'}
                      </p>
                      {item.evidenceFiles && item.evidenceFiles.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md mt-1">
                          <FileText className="w-3 h-3 text-purple-600" />
                          <span>{item.evidenceFiles.length} Proof Image(s)</span>
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.resolutionDetails?.completionDate || item.lastUpdated}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectComplaint(item.complaintId);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 font-bold text-xs transition-colors flex items-center gap-1 inline-flex"
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

        {/* Pagination */}
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
    </div>
  );
};
