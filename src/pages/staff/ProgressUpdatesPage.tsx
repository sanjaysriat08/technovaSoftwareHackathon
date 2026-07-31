import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Send,
  Building2,
  FileText
} from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';

interface ProgressUpdatesPageProps {
  preselectedComplaintId?: string;
  onNavigateTab: (tab: any, complaintId?: string) => void;
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ProgressUpdatesPage: React.FC<ProgressUpdatesPageProps> = ({
  preselectedComplaintId,
  onNavigateTab,
  addToast,
}) => {
  const [assignedList, setAssignedList] = useState<Complaint[]>([]);
  const [selectedId, setSelectedId] = useState<string>(preselectedComplaintId || '');
  const [status, setStatus] = useState<string>('In Progress');
  const [progressRemarks, setProgressRemarks] = useState('');
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAssigned = async () => {
      try {
        setIsLoading(true);
        const list = await api.getAssignedComplaints();
        const activeOnly = list.filter((c) => c.status !== 'Resolved');
        setAssignedList(activeOnly);

        if (preselectedComplaintId) {
          setSelectedId(preselectedComplaintId);
        } else if (activeOnly.length > 0) {
          setSelectedId(activeOnly[0].complaintId);
        }
      } catch (err) {
        console.error(err);
        addToast('error', 'Error', 'Failed to load assigned complaints.');
      } finally {
        setIsLoading(false);
      }
    };
    loadAssigned();
  }, [preselectedComplaintId]);

  const selectedComplaint = assignedList.find(
    (c) => c.complaintId === selectedId || c.id === selectedId
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      addToast('error', 'Validation Error', 'Please select a complaint ticket.');
      return;
    }
    if (!progressRemarks.trim()) {
      addToast('error', 'Validation Error', 'Please enter progress update remarks.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.updateComplaintProgress(selectedId, {
        status,
        progressRemarks,
        estimatedCompletionDate
      });

      addToast('success', 'Progress Updated', `Status for ${selectedId} updated successfully.`);
      setProgressRemarks('');
      onNavigateTab('staff-investigation', selectedId);
    } catch (err) {
      console.error(err);
      addToast('error', 'Update Failed', 'An error occurred while updating complaint progress.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Update Progress</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Log repair progress, field updates, and estimated completion times for assigned tickets.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 md:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Select Complaint Ticket */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Complaint Ticket <span className="text-rose-500">*</span>
            </label>
            {isLoading ? (
              <div className="p-3 bg-slate-50 text-xs text-slate-400 rounded-xl">Loading tickets...</div>
            ) : assignedList.length === 0 ? (
              <div className="p-4 bg-amber-50 text-amber-800 text-xs font-medium rounded-2xl border border-amber-200">
                No active in-progress complaints found to update.
              </div>
            ) : (
              <select
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
              >
                {assignedList.map((item) => (
                  <option key={item.id} value={item.complaintId}>
                    {item.complaintId} — {item.subject} ({item.department})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ticket Summary Box */}
          {selectedComplaint && (
            <div className="bg-purple-50/50 rounded-2xl p-4 border border-purple-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{selectedComplaint.subject}</span>
                <span className="text-purple-700 font-mono">{selectedComplaint.complaintId}</span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 text-[11px] text-slate-500 font-medium">
                <span>Location: {selectedComplaint.location || selectedComplaint.department}</span>
                <span>Priority: <strong className="text-slate-700">{selectedComplaint.priority}</strong></span>
                <span>Current Status: <strong className="text-purple-700">{selectedComplaint.status}</strong></span>
              </div>
            </div>
          )}

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Status Option */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Updated Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-800 focus:outline-none"
              >
                <option value="In Progress">In Progress</option>
                <option value="Under Review">Under Review / On Hold</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {/* Estimated Completion Date */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Estimated Completion Date / Time
              </label>
              <input
                type="text"
                placeholder="e.g. Today, 4:00 PM or 02 Aug 2026"
                value={estimatedCompletionDate}
                onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Progress Remarks */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Work Performed / Progress Update <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Describe actions taken, replaced materials, technician findings, or reasons for delay..."
              value={progressRemarks}
              onChange={(e) => setProgressRemarks(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigateTab('staff-dashboard')}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !selectedId || !progressRemarks.trim()}
              className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'Updating...' : 'Submit Progress Update'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
