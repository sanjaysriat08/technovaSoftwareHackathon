export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type ComplaintStatus = 'In Progress' | 'Resolved' | 'Rejected' | 'Under Review' | 'Submitted';

export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  url: string;
}

export interface TimelineStage {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'in_progress' | 'pending';
  date?: string;
  time?: string;
  actor?: string;
}

export interface Remark {
  id: string;
  author: string;
  role: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface ResolutionDetails {
  summary?: string;
  actionsTaken?: string;
  finalRemarks?: string;
  completionDate?: string;
  estimatedCompletionDate?: string;
}

export interface Complaint {
  id: string;
  complaintId: string;
  subject: string;
  department: string;
  category: string;
  priority: PriorityLevel;
  status: ComplaintStatus;
  description: string;
  location?: string;
  submittedOn: string;
  submittedTime: string;
  lastUpdated: string;
  attachments: Attachment[];
  evidenceFiles?: Attachment[];
  resolutionDetails?: ResolutionDetails;
  assignedStaffId?: string;
  assignedStaffName?: string;
  acceptedAt?: string;
  timeline: TimelineStage[];
  remarks: Remark[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'submitted' | 'assigned' | 'updated' | 'resolved' | 'system';
  timestamp: string;
  read: boolean;
  important: boolean;
  complaintId?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  rollNo: string;
  department: string;
  yearSemester: string;
  registerNumber: string;
  avatarUrl: string;
}

export interface ModeratorProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  employeeId: string;
  officeLocation: string;
  avatarUrl: string;
}

export interface StaffProfile {
  id: string;
  fullName: string;
  employeeId: string;
  department: string;
  designation: string;
  email: string;
  phone: string;
  officeLocation?: string;
  avatarUrl: string;
}

export interface ComplaintStats {
  total: number;
  inProgress: number;
  resolved: number;
  rejected: number;
}

export interface ModeratorStats {
  pendingApprovals: number;
  approvedToday: number;
  rejectedToday: number;
  resolvedThisMonth: number;
  totalComplaints?: number;
}

export interface StaffStats {
  assignedComplaints: number;
  inProgress: number;
  resolvedToday: number;
  pendingUpdates: number;
  reopenedCount?: number;
  totalAssigned?: number;
}

export type UserRole = 'student' | 'moderator' | 'staff';

export type StudentTab = 'dashboard' | 'raise' | 'my-complaints' | 'status' | 'notifications' | 'profile' | 'api-docs';
export type ModeratorTab = 'mod-dashboard' | 'mod-pending' | 'mod-approved' | 'mod-rejected' | 'mod-notifications' | 'mod-profile' | 'api-docs';
export type StaffTab = 
  | 'staff-dashboard'
  | 'staff-assigned'
  | 'staff-investigation'
  | 'staff-progress'
  | 'staff-evidence'
  | 'staff-resolution'
  | 'staff-history'
  | 'staff-notifications'
  | 'staff-profile'
  | 'api-docs';

export type ActiveTab = StudentTab | ModeratorTab | StaffTab;
