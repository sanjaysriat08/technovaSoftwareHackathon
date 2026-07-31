import React, { useState } from 'react';
import { UserProfile } from '../types';
import { Edit3, User, Mail, Phone, Hash, Building, GraduationCap, CheckCircle2 } from 'lucide-react';
import { Modal } from '../components/common/Modal';

interface ProfilePageProps {
  user: UserProfile;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user, onUpdateProfile }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateProfile({
        fullName,
        email,
        phone,
        avatarUrl,
      });
      setIsEditOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Profile</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            View and update your personal and academic student profile details.
          </p>
        </div>
        <button
          onClick={() => {
            setFullName(user.fullName);
            setEmail(user.email);
            setPhone(user.phone);
            setAvatarUrl(user.avatarUrl);
            setIsEditOpen(true);
          }}
          className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <Edit3 className="w-4 h-4" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Main Student Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8 flex flex-col md:flex-row items-center md:items-start gap-8">
        <div className="relative group shrink-0">
          <img
            src={user.avatarUrl}
            alt={user.fullName}
            className="w-28 h-28 rounded-2xl object-cover border-2 border-purple-200 shadow-md"
          />
        </div>

        <div className="flex-1 space-y-4 text-center md:text-left w-full">
          <div>
            <h3 className="text-xl font-bold text-slate-800">{user.fullName}</h3>
            <p className="text-xs font-semibold text-purple-700 mt-0.5">{user.department}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-3">
              <Hash className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Roll No.</span>
                <span className="font-bold text-slate-800">{user.rollNo}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Email</span>
                <span className="font-bold text-slate-800">{user.email}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Phone</span>
                <span className="font-bold text-slate-800">{user.phone}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <GraduationCap className="w-4 h-4 text-purple-600 shrink-0" />
              <div>
                <span className="text-[10px] text-slate-400 font-medium block">Register Number</span>
                <span className="font-bold text-slate-800">{user.registerNumber}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Details Section */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-8 space-y-4">
        <h4 className="font-bold text-slate-800 text-sm">Academic Details</h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs bg-slate-50/60 p-6 rounded-xl border border-slate-100">
          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Year / Semester</span>
            <span className="font-bold text-slate-800 mt-1 block">{user.yearSemester}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Register Number</span>
            <span className="font-bold text-slate-800 mt-1 block">{user.registerNumber}</span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 font-medium block">Department</span>
            <span className="font-bold text-slate-800 mt-1 block">{user.department}</span>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Profile">
        <form onSubmit={handleSave} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">Avatar Image URL</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-600/20"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-semibold flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
