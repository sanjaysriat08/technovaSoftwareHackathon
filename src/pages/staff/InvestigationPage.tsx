import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Clock,
  User,
  Paperclip,
  CheckCircle2,
  MessageSquare,
  Upload,
  TrendingUp,
  Send,
  ClipboardCheck,
  FileText,
  AlertCircle,
  CheckCircle,
  Camera
} from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SolveComplaintModal } from '../../components/staff/SolveComplaintModal';

interface InvestigationPageProps {
  complaintId?: string;
  onBack: () => void;
  onNavigateTab: (tab: any, complaintId?: string) => void;
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const InvestigationPage: React.FC<InvestigationPageProps> = ({
  complaintId,
  onBack,
  onNavigateTab,
  addToast,
}) => {
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remarkText, setRemarkText] = useState('');
  const [isSubmittingRemark, setIsSubmittingRemark] = useState(false);
  const [isSolveModalOpen, setIsSolveModalOpen] = useState(false);

  const fetchComplaint = async () => {
    if (!complaintId) return;
    try {
      setIsLoading(true);
      const list = await api.getAssignedComplaints();
      const found = list.find((c) => c.complaintId === complaintId || c.id === complaintId);
      if (found) {
        setComplaint(found);
      } else {
        addToast('error', 'Not Found', 'Complaint record not found.');
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Error Loading Details', 'Failed to fetch complaint details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [complaintId]);

  const handleAccept = async () => {
    if (!complaint) return;
    try {
      const updated = await api.acceptAssignment(complaint.complaintId);
      if (updated.data) {
        setComplaint(updated.data);
      }
      addToast('success', 'Assignment Accepted', 'Status updated to In Progress.');
    } catch (err) {
      addToast('error', 'Error', 'Failed to accept assignment.');
    }
  };

  const handleAddRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkText.trim() || !complaint) return;
    try {
      setIsSubmittingRemark(true);
      await api.updateComplaintProgress(complaint.complaintId, {
        progressRemarks: remarkText
      });
      setRemarkText('');
      addToast('success', 'Remark Added', 'Investigation remark saved.');
      fetchComplaint();
    } catch (err) {
      addToast('error', 'Error', 'Failed to save remark.');
    } finally {
      setIsSubmittingRemark(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-3"></div>
        <p className="text-xs font-semibold">Loading complaint inspection data...</p>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="py-16 text-center space-y-4">
        <p className="text-sm font-semibold text-slate-600">No complaint selected for investigation.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold hover:bg-purple-800 transition-colors"
        >
          Back to List
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-purple-700 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned List</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {complaint.status !== 'In Progress' && complaint.status !== 'Resolved' && (
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <ClipboardCheck className="w-4 h-4" />
              <span>Accept Assignment</span>
            </button>
          )}

          {complaint.status !== 'Resolved' && (
            <button
              onClick={() => setIsSolveModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-colors flex items-center gap-2 shadow-sm"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Solve & Upload Image Proof</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Details Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-extrabold text-lg text-purple-700 bg-purple-50 px-3 py-1 rounded-xl border border-purple-100">
              {complaint.complaintId}
            </span>
            <StatusBadge status={complaint.status} />
            <span
              className={`px-3 py-1 rounded-xl text-xs font-bold ${
                complaint.priority === 'High'
                  ? 'bg-rose-100 text-rose-700'
                  : complaint.priority === 'Medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {complaint.priority} Priority
            </span>
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Submitted on <span className="font-bold text-slate-700">{complaint.submittedOn}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-extrabold text-slate-800">{complaint.subject}</h3>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 text-xs font-medium text-slate-500">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-purple-600" />
              <span>Department: <strong className="text-slate-800">{complaint.department}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-600" />
              <span>Location: <strong className="text-slate-800">{complaint.location || complaint.department}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              <span>Category: <strong className="text-slate-800">{complaint.category}</strong></span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Grievance Description</h4>
          <p className="text-xs text-slate-700 leading-relaxed font-normal whitespace-pre-wrap">
            {complaint.description}
          </p>
        </div>

        {/* Student Attachments if any */}
        {complaint.attachments && complaint.attachments.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Paperclip className="w-3.5 h-3.5" />
              <span>Complainant Attachments ({complaint.attachments.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {complaint.attachments.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-slate-50 hover:bg-purple-50/50 border border-slate-200 rounded-xl transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-700 truncate group-hover:text-purple-700">
                      {file.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">{file.size}</span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Staff Uploaded Evidence Proofs if any */}
        {complaint.evidenceFiles && complaint.evidenceFiles.length > 0 && (
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2 flex items-center gap-1">
              <Upload className="w-3.5 h-3.5 text-amber-600" />
              <span>Staff Uploaded Investigation Proofs ({complaint.evidenceFiles.length})</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {complaint.evidenceFiles.map((file) => (
                <a
                  key={file.id}
                  href={file.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 bg-amber-50/50 hover:bg-amber-100/50 border border-amber-200 rounded-xl transition-colors flex items-center justify-between group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-xs font-bold text-slate-800 truncate">{file.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0 ml-2">{file.size}</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Timeline & Remarks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Timeline Panel */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span>Investigation & Progress Timeline</span>
          </h3>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {complaint.timeline.map((stage) => (
              <div key={stage.id} className="relative group">
                {/* Node dot */}
                <div
                  className={`absolute -left-6 top-1 w-3 h-3 rounded-full border-2 bg-white ${
                    stage.status === 'completed'
                      ? 'border-emerald-600 bg-emerald-600'
                      : stage.status === 'in_progress'
                      ? 'border-amber-500 bg-amber-500'
                      : 'border-slate-300'
                  }`}
                />
                <div>
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-slate-800">{stage.title}</h5>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {stage.date} {stage.time}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 font-normal">{stage.description}</p>
                  {stage.actor && (
                    <span className="inline-block mt-1 text-[10px] text-purple-700 font-semibold bg-purple-50 px-2 py-0.5 rounded-md">
                      By: {stage.actor}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Remarks & Staff Log */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span>Inspection Remarks & Activity Log</span>
            </h3>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {complaint.remarks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No inspection remarks recorded yet.
                </div>
              ) : (
                complaint.remarks.map((rem) => (
                  <div
                    key={rem.id}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{rem.author} ({rem.role})</span>
                      <span className="text-[10px] text-slate-400 font-medium">{rem.timestamp}</span>
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-normal">{rem.text}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Remark Form */}
          <form onSubmit={handleAddRemark} className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <input
              type="text"
              placeholder="Add inspection note or on-site remark..."
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
            <button
              type="submit"
              disabled={isSubmittingRemark || !remarkText.trim()}
              className="px-4 py-2 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log</span>
            </button>
          </form>
        </div>

      </div>

      {/* Solve & Image Proof Modal */}
      <SolveComplaintModal
        isOpen={isSolveModalOpen}
        complaint={complaint}
        onClose={() => setIsSolveModalOpen(false)}
        onSuccess={fetchComplaint}
        addToast={addToast}
      />
    </div>
  );
};
