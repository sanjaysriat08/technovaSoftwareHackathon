import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Building, ShieldCheck, Edit2, Save, MapPin, Award, CheckCircle2 } from 'lucide-react';
import { ModeratorProfile } from '../../types';
import { api } from '../../services/api';

interface ModeratorProfilePageProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ModeratorProfilePage: React.FC<ModeratorProfilePageProps> = ({ addToast }) => {
  const [profile, setProfile] = useState<ModeratorProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<ModeratorProfile>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    api.getModeratorProfile().then((data) => {
      setProfile(data);
      setFormData(data);
    });
  }, []);

  if (!profile) {
    return (
      <div className="py-12 text-center text-slate-400">Loading moderator profile...</div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await api.updateModeratorProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      addToast('success', 'Profile Updated', 'Moderator credentials saved successfully.');
    } catch (err) {
      addToast('error', 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Moderator Directory</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">
            Moderator Profile
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Verified staff member account & grievance moderation privileges.
          </p>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs transition-colors inline-flex items-center gap-2"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsEditing(false);
                setFormData(profile);
              }}
              className="px-4 py-2 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-2xl bg-purple-700 text-white hover:bg-purple-800 font-bold text-xs transition-colors inline-flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative shrink-0">
          <img
            src={profile.avatarUrl}
            alt={profile.fullName}
            className="w-28 h-28 rounded-3xl object-cover ring-4 ring-purple-50 shadow-md"
          />
          <span className="absolute -bottom-2 -right-2 bg-emerald-500 text-white p-1.5 rounded-xl shadow-xs" title="Authorized Moderator">
            <ShieldCheck className="w-4 h-4" />
          </span>
        </div>

        <div className="flex-1 w-full space-y-6">
          {!isEditing ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-800">{profile.fullName}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 font-mono text-[10px] font-bold">
                    {profile.employeeId}
                  </span>
                </div>
                <p className="text-xs font-semibold text-purple-700 mt-1">{profile.role}</p>
                <p className="text-xs text-slate-500">{profile.department}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{profile.email}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{profile.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{profile.officeLocation}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <Award className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Grievance Level 2 Moderator Authority</span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
                <input
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Office Location</label>
                <input
                  type="text"
                  value={formData.officeLocation || ''}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Permissions Box */}
      <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-700" />
          Moderator System Privileges
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium text-slate-600">
          <div className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Approve & Assign Grievances</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Reject Grievance Submissions</span>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-slate-100 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>View Student Identity & History</span>
          </div>
        </div>
      </div>
    </div>
  );
};
