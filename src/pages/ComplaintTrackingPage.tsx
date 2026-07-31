import React, { useState } from 'react';
import { Complaint } from '../types';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  Send,
  Paperclip,
  Download,
  Building2,
  Calendar,
  UserCheck,
  ShieldCheck,
  Camera,
  X,
  Eye,
  Check,
  Wrench,
  Sparkles
} from 'lucide-react';

interface ComplaintTrackingPageProps {
  complaint: Complaint;
  onBack: () => void;
  onAddRemark: (complaintId: string, text: string) => Promise<void>;
  onPreviewAttachment?: (fileUrl: string, fileName: string) => void;
}

export const ComplaintTrackingPage: React.FC<ComplaintTrackingPageProps> = ({
  complaint,
  onBack,
  onAddRemark,
  onPreviewAttachment,
}) => {
  const [remarkText, setRemarkText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [activeImagePreview, setActiveImagePreview] = useState<{ url: string; title: string } | null>(null);

  const handleSendRemark = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!remarkText.trim()) return;

    setIsSending(true);
    try {
      await onAddRemark(complaint.complaintId, remarkText.trim());
      setRemarkText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  // Determine verification flags
  const isApprovedByModerator = complaint.timeline.some(
    (t) =>
      t.status === 'completed' &&
      (t.title.toLowerCase().includes('approved') ||
        t.title.toLowerCase().includes('verified') ||
        t.actor === 'Moderator')
  ) || (complaint.status !== 'Submitted' && complaint.status !== 'Rejected');

  const isSolvedByStaff = complaint.status === 'Resolved' || complaint.timeline.some(
    (t) =>
      t.status === 'completed' &&
      (t.title.toLowerCase().includes('resolved') || t.title.toLowerCase().includes('solved'))
  );

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Navigation */}
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-purple-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to My Complaints</span>
      </button>

      {/* Main Details Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xl font-bold text-slate-800">{complaint.complaintId}</span>
              <StatusBadge status={complaint.status} size="lg" />

              {/* Moderator Verified Symbol Badge */}
              {isApprovedByModerator && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-xs font-bold shadow-2xs">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Moderator Verified ✓</span>
                </span>
              )}

              {/* Staff Solved Symbol Badge */}
              {isSolvedByStaff && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold shadow-2xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Solved by Staff ✓</span>
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-slate-800 mt-2">{complaint.subject}</h2>
            <div className="flex items-center gap-4 text-xs text-slate-500 mt-1 flex-wrap">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {complaint.department} ({complaint.category})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Submitted on {complaint.submittedOn}, {complaint.submittedTime}
              </span>
            </div>
          </div>

          <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6">
            <span className="text-[11px] text-slate-400 block font-medium">Priority</span>
            <span className="text-xs font-bold text-purple-700">{complaint.priority} Priority</span>
          </div>
        </div>

        {/* Description Section */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Description</h4>
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/60 p-4 rounded-xl border border-slate-100">
            {complaint.description}
          </p>
          {complaint.location && (
            <p className="text-xs font-semibold text-slate-500 pt-1">
              Location: <span className="text-slate-800 font-medium">{complaint.location}</span>
            </p>
          )}
        </div>

        {/* Attachments Section */}
        {complaint.attachments.length > 0 && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-purple-600" />
              Student Initial Attachments ({complaint.attachments.length})
            </h4>
            <div className="flex flex-wrap gap-3">
              {complaint.attachments.map((att) => (
                <div
                  key={att.id}
                  className="p-3 bg-white border border-slate-200 rounded-xl flex items-center gap-3 text-xs shadow-2xs hover:border-purple-300 transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-purple-600 shrink-0" />
                  <div>
                    <span className="block font-semibold text-slate-800 truncate max-w-xs">{att.name}</span>
                    <span className="block text-[10px] text-slate-400">{att.size}</span>
                  </div>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-purple-700 hover:bg-purple-50 rounded-lg ml-2"
                    title="Download / View Attachment"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Horizontal Progress Timeline with Moderator & Staff Verified Icons */}
        <div className="pt-6 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status Timeline</h4>
            <div className="flex items-center gap-3 text-[10px] font-bold">
              {isApprovedByModerator && (
                <span className="text-indigo-600 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Moderator Verified
                </span>
              )}
              {isSolvedByStaff && (
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Staff Solved
                </span>
              )}
            </div>
          </div>

          <div className="relative py-4 overflow-x-auto">
            <div className="flex items-center justify-between min-w-[600px] relative">
              {/* Connecting Line */}
              <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0" />

              {complaint.timeline.map((stage, idx) => {
                const isCompleted = stage.status === 'completed';
                const isInProgress = stage.status === 'in_progress';
                const isModStage = stage.title.toLowerCase().includes('approved') || stage.actor === 'Moderator';
                const isStaffSolvedStage = stage.title.toLowerCase().includes('resolved') || stage.title.toLowerCase().includes('solved');

                return (
                  <div key={stage.id} className="relative z-10 flex flex-col items-center text-center w-36">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-all ${
                        isCompleted
                          ? isModStage
                            ? 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                            : isStaffSolvedStage
                            ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                            : 'bg-emerald-500 text-white ring-4 ring-emerald-50'
                          : isInProgress
                          ? 'bg-amber-500 text-white ring-4 ring-amber-50 animate-pulse'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isModStage && isCompleted ? (
                        <ShieldCheck className="w-5 h-5 text-white" />
                      ) : isStaffSolvedStage && isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      ) : isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        idx + 1
                      )}
                    </div>

                    <span className="text-xs font-bold text-slate-800 mt-2 block">{stage.title}</span>

                    {/* Stage verified pill tags */}
                    {isModStage && isCompleted && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md mt-0.5">
                        <ShieldCheck className="w-3 h-3 text-indigo-600" />
                        <span>Verified ✓</span>
                      </span>
                    )}

                    {isStaffSolvedStage && isCompleted && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md mt-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Solved ✓</span>
                      </span>
                    )}

                    <span className="text-[10px] text-slate-400 font-medium block mt-1">
                      {stage.date ? `${stage.date} ${stage.time || ''}` : 'Pending'}
                    </span>
                    {stage.actor && (
                      <span className="text-[9px] font-semibold text-purple-600 block mt-0.5">{stage.actor}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Solved Process & Photo Proof Section (If Solved by Staff) */}
      {(isSolvedByStaff || complaint.resolutionDetails || (complaint.evidenceFiles && complaint.evidenceFiles.length > 0)) && (
        <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-3xl text-white p-6 sm:p-8 space-y-6 shadow-xl border border-emerald-800">
          <div className="flex items-center justify-between border-b border-emerald-700/60 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center backdrop-blur-md">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold">Solved Process & Evidence Proof</h3>
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                    Staff Verified ✓
                  </span>
                </div>
                <p className="text-xs text-emerald-200 font-medium">
                  Maintenance staff completion details and attached photo evidence
                </p>
              </div>
            </div>

            {complaint.assignedStaffName && (
              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-emerald-300 block">Resolved By</span>
                <span className="text-xs font-bold text-white">{complaint.assignedStaffName}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Solved Action Process Details */}
            <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                Corrective Actions & Solved Process
              </h4>

              {complaint.resolutionDetails?.summary && (
                <div>
                  <span className="text-[10px] text-emerald-200 block font-semibold uppercase">Process Summary</span>
                  <p className="text-xs text-white font-medium mt-0.5">{complaint.resolutionDetails.summary}</p>
                </div>
              )}

              {complaint.resolutionDetails?.actionsTaken && (
                <div>
                  <span className="text-[10px] text-emerald-200 block font-semibold uppercase">Step-By-Step Actions</span>
                  <p className="text-xs text-emerald-50 leading-relaxed mt-0.5 whitespace-pre-wrap">
                    {complaint.resolutionDetails.actionsTaken}
                  </p>
                </div>
              )}

              {complaint.resolutionDetails?.completionDate && (
                <div>
                  <span className="text-[10px] text-emerald-200 block font-semibold uppercase">Completion Timestamp</span>
                  <p className="text-xs text-white font-bold mt-0.5">{complaint.resolutionDetails.completionDate}</p>
                </div>
              )}
            </div>

            {/* Photo Proof & Evidence Gallery */}
            <div className="space-y-4 bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-400" />
                Attached Photo Proof / Image Evidence
              </h4>

              {complaint.evidenceFiles && complaint.evidenceFiles.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {complaint.evidenceFiles.map((file, idx) => (
                    <div
                      key={file.id || idx}
                      onClick={() => setActiveImagePreview({ url: file.url, title: file.name })}
                      className="group relative bg-black/40 rounded-xl overflow-hidden border border-emerald-500/30 cursor-pointer aspect-video flex items-center justify-center hover:border-emerald-400 transition-all"
                    >
                      <img
                        src={file.url}
                        alt={file.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback placeholder if image load error
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 text-xs font-bold text-white">
                        <Eye className="w-4 h-4 text-emerald-300" />
                        <span>Inspect Proof</span>
                      </div>
                      <div className="absolute bottom-1 left-1.5 right-1.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-emerald-200 truncate font-mono">
                        {file.name}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-200/80 py-6 text-center italic">
                  Work completed and signed off by staff. (No separate photo files attached)
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remarks & Follow-Up Updates History */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-6 sm:p-8 space-y-6">
        <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-600" />
          Comments & Department Updates
        </h3>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {complaint.remarks.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No comments logged yet.</p>
          ) : (
            complaint.remarks.map((rem) => (
              <div
                key={rem.id}
                className={`p-4 rounded-xl border ${
                  rem.isSystem
                    ? 'bg-purple-50/30 border-purple-100'
                    : 'bg-slate-50/80 border-slate-200/80'
                } space-y-1.5`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-slate-800">{rem.author}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200/60 text-slate-600 font-semibold">
                      {rem.role}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{rem.timestamp}</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed pl-6">{rem.text}</p>
              </div>
            ))
          )}
        </div>

        {/* Add Follow-Up Remark Input Form */}
        <form onSubmit={handleSendRemark} className="pt-4 border-t border-slate-100 flex items-center gap-3">
          <input
            type="text"
            value={remarkText}
            onChange={(e) => setRemarkText(e.target.value)}
            placeholder="Add a follow-up query or remark for department staff..."
            className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
          />
          <button
            type="submit"
            disabled={isSending || !remarkText.trim()}
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white rounded-xl font-semibold text-xs transition-colors flex items-center gap-2 shadow-xs shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send</span>
          </button>
        </form>
      </div>

      {/* Image Proof Lightbox Modal */}
      {activeImagePreview && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 shadow-2xl">
            <div className="p-4 bg-slate-800 flex items-center justify-between text-white border-b border-slate-700">
              <span className="text-xs font-bold flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Staff Solved Image Proof: {activeImagePreview.title}
              </span>
              <button
                onClick={() => setActiveImagePreview(null)}
                className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 flex items-center justify-center max-h-[80vh] overflow-auto">
              <img
                src={activeImagePreview.url}
                alt={activeImagePreview.title}
                className="max-h-[70vh] object-contain rounded-xl border border-slate-800 shadow-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

