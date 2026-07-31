import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  Image as ImageIcon,
  Send,
  AlertCircle,
  Paperclip
} from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';

interface EvidenceUploadPageProps {
  preselectedComplaintId?: string;
  onNavigateTab: (tab: any, complaintId?: string) => void;
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const EvidenceUploadPage: React.FC<EvidenceUploadPageProps> = ({
  preselectedComplaintId,
  onNavigateTab,
  addToast,
}) => {
  const [assignedList, setAssignedList] = useState<Complaint[]>([]);
  const [selectedId, setSelectedId] = useState<string>(preselectedComplaintId || '');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const loadList = async () => {
      try {
        setIsLoading(true);
        const list = await api.getAssignedComplaints();
        setAssignedList(list);
        if (preselectedComplaintId) {
          setSelectedId(preselectedComplaintId);
        } else if (list.length > 0) {
          setSelectedId(list[0].complaintId);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    loadList();
  }, [preselectedComplaintId]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles((prev) => [...prev, ...droppedFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      addToast('error', 'Validation Error', 'Please select a complaint ticket.');
      return;
    }
    if (files.length === 0) {
      addToast('error', 'Validation Error', 'Please attach at least one photo or document proof.');
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('evidenceFiles', file);
      });

      await api.uploadEvidence(selectedId, formData);
      addToast('success', 'Evidence Uploaded', `Uploaded ${files.length} file proof(s) successfully.`);
      setFiles([]);
      onNavigateTab('staff-investigation', selectedId);
    } catch (err) {
      console.error(err);
      addToast('error', 'Upload Failed', 'Failed to upload evidence files.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-800">Upload Evidence Proof</h2>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          Attach before/after photos, diagnostic reports, and parts receipts for audit verification.
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

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${
              isDragging
                ? 'border-purple-600 bg-purple-50/50'
                : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-800">Drag & Drop photo evidence or work receipts</h4>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              Supports JPG, PNG, WEBP, or PDF files (up to 10MB each)
            </p>

            <label className="inline-block mt-4 px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-xs">
              Browse Files
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
          </div>

          {/* Selected File Previews */}
          {files.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                <Paperclip className="w-3.5 h-3.5 text-purple-600" />
                <span>Selected Proof Documents ({files.length})</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {files.map((f, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        {f.type.startsWith('image/') ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">{f.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">
                          {(f.size / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
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
              disabled={isSubmitting || !selectedId || files.length === 0}
              className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>{isSubmitting ? 'Uploading Proofs...' : 'Submit Evidence Proofs'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
