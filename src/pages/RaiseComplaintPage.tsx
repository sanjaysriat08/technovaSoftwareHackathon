import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { PriorityLevel } from '../types';

interface RaiseComplaintPageProps {
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}

const DEPARTMENTS = [
  'Network / Wi-Fi',
  'Maintenance',
  'Canteen / Dining',
  'Transport',
  'Academics & Examination',
  'Hostel & Accommodation',
  'Library Services',
  'Sports & Gym'
];

const CATEGORIES: Record<string, string[]> = {
  'Network / Wi-Fi': ['Internet Connectivity', 'Portal Login Issue', 'Wi-Fi Speed', 'Router Failure'],
  'Maintenance': ['Plumbing & Sanitation', 'Electrical & Lighting', 'AC & Ventilation', 'Furniture & Bench'],
  'Canteen / Dining': ['Food Quality & Hygiene', 'Pricing & Billing', 'Service Delay', 'Cleanliness'],
  'Transport': ['Bus Schedule & Route', 'Driver Behavior', 'Pass Issue', 'Vehicle Condition'],
  'Academics & Examination': ['Marks Entry', 'Schedule Conflict', 'Classroom Projector', 'Attendance Record'],
  'Hostel & Accommodation': ['Room Maintenance', 'Water Purifier', 'Noise Complaint', 'Security'],
  'Library Services': ['Book Availability', 'Digital Library Access', 'Study Hall Quiet Zone'],
  'Sports & Gym': ['Equipment Repair', 'Ground Maintenance', 'Locker Room']
};

export const RaiseComplaintPage: React.FC<RaiseComplaintPageProps> = ({ onSubmit, onCancel }) => {
  const [department, setDepartment] = useState('');
  const [category, setCategory] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [location, setLocation] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files) as File[];
    validateAndAddFiles(selectedFiles);
  };

  const validateAndAddFiles = (newFiles: File[]) => {
    const errors: string[] = [];
    const valid: File[] = [];

    newFiles.forEach((file) => {
      // 5MB limit
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`File "${file.name}" exceeds maximum allowed size of 5MB.`);
        return;
      }
      const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        errors.push(`File "${file.name}" format not allowed. Only PNG, JPG, and PDF accepted.`);
        return;
      }
      valid.push(file);
    });

    setFileErrors(errors);
    setFiles((prev) => [...prev, ...valid].slice(0, 5)); // Limit max 5 files
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      validateAndAddFiles(Array.from(e.dataTransfer.files) as File[]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department || !category || !subject || !description) return;

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('department', department);
      formData.append('category', category);
      formData.append('subject', subject);
      formData.append('description', description);
      formData.append('priority', priority);
      formData.append('location', location);

      files.forEach((file) => {
        formData.append('supportingFiles', file);
      });

      await onSubmit(formData);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setDepartment('');
    setCategory('');
    setSubject('');
    setDescription('');
    setPriority('Medium');
    setLocation('');
    setFiles([]);
    setFileErrors([]);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Raise a New Complaint</h2>
        <p className="text-xs text-slate-500 font-medium mt-1">
          Provide the details below to register your complaint for rapid resolution.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 space-y-6">
        {/* Department & Category Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Department / Area <span className="text-rose-500">*</span>
            </label>
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setCategory('');
              }}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 bg-slate-50/50"
            >
              <option value="">Select department / area</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              disabled={!department}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 bg-slate-50/50 disabled:opacity-50"
            >
              <option value="">Select category</option>
              {department &&
                CATEGORIES[department]?.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Subject */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Subject <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter subject of your complaint"
            required
            maxLength={100}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 bg-slate-50/50"
          />
          <span className="text-[10px] text-slate-400 font-medium text-right block">
            {subject.length}/100 characters
          </span>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your issue in detail..."
            required
            rows={5}
            maxLength={1000}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 bg-slate-50/50 resize-y"
          />
        </div>

        {/* Priority & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Priority Level</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 bg-slate-50/50"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Location / Building</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Block C 3rd Floor Room 302"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Drag & Drop File Upload Box */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">Upload File / Image (Optional)</label>
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            className="border-2 border-dashed border-purple-200 rounded-2xl p-8 text-center bg-purple-50/30 hover:bg-purple-50/60 transition-colors cursor-pointer relative"
          >
            <input
              type="file"
              multiple
              accept=".png,.jpg,.jpeg,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto mb-3">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-purple-700">Click to upload or drag and drop</p>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">PNG, JPG, PDF up to 5MB</p>
          </div>

          {/* Validation errors */}
          {fileErrors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-xs text-rose-700">
              {fileErrors.map((err, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Selected File Previews */}
          {files.length > 0 && (
            <div className="space-y-2 pt-2">
              <span className="text-[11px] font-bold text-slate-600">Attached Files ({files.length}):</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {files.map((f, i) => (
                  <div
                    key={i}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-purple-600 shrink-0" />
                      <div className="truncate">
                        <p className="font-semibold text-slate-700 truncate">{f.name}</p>
                        <p className="text-[10px] text-slate-400">{(f.size / (1024 * 1024)).toFixed(1)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(i)}
                      className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200/50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800"
          >
            Reset
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !department || !category || !subject || !description}
              className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold text-xs transition-colors shadow-md shadow-purple-900/20 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit Complaint</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
