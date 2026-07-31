/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ActiveTab } from './types';
import { DashboardPage } from './pages/DashboardPage';
import { RaiseComplaintPage } from './pages/RaiseComplaintPage';
import { MyComplaintsPage } from './pages/MyComplaintsPage';
import { ComplaintTrackingPage } from './pages/ComplaintTrackingPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { ApiDocsPage } from './pages/ApiDocsPage';

// Moderator Module Pages
import { ModeratorDashboardPage } from './pages/moderator/ModeratorDashboardPage';
import { PendingApprovalsPage } from './pages/moderator/PendingApprovalsPage';
import { ApprovedComplaintsPage } from './pages/moderator/ApprovedComplaintsPage';
import { RejectedComplaintsPage } from './pages/moderator/RejectedComplaintsPage';
import { ModeratorProfilePage } from './pages/moderator/ModeratorProfilePage';

// Staff Module Pages
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { AssignedComplaintsPage } from './pages/staff/AssignedComplaintsPage';
import { InvestigationPage } from './pages/staff/InvestigationPage';
import { ProgressUpdatesPage } from './pages/staff/ProgressUpdatesPage';
import { EvidenceUploadPage } from './pages/staff/EvidenceUploadPage';
import { ResolutionPage } from './pages/staff/ResolutionPage';
import { WorkHistoryPage } from './pages/staff/WorkHistoryPage';
import { StaffProfilePage } from './pages/staff/StaffProfilePage';

import { ToastContainer, ToastMessage } from './components/common/Toast';
import { Modal } from './components/common/Modal';
import { api } from './services/api';
import { Complaint, ComplaintStats, NotificationItem, UserProfile, ModeratorProfile, StaffProfile, UserRole } from './types';
import { HelpCircle, LogOut, Phone, Mail, ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [activeRole, setActiveRole] = useState<UserRole>('student');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>('CMP-2026-0123');
  const [staffSelectedComplaintId, setStaffSelectedComplaintId] = useState<string>('');

  const handleStaffNavigateTab = (tab: ActiveTab, complaintId?: string) => {
    if (complaintId) {
      setStaffSelectedComplaintId(complaintId);
    }
    setActiveTab(tab);
  };

  // App Data States
  const [user, setUser] = useState<UserProfile | null>(null);
  const [moderator, setModerator] = useState<ModeratorProfile | null>(null);
  const [staff, setStaff] = useState<StaffProfile | null>(null);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<ComplaintStats>({ total: 0, inProgress: 0, resolved: 0, rejected: 0 });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // UI Dialog States
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = String(Date.now());
    setToasts((prev) => [...prev, { id, type, title, message }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    if (role === 'staff') {
      setActiveTab('staff-dashboard');
      addToast('info', 'Switched to Staff Module', 'Viewing Maintenance Staff Portal.');
    } else if (role === 'moderator') {
      setActiveTab('mod-dashboard');
      addToast('info', 'Switched to Moderator Module', 'Viewing Chief Moderator command center.');
    } else {
      setActiveTab('dashboard');
      addToast('info', 'Switched to Student Module', 'Viewing Student grievance dashboard.');
    }
  };

  // Fetch Initial Data from Express API
  const loadAllData = async () => {
    try {
      const [usrData, modData, staffData, compList, statsData, notifData] = await Promise.all([
        api.getProfile(),
        api.getModeratorProfile(),
        api.getStaffProfile(),
        api.getComplaints(),
        api.getStats(),
        api.getNotifications(),
      ]);

      setUser(usrData);
      setModerator(modData);
      setStaff(staffData);
      setComplaints(compList);
      setStats(statsData);
      setNotifications(notifData.data || []);
      setUnreadCount(notifData.unreadCount ?? (notifData.data ? notifData.data.filter((n) => !n.read).length : 0));
    } catch (err) {
      console.error('Error fetching application data:', err);
      addToast('error', 'Connection Error', 'Could not load data from backend server.');
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handlers
  const handleRaiseComplaintSubmit = async (formData: FormData) => {
    try {
      const res = await api.createComplaint(formData);
      addToast('success', 'Complaint Submitted!', `Registered under ID ${res.data.complaintId}`);
      await loadAllData();
      setSelectedComplaintId(res.data.complaintId);
      setActiveTab('status');
    } catch (err: any) {
      addToast('error', 'Submission Failed', err.response?.data?.message || 'Error creating complaint');
    }
  };

  const handleAddRemark = async (complaintId: string, text: string) => {
    try {
      await api.addRemark(complaintId, text);
      addToast('success', 'Remark Sent', 'Your follow-up note has been added.');
      await loadAllData();
    } catch (err) {
      addToast('error', 'Error', 'Failed to add remark.');
    }
  };

  const handleNotificationClick = async (id: string, complaintId?: string) => {
    try {
      await api.markNotificationRead(id);
      await loadAllData();
      if (complaintId) {
        setSelectedComplaintId(complaintId);
        setActiveTab('status');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      addToast('info', 'Notifications Updated', 'All notifications marked as read.');
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      addToast('info', 'Notification Deleted');
      await loadAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    try {
      const updated = await api.updateProfile(data);
      setUser(updated);
      addToast('success', 'Profile Saved', 'Your student profile information has been updated.');
    } catch (err) {
      addToast('error', 'Error', 'Failed to update profile.');
    }
  };

  // Selected complaint object for tracking view
  const currentComplaint =
    complaints.find((c) => c.complaintId === selectedComplaintId || c.id === selectedComplaintId) ||
    complaints[0];

  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl border border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">You have logged out</h2>
          <p className="text-xs text-slate-500">
            JWT session ended safely. As per requirements, authentication is handled as a common module.
          </p>
          <button
            onClick={() => {
              setIsLoggedOut(false);
              loadAllData();
            }}
            className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-semibold shadow-md transition-colors"
          >
            Re-enter User Module
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-900 font-sans antialiased">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeRole={activeRole}
        unreadCount={unreadCount}
        onLogoutClick={() => setIsLogoutModalOpen(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Header */}
        <Header
          user={user}
          moderator={moderator || undefined}
          staff={staff || undefined}
          activeRole={activeRole}
          onRoleChange={handleRoleChange}
          notifications={notifications}
          unreadCount={unreadCount}
          onNotificationClick={handleNotificationClick}
          onMarkAllRead={handleMarkAllRead}
          onOpenProfile={() =>
            setActiveTab(activeRole === 'staff' ? 'staff-profile' : activeRole === 'moderator' ? 'mod-profile' : 'profile')
          }
          onOpenApiDocs={() => setActiveTab('api-docs')}
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setIsMobileSidebarOpen(!isMobileSidebarOpen);
            } else {
              setIsSidebarCollapsed(!isSidebarCollapsed);
            }
          }}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-12">
          {/* STUDENT MODULE PAGES */}
          {activeTab === 'dashboard' && (
            <DashboardPage
              stats={stats}
              recentComplaints={complaints}
              onRaiseNewClick={() => setActiveTab('raise')}
              onViewAllClick={() => setActiveTab('my-complaints')}
              onTrackComplaint={(id) => {
                setSelectedComplaintId(id);
                setActiveTab('status');
              }}
              onOpenHelpModal={() => setIsHelpModalOpen(true)}
            />
          )}

          {activeTab === 'raise' && (
            <RaiseComplaintPage
              onSubmit={handleRaiseComplaintSubmit}
              onCancel={() => setActiveTab('dashboard')}
            />
          )}

          {activeTab === 'my-complaints' && (
            <MyComplaintsPage
              complaints={complaints}
              onViewComplaint={(id) => {
                setSelectedComplaintId(id);
                setActiveTab('status');
              }}
            />
          )}

          {activeTab === 'status' && currentComplaint && (
            <ComplaintTrackingPage
              complaint={currentComplaint}
              onBack={() => setActiveTab('my-complaints')}
              onAddRemark={handleAddRemark}
            />
          )}

          {/* MODERATOR MODULE PAGES */}
          {activeTab === 'mod-dashboard' && (
            <ModeratorDashboardPage
              onNavigateTab={setActiveTab}
              addToast={addToast}
            />
          )}

          {activeTab === 'mod-pending' && (
            <PendingApprovalsPage addToast={addToast} />
          )}

          {activeTab === 'mod-approved' && (
            <ApprovedComplaintsPage addToast={addToast} />
          )}

          {activeTab === 'mod-rejected' && (
            <RejectedComplaintsPage addToast={addToast} />
          )}

          {activeTab === 'mod-profile' && (
            <ModeratorProfilePage addToast={addToast} />
          )}

          {/* STAFF MODULE PAGES */}
          {activeTab === 'staff-dashboard' && (
            <StaffDashboardPage
              onNavigateTab={handleStaffNavigateTab}
              addToast={addToast}
            />
          )}

          {activeTab === 'staff-assigned' && (
            <AssignedComplaintsPage
              onSelectComplaint={(id) => handleStaffNavigateTab('staff-investigation', id)}
              addToast={addToast}
            />
          )}

          {activeTab === 'staff-investigation' && (
            <InvestigationPage
              complaintId={staffSelectedComplaintId}
              onBack={() => setActiveTab('staff-assigned')}
              onNavigateTab={handleStaffNavigateTab}
              addToast={addToast}
            />
          )}

          {activeTab === 'staff-progress' && (
            <ProgressUpdatesPage
              preselectedComplaintId={staffSelectedComplaintId}
              onNavigateTab={handleStaffNavigateTab}
              addToast={addToast}
            />
          )}

          {activeTab === 'staff-evidence' && (
            <EvidenceUploadPage
              preselectedComplaintId={staffSelectedComplaintId}
              onNavigateTab={handleStaffNavigateTab}
              addToast={addToast}
            />
          )}

          {activeTab === 'staff-resolution' && (
            <ResolutionPage
              preselectedComplaintId={staffSelectedComplaintId}
              onNavigateTab={handleStaffNavigateTab}
              addToast={addToast}
            />
          )}

          {activeTab === 'staff-history' && (
            <WorkHistoryPage
              onSelectComplaint={(id) => handleStaffNavigateTab('staff-investigation', id)}
              addToast={addToast}
            />
          )}

          {activeTab === 'staff-profile' && (
            <StaffProfilePage addToast={addToast} />
          )}

          {/* SHARED PAGES */}
          {(activeTab === 'notifications' || activeTab === 'mod-notifications' || activeTab === 'staff-notifications') && (
            <NotificationsPage
              notifications={notifications}
              unreadCount={unreadCount}
              onMarkRead={(id) => handleNotificationClick(id)}
              onMarkAllRead={handleMarkAllRead}
              onDelete={handleDeleteNotification}
              onSelectComplaint={(id) => {
                if (activeRole === 'staff') {
                  handleStaffNavigateTab('staff-investigation', id);
                } else if (activeRole === 'moderator') {
                  setSelectedComplaintId(id);
                  setActiveTab('mod-pending');
                } else {
                  setSelectedComplaintId(id);
                  setActiveTab('status');
                }
              }}
            />
          )}

          {activeTab === 'profile' && <ProfilePage user={user} onUpdateProfile={handleUpdateProfile} />}

          {activeTab === 'api-docs' && <ApiDocsPage />}
        </main>
      </div>

      {/* Help / Contact Support Modal */}
      <Modal isOpen={isHelpModalOpen} onClose={() => setIsHelpModalOpen(false)} title="Campus Redressal Help Desk">
        <div className="space-y-4 text-xs">
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-800">Student Grievance Cell</p>
              <p className="text-slate-600 mt-0.5">
                For urgent emergencies regarding safety, hostel, or water supply, contact the campus helpline directly.
              </p>
            </div>
          </div>

          <div className="space-y-2 text-slate-700">
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-purple-600" />
              <span className="font-semibold">Toll-Free Helpline:</span>
              <span className="font-mono">+91 1800 425 9999</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-600" />
              <span className="font-semibold">Email Support:</span>
              <span>grievance@bitsathy.ac.in</span>
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              onClick={() => setIsHelpModalOpen(false)}
              className="px-4 py-2 bg-purple-700 text-white font-semibold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Confirm Logout">
        <div className="space-y-4 text-xs text-slate-700">
          <p>Are you sure you want to log out of Campus Voice User Module?</p>
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              onClick={() => setIsLogoutModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                setIsLogoutModalOpen(false);
                setIsLoggedOut(true);
              }}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span>Yes, Logout</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
