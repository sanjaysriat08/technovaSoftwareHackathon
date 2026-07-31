import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Clock, ShieldCheck, User, Paperclip, MessageSquare, AlertCircle, Building2 } from 'lucide-react';
import { Complaint } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ModeratorDetailModalProps {
  complaint: Complaint | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (complaintId: string, remark?: string, department?: string) => Promise<void>;
  onReject: (complaintId: string, reason: string) => Promise<void>;
}

export const ModeratorDetailModal: React.FC<ModeratorDetailModalProps> = ({
  complaint,
  isOpen,
  onClose,
  onApprove,
  onReject,
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'approve' | 'reject'>('details');
  const [remarkText, setRemarkText] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !complaint) return null;

  const departments = [
    'Network / Wi-Fi',
    'Hostel / Estate',
    'Library / Audio Visual',
    'Academic Affairs',
    'Canteen / Dining',
    'Transport',
    'Maintenance / Electrical'
  ];

  const handleApproveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onApprove(complaint.complaintId, remarkText, selectedDept || complaint.department);
      setActiveTab('details');
      setRemarkText('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectionReason.trim()) return;
    setIsSubmitting(true);
    try {
      await onReject(complaint.complaintId, rejectionReason);
      setActiveTab('details');
      setRejectionReason('');
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-purple-700">{complaint.complaintId}</span>
                <StatusBadge status={complaint.status} size="sm" />
              </div>
              <h3 className="text-base font-bold text-slate-800 line-clamp-1">{complaint.subject}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Tabs Header */}
        <div className="flex border-b border-slate-100 bg-white px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'details'
                ? 'border-purple-700 text-purple-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Clock className="w-4 h-4" />
            Complaint Details
          </button>
          
          {(complaint.status === 'Submitted' || complaint.status === 'Under Review') && (
            <>
              <button
                onClick={() => {
                  setActiveTab('approve');
                  setSelectedDept(complaint.department);
                }}
                className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'approve'
                    ? 'border-emerald-600 text-emerald-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-emerald-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Approve & Assign
              </button>
              <button
                onClick={() => setActiveTab('reject')}
                className={`pb-3 px-4 font-semibold text-xs border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'reject'
                    ? 'border-rose-600 text-rose-700 font-bold'
                    : 'border-transparent text-slate-500 hover:text-rose-600'
                }`}
              >
                <XCircle className="w-4 h-4 text-rose-600" />
                Reject Complaint
              </button>
            </>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Top Meta Information Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Department</span>
                  <span className="text-xs font-bold text-slate-700">{complaint.department}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Category</span>
                  <span className="text-xs font-bold text-slate-700">{complaint.category}</span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Priority</span>
                  <span className={`text-xs font-bold ${
                    complaint.priority === 'High' ? 'text-rose-600' : complaint.priority === 'Medium' ? 'text-amber-600' : 'text-slate-600'
                  }`}>
                    {complaint.priority}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-slate-400 block uppercase tracking-wider">Submitted On</span>
                  <span className="text-xs font-bold text-slate-700">{complaint.submittedOn}</span>
                </div>
              </div>

              {/* Student Information Section */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  Student Complainant Information
                </h4>
                <div className="p-4 rounded-2xl border border-slate-100 bg-white space-y-1">
                  <p className="text-sm font-bold text-slate-800">Arjun Kumar <span className="text-xs font-mono font-medium text-slate-500">(22BIT045)</span></p>
                  <p className="text-xs text-slate-500">Information Technology Department • 2nd Year / 3rd Semester</p>
                  <p className="text-xs text-slate-400">Email: arjun.kumar@bitsathy.ac.in | Location: {complaint.location || 'Campus'}</p>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Complaint Description</h4>
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-100 text-xs leading-relaxed text-slate-700 font-normal">
                  {complaint.description}
                </div>
              </div>

              {/* Attachments */}
              {complaint.attachments && complaint.attachments.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5" />
                    Supporting Attachments ({complaint.attachments.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {complaint.attachments.map((att) => (
                      <a
                        key={att.id}
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 p-3 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-purple-50 hover:border-purple-200 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <Paperclip className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="text-xs font-bold text-slate-700 group-hover:text-purple-700 truncate">{att.name}</p>
                          <p className="text-[10px] text-slate-400">{att.size}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Timeline History */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  Audit Timeline Stage Log
                </h4>
                <div className="border-l-2 border-slate-100 pl-4 space-y-4">
                  {complaint.timeline.map((st) => (
                    <div key={st.id} className="relative group">
                      <div className={`absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${
                        st.status === 'completed' ? 'bg-emerald-500' : st.status === 'in_progress' ? 'bg-amber-500' : 'bg-slate-300'
                      }`} />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{st.title}</span>
                        {st.date && <span className="text-[10px] text-slate-400">{st.date} {st.time}</span>}
                      </div>
                      <p className="text-xs text-slate-500">{st.description}</p>
                      {st.actor && <p className="text-[10px] text-purple-600 font-semibold mt-0.5">By {st.actor}</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Remarks Log */}
              {complaint.remarks && complaint.remarks.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    Remarks & Action Notes
                  </h4>
                  <div className="space-y-2">
                    {complaint.remarks.map((rm) => (
                      <div key={rm.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-800">{rm.author} <span className="text-[10px] text-purple-600">({rm.role})</span></span>
                          <span className="text-[10px] text-slate-400">{rm.timestamp}</span>
                        </div>
                        <p className="text-xs text-slate-600">{rm.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* APPROVE FORM */}
          {activeTab === 'approve' && (
            <form onSubmit={handleApproveSubmit} className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-900">Approve & Route Complaint</h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Approving this complaint will change its status to <span className="font-bold">In Progress</span> and forward it to the department wing.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Target Department Routing
                </label>
                <div className="relative">
                  <select
                    value={selectedDept}
                    onChange={(e) => setSelectedDept(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white focus:outline-none focus:border-purple-600"
                  >
                    {departments.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Moderator Action Note / Remarks <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                  rows={3}
                  value={remarkText}
                  onChange={(e) => setRemarkText(e.target.value)}
                  placeholder="e.g. Verified genuine issue. Department technician instructed to resolve within 24 hours."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isSubmitting ? 'Processing...' : 'Confirm Approval'}
                </button>
              </div>
            </form>
          )}

          {/* REJECT FORM */}
          {activeTab === 'reject' && (
            <form onSubmit={handleRejectSubmit} className="space-y-5">
              <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-100 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-rose-900">Reject Student Grievance</h4>
                  <p className="text-xs text-rose-700 mt-0.5">
                    Rejecting will mark the complaint as <span className="font-bold">Rejected</span> and send the specified reason to the complainant.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Mandatory Rejection Reason <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Invalid request / duplicate submission / out of jurisdiction..."
                  className="w-full p-3 rounded-2xl border border-slate-200 text-xs text-slate-800 focus:outline-none focus:border-rose-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('details')}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !rejectionReason.trim()}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-colors inline-flex items-center gap-2"
                >
                  <XCircle className="w-4 h-4" />
                  {isSubmitting ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          )}
        </div>

      </div>
    </div>
  );
};
