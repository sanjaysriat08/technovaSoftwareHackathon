import axios from 'axios';
import { Complaint, ComplaintStats, NotificationItem, UserProfile, Remark, ModeratorStats, ModeratorProfile, StaffProfile, StaffStats } from '../types';

const API = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Complaints
  getComplaints: async (params?: { status?: string; department?: string; search?: string }) => {
    const res = await API.get<{ success: boolean; data: Complaint[] }>('/complaints', { params });
    return res.data.data;
  },

  getStats: async () => {
    const res = await API.get<{ success: boolean; data: ComplaintStats }>('/complaints/stats');
    return res.data.data;
  },

  getComplaintById: async (id: string) => {
    const res = await API.get<{ success: boolean; data: Complaint }>(`/complaints/${id}`);
    return res.data.data;
  },

  createComplaint: async (formData: FormData) => {
    const res = await API.post<{ success: boolean; message: string; data: Complaint }>('/complaints', formData);
    return res.data;
  },

  addRemark: async (complaintId: string, text: string) => {
    const res = await API.post<{ success: boolean; data: Remark }>(`/complaints/${complaintId}/remarks`, { text });
    return res.data.data;
  },

  // Notifications
  getNotifications: async (filter: 'all' | 'unread' | 'read' | 'important' = 'all') => {
    const res = await API.get<{ success: boolean; data: NotificationItem[]; unreadCount: number }>('/notifications', {
      params: { filter },
    });
    return res.data;
  },

  markNotificationRead: async (id: string) => {
    const res = await API.patch<{ success: boolean; data: NotificationItem }>(`/notifications/${id}/read`);
    return res.data;
  },

  markAllNotificationsRead: async () => {
    const res = await API.patch<{ success: boolean; message: string }>('/notifications/read-all');
    return res.data;
  },

  deleteNotification: async (id: string) => {
    const res = await API.delete<{ success: boolean }>(`/notifications/${id}`);
    return res.data;
  },

  // Profile
  getProfile: async () => {
    const res = await API.get<{ success: boolean; data: UserProfile }>('/profile');
    return res.data.data;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const res = await API.put<{ success: boolean; data: UserProfile }>('/profile', data);
    return res.data.data;
  },

  // Moderator Module APIs
  getModeratorDashboard: async () => {
    const res = await API.get<{
      success: boolean;
      data: {
        stats: ModeratorStats;
        pendingApprovals: Complaint[];
        recentActivity: Complaint[];
      };
    }>('/moderator/dashboard');
    return res.data.data;
  },

  getPendingApprovals: async () => {
    const res = await API.get<{ success: boolean; data: Complaint[]; count: number }>('/moderator/pending');
    return res.data.data;
  },

  getApprovedComplaints: async () => {
    const res = await API.get<{ success: boolean; data: Complaint[]; count: number }>('/moderator/approved');
    return res.data.data;
  },

  getRejectedComplaints: async () => {
    const res = await API.get<{ success: boolean; data: Complaint[]; count: number }>('/moderator/rejected');
    return res.data.data;
  },

  approveComplaint: async (id: string, payload?: { remark?: string; department?: string }) => {
    const res = await API.put<{ success: boolean; message: string; data: Complaint }>(`/moderator/complaints/${id}/approve`, payload || {});
    return res.data;
  },

  rejectComplaint: async (id: string, reason: string) => {
    const res = await API.put<{ success: boolean; message: string; data: Complaint }>(`/moderator/complaints/${id}/reject`, { reason });
    return res.data;
  },

  getModeratorProfile: async () => {
    const res = await API.get<{ success: boolean; data: ModeratorProfile }>('/moderator/profile');
    return res.data.data;
  },

  updateModeratorProfile: async (data: Partial<ModeratorProfile>) => {
    const res = await API.put<{ success: boolean; data: ModeratorProfile }>('/moderator/profile', data);
    return res.data.data;
  },

  // Staff Module APIs
  getStaffProfile: async () => {
    const res = await API.get<{ success: boolean; data: StaffProfile }>('/staff/profile');
    return res.data.data;
  },

  updateStaffProfile: async (data: Partial<StaffProfile>) => {
    const res = await API.put<{ success: boolean; data: StaffProfile }>('/staff/profile', data);
    return res.data.data;
  },

  getStaffDashboard: async () => {
    const res = await API.get<{
      success: boolean;
      data: {
        stats: StaffStats;
        recentAssignments: Complaint[];
        allAssigned: Complaint[];
      };
    }>('/staff/dashboard');
    return res.data.data;
  },

  getAssignedComplaints: async () => {
    const res = await API.get<{ success: boolean; data: Complaint[]; count: number }>('/staff/assigned');
    return res.data.data;
  },

  acceptAssignment: async (id: string) => {
    const res = await API.post<{ success: boolean; message: string; data: Complaint }>(`/staff/complaints/${id}/accept`);
    return res.data;
  },

  updateComplaintProgress: async (
    id: string,
    payload: { status?: string; progressRemarks?: string; estimatedCompletionDate?: string }
  ) => {
    const res = await API.put<{ success: boolean; message: string; data: Complaint }>(
      `/staff/complaints/${id}/progress`,
      payload
    );
    return res.data;
  },

  uploadEvidence: async (id: string, formData: FormData) => {
    const res = await API.post<{ success: boolean; message: string; data: Complaint }>(
      `/staff/complaints/${id}/evidence`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return res.data;
  },

  submitResolution: async (
    id: string,
    payload: FormData | { resolutionSummary?: string; actionsTaken?: string; finalRemarks?: string; completionDate?: string }
  ) => {
    let res;
    if (payload instanceof FormData) {
      res = await API.post<{ success: boolean; message: string; data: Complaint }>(
        `/staff/complaints/${id}/resolve`,
        payload,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } else {
      res = await API.post<{ success: boolean; message: string; data: Complaint }>(
        `/staff/complaints/${id}/resolve`,
        payload
      );
    }
    return res.data;
  },

  getWorkHistory: async () => {
    const res = await API.get<{ success: boolean; data: Complaint[]; count: number }>('/staff/history');
    return res.data.data;
  },
};
