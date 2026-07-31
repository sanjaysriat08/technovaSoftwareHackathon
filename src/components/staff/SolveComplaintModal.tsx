import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle,
  Upload,
  Image as ImageIcon,
  FileText,
  Trash2,
  Building2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { Complaint } from '../../types';
import { api } from '../../services/api';

interface SolveComplaintModalProps {
  isOpen: boolean;
  complaint: Complaint | null;
  onClose: () => void;
  onSuccess: () => void;
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const SolveComplaintModal: React.FC<SolveComplaintModalProps> = ({
  isOpen,
  complaint,
  onClose,
  onSuccess,
  addToast,
}) => {
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [actionsTaken, setActionsTaken] = useState('');
  const [finalRemarks, setFinalRemarks] = useState('');
  const [completionDate, setCompletionDate] = useState(
    new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (complaint) {
      setResolutionSummary('');
      setActionsTaken('');
      setFinalRemarks('');
      setSelectedFiles([]);
      setPreviewUrls([]);
    }
  }, [complaint]);

  if (!isOpen || !complaint) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newFiles = [...selectedFiles, ...filesArray].slice(0, 5);
      setSelectedFiles(newFiles);

      // Create object URLs for image preview
      const urls = newFiles.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : ''));
      setPreviewUrls(urls);
    }
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
    const urls = updatedFiles.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : ''));
    setPreviewUrls(urls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolutionSummary.trim()) {
      addToast('error', 'Validation Error', 'Please enter a resolution summary.');
      return;
    }
    if (!actionsTaken.trim()) {
      addToast('error', 'Validation Error', 'Please describe the corrective actions taken.');
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append('resolutionSummary', resolutionSummary);
      formData.append('actionsTaken', actionsTaken);
      formData.append('finalRemarks', finalRemarks);
      formData.append('completionDate', completionDate);

      selectedFiles.forEach((file) => {
        formData.append('evidenceFiles', file);
      });

      await api.submitResolution(complaint.complaintId, formData);

      addToast(
        'success',
        'Complaint Resolved',
        `Complaint ${complaint.complaintId} marked as solved with ${selectedFiles.length} evidence proof file(s)!`
      );
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      addToast('error', 'Resolution Failed', 'Could not submit resolution details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-100 shadow-2xl overflow-hidden my-8 space-y-0">
        
        {/* Modal Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-purple-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md">
              <CheckCircle className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-lg tracking-tight">Update Solved Process & Image Proof</h3>
              <p className="text-xs text-purple-200 font-medium">
                Record technical resolution steps and attach photo evidence in a single submission.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Complaint Context Summary */}
        <div className="p-6 bg-slate-50 border-b border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-xs text-purple-700 bg-purple-100/60 px-2.5 py-1 rounded-lg">
              {complaint.complaintId}
            </span>
            <span className="text-xs font-bold text-slate-500">{complaint.department}</span>
          </div>
          <h4 className="font-extrabold text-slate-800 text-sm">{complaint.subject}</h4>
          <p className="text-xs text-slate-600 line-clamp-2">{complaint.description}</p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Solved Process Details */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Resolution Process Summary <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Replaced blown fuse and restored electric line in Lab 301."
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Detailed Solved Process & Action Steps <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Specify step-by-step physical repairs, replaced parts, testing procedure, or maintenance performed..."
              value={actionsTaken}
              onChange={(e) => setActionsTaken(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Preventive / Final Remarks
              </label>
              <input
                type="text"
                placeholder="e.g., Verified circuit load capacity."
                value={finalRemarks}
                onChange={(e) => setFinalRemarks(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none"
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
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none"
              />
            </div>
          </div>

          {/* Integrated Image Proof Evidence Upload Field */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-purple-700">
                <Camera className="w-4 h-4 text-purple-600" />
                Attach Photo / Image Proof Evidence
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Optional (Max 5 files)</span>
            </label>

            {/* Dropzone */}
            <div className="relative border-2 border-dashed border-purple-200 hover:border-purple-400 bg-purple-50/30 hover:bg-purple-50/60 transition-colors rounded-2xl p-4 text-center cursor-pointer group">
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-1">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-700">
                  Click or Drag & Drop Photo Proof of Solved Work
                </p>
                <p className="text-[10px] text-slate-400">
                  PNG, JPG, JPEG, WEBP or PDF (Max 10MB each)
                </p>
              </div>
            </div>

            {/* Uploaded File Previews */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2 pt-2">
                <p className="text-[11px] font-bold text-slate-600">Attached Proof Photos ({selectedFiles.length}):</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedFiles.map((file, idx) => (
                    <div
                      key={idx}
                      className="relative p-2 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2 group"
                    >
                      {previewUrls[idx] ? (
                        <img
                          src={previewUrls[idx]}
                          alt={file.name}
                          className="w-10 h-10 object-cover rounded-lg shrink-0 border border-slate-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold text-slate-700 truncate">{file.name}</p>
                        <p className="text-[9px] text-slate-400">{(file.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !resolutionSummary.trim() || !actionsTaken.trim()}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Submitting Solve & Proof...' : 'Complete & Mark Solved'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
