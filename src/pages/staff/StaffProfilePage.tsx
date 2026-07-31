import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  BadgeCheck,
  MapPin,
  Save,
  CheckCircle2,
  Camera,
  Briefcase
} from 'lucide-react';
import { StaffProfile } from '../../types';
import { api } from '../../services/api';

interface StaffProfilePageProps {
  addToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const StaffProfilePage: React.FC<StaffProfilePageProps> = ({ addToast }) => {
  const [profile, setProfile] = useState<StaffProfile>({
    id: 'staff_profile',
    fullName: 'Mr. Arun Kumar',
    email: 'arunkumar.m@bitsathy.ac.in',
    phone: '+91 98765 43210',
    department: 'Maintenance Staff',
    designation: 'Senior Maintenance Engineer',
    employeeId: 'EMP-2026-8801',
    officeLocation: 'Estate Maintenance Wing, Block C',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<StaffProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const data = await api.getStaffProfile();
        if (data) {
          setProfile(data);
          setFormData(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const updated = await api.updateStaffProfile(formData);
      setProfile(updated);
      setIsEditing(false);
      addToast('success', 'Profile Saved', 'Staff profile details updated successfully.');
    } catch (err) {
      console.error(err);
      addToast('error', 'Error', 'Failed to save staff profile.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 text-center text-slate-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700 mb-3"></div>
        <p className="text-xs font-semibold">Loading profile data...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200 pb-12">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-800">Staff Profile</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage your staff account credentials, designation, and contact details.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isEditing
              ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              : 'bg-purple-700 text-white hover:bg-purple-800 shadow-xs'
          }`}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </div>

      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 md:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100">
          <div className="relative">
            <img
              src={formData.avatarUrl || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'}
              alt={formData.fullName}
              className="w-24 h-24 rounded-3xl object-cover ring-4 ring-purple-50 shadow-md"
            />
            {isEditing && (
              <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-purple-700 text-white flex items-center justify-center cursor-pointer shadow-xs hover:bg-purple-800">
                <Camera className="w-4 h-4" />
              </div>
            )}
          </div>

          <div className="text-center sm:text-left space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-extrabold text-slate-800">{profile.fullName}</h3>
              <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 font-extrabold text-[10px] rounded-full border border-purple-100">
                {profile.employeeId}
              </span>
            </div>
            <p className="text-xs font-bold text-slate-500 flex items-center justify-center sm:justify-start gap-1">
              <Briefcase className="w-3.5 h-3.5 text-purple-600" />
              <span>{profile.designation}</span>
            </p>
            <p className="text-xs text-slate-400 font-medium">{profile.department}</p>
          </div>
        </div>

        {/* Profile Details Form / Grid */}
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 disabled:opacity-80 focus:outline-none"
                />
              </div>
            </div>

            {/* Employee ID */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Employee ID
              </label>
              <div className="relative">
                <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled
                  value={formData.employeeId}
                  className="w-full pl-10 pr-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-mono font-bold text-slate-600"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  disabled={!isEditing}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 disabled:opacity-80 focus:outline-none"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 disabled:opacity-80 focus:outline-none"
                />
              </div>
            </div>

            {/* Department */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Department / Wing
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 disabled:opacity-80 focus:outline-none"
                />
              </div>
            </div>

            {/* Office Location */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Office Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  disabled={!isEditing}
                  value={formData.officeLocation || ''}
                  onChange={(e) => setFormData({ ...formData, officeLocation: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-800 disabled:opacity-80 focus:outline-none"
                />
              </div>
            </div>

          </div>

          {/* Submit Button if Editing */}
          {isEditing && (
            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
