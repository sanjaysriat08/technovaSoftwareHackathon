import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  CheckCircle,
  Clock,
  Send,
  Building2,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';

interface ResolutionPageProps {
  preselectedComplaintId?: string;
  onNavigateTab: (tab: any, complaintId?: string) => void;
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ResolutionPage: React.FC<ResolutionPageProps> = ({
  preselectedComplaintId,
  onNavigateTab,
  addToast,
}) => {
  const [assignedList, setAssignedList] = useState<Complaint[]>([]);
  const [selectedId, setSelectedId] = useState<string>(preselectedComplaintId || '');
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [finalRemarks, setFinalRemarks] = useState('');
  const [completionDate, setCompletionDate] = useState(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAssigned = async () => {
      try {
        setIsLoading(true);
        const list = await api.getAssignedComplaints();
        const pendingResolution = list.filter((c) => c.status !== 'Resolved');
        setAssignedList(pendingResolution);

        if (preselectedComplaintId) {
          setSelectedId(preselectedComplaintId);
        } else if (pendingResolution.length > 0) {
          setSelectedId(pendingResolution[0].complaintId);
        }
      } catch (err) {
        console.error(err);
        addToast('error', 'Error', 'Failed to load complaints.');
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
    if (!resolutionSummary.trim()) {
      addToast('error', 'Validation Error', 'Please provide a resolution summary.');
      return;
    }
    if (!actionsTaken.trim()) {
      addToast('error', 'Validation Error', 'Please specify the corrective actions taken.');
      return;
    }

    try {
      setIsSubmitting(true);
      await api.submitResolution(selectedId, {
        resolutionSummary,
        actionsTaken,
        finalRemarks,
        completionDate
      });

      addToast('success', 'Complaint Resolved', `Complaint ${selectedId} marked as successfully resolved!`);
      onNavigateTab('staff-history');
    } catch (err) {
      console.error(err);
      addToast('error', 'Resolution Failed', 'Failed to submit grievance resolution.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Submit Resolution</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Mark grievance tickets as resolved with detailed technical findings and audit notes.
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
              <div className="p-4 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-2xl border border-emerald-200">
                All assigned complaints are currently resolved!
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

          {/* Ticket Context Box */}
          {selectedComplaint && (
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-1">
              <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                <span>{selectedComplaint.subject}</span>
                <span className="text-purple-700 font-mono">{selectedComplaint.complaintId}</span>
              </div>
              <p className="text-xs text-slate-600 font-normal line-clamp-2">{selectedComplaint.description}</p>
            </div>
          )}

          {/* Resolution Summary */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Resolution Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Replaced faulty circuit breaker and restored power supply."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
          </div>

          {/* Actions Taken */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Actions Taken / Corrective Steps <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Detail specific physical repairs, replaced components, vendor calls, or preventive maintenance performed..."
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
          </div>

          {/* Final Remarks & Completion Date Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Final Remarks / Preventive Note
              </label>
              <input
                type="text"
                placeholder="e.g. Recommended monthly voltage check."
                value={finalRemarks}
                onChange={(e) => setFinalRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Completion Date
              </label>
              <input
                type="text"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Submit */}
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
              disabled={isSubmitting || !selectedId || !resolutionSummary.trim() || !actionsTaken.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Resolving...' : 'Complete & Resolve Ticket'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
