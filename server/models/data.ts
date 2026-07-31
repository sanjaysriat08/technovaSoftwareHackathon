import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  writeBatch
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

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

export type ComplaintStatus = 'In Progress' | 'Resolved' | 'Rejected' | 'Under Review' | 'Submitted';
export type PriorityLevel = 'Low' | 'Medium' | 'High';

export interface ResolutionDetails {
  summary?: string;
  actionsTaken?: string;
  finalRemarks?: string;
  completionDate?: string;
  estimatedCompletionDate?: string;
  actionTaken?: string;
  rootCause?: string;
  preventiveMeasures?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  satisfactionRating?: number;
}

export interface Complaint {
  id: string;
  complaintId: string; // e.g., CMP-2026-0123
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
  timeline: TimelineStage[];
  remarks: Remark[];
  assignedStaffId?: string;
  assignedStaffName?: string;
  acceptedAt?: string;
  resolutionDetails?: ResolutionDetails;
  evidenceFiles?: Attachment[];
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

export interface StaffStats {
  assignedComplaints: number;
  inProgress: number;
  resolvedToday: number;
  pendingUpdates: number;
  reopenedCount?: number;
  totalAssigned?: number;
}

// Initial Mock Seed Data
export const seedProfile: UserProfile = {
  id: 'student_profile',
  fullName: 'Arjun Kumar',
  email: 'arjun.kumar@bitsathy.ac.in',
  phone: '+91 98765 43210',
  rollNo: '22BIT045',
  department: 'Information Technology',
  yearSemester: '2nd Year / 3rd Semester',
  registerNumber: '22BIT045',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
};

export const seedModeratorProfile: ModeratorProfile = {
  id: 'moderator_profile',
  fullName: 'Dr. Ramesh V',
  email: 'ramesh.v@bitsathy.ac.in',
  phone: '+91 94432 10987',
  role: 'Chief Grievance Moderator & Student Welfare Officer',
  department: 'Academic & Student Welfare Cell',
  employeeId: 'EMP-MOD-2021',
  officeLocation: 'Admin Block, Room 104',
  avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
};

export const seedStaffProfile: StaffProfile = {
  id: 'staff_profile',
  fullName: 'Mr. Arun Kumar',
  email: 'arunkumar.m@bitsathy.ac.in',
  phone: '+91 98765 43210',
  department: 'Maintenance Staff',
  designation: 'Senior Maintenance Engineer',
  employeeId: 'EMP-2026-8801',
  officeLocation: 'Estate Maintenance Wing, Block C',
  avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
};

export const seedComplaints: Complaint[] = [];

export const seedNotifications: NotificationItem[] = [];

// Initialize Firebase Firestore connection
let firestoreDb: any = null;

try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    const databaseId = firebaseConfig.firestoreDatabaseId || undefined;
    firestoreDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
    console.log('🔥 Connected to Firebase Firestore database:', databaseId || '(default)');
  }
} catch (err) {
  console.error('Failed to initialize Firebase Firestore:', err);
}

function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(cleanForFirestore) as unknown as T;
  }
  const cleaned: any = {};
  for (const [key, value] of Object.entries(obj as any)) {
    if (value !== undefined) {
      cleaned[key] = cleanForFirestore(value);
    }
  }
  return cleaned as T;
}

export class FirestoreDataStore {
  private localComplaints: Complaint[] = [...seedComplaints];
  private localNotifications: NotificationItem[] = [...seedNotifications];
  private localProfile: UserProfile = { ...seedProfile };
  private localModeratorProfile: ModeratorProfile = { ...seedModeratorProfile };
  private localStaffProfile: StaffProfile = { ...seedStaffProfile };
  private initialized = false;

  private async ensureInitialized() {
    if (this.initialized) return;
    this.initialized = true;

    this.localComplaints = [];
    this.localNotifications = [];

    if (firestoreDb) {
      try {
        // Clear all existing documents in complaints and notifications to allow fresh manual input
        const snapComplaints = await getDocs(collection(firestoreDb, 'complaints'));
        for (const docSnap of snapComplaints.docs) {
          await deleteDoc(docSnap.ref);
        }
        const snapNotifs = await getDocs(collection(firestoreDb, 'notifications'));
        for (const docSnap of snapNotifs.docs) {
          await deleteDoc(docSnap.ref);
        }

        // Ensure default profiles exist
        await setDoc(doc(firestoreDb, 'profiles', 'student_profile'), cleanForFirestore(seedProfile));
        await setDoc(doc(firestoreDb, 'profiles', 'moderator_profile'), cleanForFirestore(seedModeratorProfile));
        await setDoc(doc(firestoreDb, 'profiles', 'staff_profile'), cleanForFirestore(seedStaffProfile));
        console.log('✅ Cleared all previous grievances and initialized clean database state.');
      } catch (err) {
        console.error('Error initializing clean Firestore state:', err);
      }
    }
  }

  async clearAllComplaints(): Promise<boolean> {
    this.localComplaints = [];
    this.localNotifications = [];
    if (firestoreDb) {
      try {
        const snapComplaints = await getDocs(collection(firestoreDb, 'complaints'));
        for (const docSnap of snapComplaints.docs) {
          await deleteDoc(docSnap.ref);
        }
        const snapNotifs = await getDocs(collection(firestoreDb, 'notifications'));
        for (const docSnap of snapNotifs.docs) {
          await deleteDoc(docSnap.ref);
        }
        console.log('🧹 Purged all grievances and notifications from Firestore.');
      } catch (err) {
        console.error('Error clearing complaints from Firestore:', err);
      }
    }
    return true;
  }

  // Complaints CRUD
  async getComplaints(filter?: { status?: string; department?: string; search?: string }): Promise<Complaint[]> {
    await this.ensureInitialized();
    let list: Complaint[] = [];

    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'complaints'));
        snap.forEach((d) => list.push(d.data() as Complaint));
      } catch (err) {
        console.error('Error fetching complaints from Firestore:', err);
        list = [...this.localComplaints];
      }
    } else {
      list = [...this.localComplaints];
    }

    if (filter) {
      if (filter.status && filter.status !== 'All') {
        list = list.filter((c) => c.status.toLowerCase() === filter.status!.toLowerCase());
      }
      if (filter.department && filter.department !== 'All Departments') {
        list = list.filter((c) => c.department.toLowerCase().includes(filter.department!.toLowerCase()));
      }
      if (filter.search) {
        const q = filter.search.toLowerCase();
        list = list.filter(
          (c) =>
            c.subject.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.complaintId.toLowerCase().includes(q) ||
            c.department.toLowerCase().includes(q)
        );
      }
    }

    return list;
  }

  async getComplaintById(idOrCode: string): Promise<Complaint | null> {
    const list = await this.getComplaints();
    return list.find((c) => c.id === idOrCode || c.complaintId === idOrCode) || null;
  }

  async addComplaint(data: {
    department: string;
    category: string;
    subject: string;
    description: string;
    priority: PriorityLevel;
    location?: string;
    attachments?: Attachment[];
  }): Promise<Complaint> {
    await this.ensureInitialized();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newId = Date.now().toString();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const complaintId = `CMP-2026-${randomNum}`;

    const newComplaint: Complaint = {
      id: newId,
      complaintId,
      subject: data.subject,
      department: data.department,
      category: data.category,
      priority: data.priority,
      status: 'Submitted',
      description: data.description,
      location: data.location || '',
      submittedOn: dateStr,
      submittedTime: timeStr,
      lastUpdated: dateStr,
      attachments: data.attachments || [],
      timeline: [
        {
          id: `stage-${Date.now()}-1`,
          title: 'Complaint Logged',
          description: `Submitted by ${this.localProfile.fullName}. Pending moderator verification.`,
          status: 'in_progress',
          date: dateStr,
          time: timeStr,
          actor: this.localProfile.fullName
        },
        {
          id: `stage-${Date.now()}-2`,
          title: 'Moderator Verification',
          description: 'Awaiting review and approval by Chief Moderator.',
          status: 'pending'
        }
      ],
      remarks: []
    };

    // Always maintain local memory state
    this.localComplaints.unshift(newComplaint);

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'complaints', newId), cleanForFirestore(newComplaint));

        // Add Notification
        const notifId = `notif-${Date.now()}`;
        const newNotif: NotificationItem = {
          id: notifId,
          title: 'Complaint Registered',
          message: `Your complaint ${complaintId} (${data.subject}) has been logged and sent to the Moderator.`,
          type: 'submitted',
          timestamp: 'Just now',
          read: false,
          important: false,
          complaintId
        };
        this.localNotifications.unshift(newNotif);
        await setDoc(doc(firestoreDb, 'notifications', notifId), cleanForFirestore(newNotif));
      } catch (err) {
        console.error('Error adding complaint to Firestore:', err);
      }
    }

    return newComplaint;
  }

  async addRemark(idOrCode: string, text: string, author?: string): Promise<Remark | null> {
    const complaint = await this.getComplaintById(idOrCode);
    if (!complaint) return null;

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    const newRemark: Remark = {
      id: `rem-${Date.now()}`,
      author: author || this.localProfile.fullName,
      role: 'Student / Complainant',
      text,
      timestamp: `${dateStr}, ${timeStr}`,
      isSystem: false
    };

    complaint.remarks.push(newRemark);
    complaint.lastUpdated = dateStr;

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'complaints', complaint.id), cleanForFirestore(complaint));
      } catch (err) {
        console.error('Error updating complaint remark in Firestore:', err);
      }
    }

    return newRemark;
  }

  async getStats() {
    const list = await this.getComplaints();
    const total = list.length;
    const inProgress = list.filter((c) => c.status === 'In Progress' || c.status === 'Under Review').length;
    const resolved = list.filter((c) => c.status === 'Resolved').length;
    const rejected = list.filter((c) => c.status === 'Rejected').length;

    return { total, inProgress, resolved, rejected };
  }

  // Notifications CRUD
  async getNotifications(filter: 'all' | 'unread' | 'read' | 'important' = 'all'): Promise<NotificationItem[]> {
    await this.ensureInitialized();
    let list: NotificationItem[] = [];

    if (firestoreDb) {
      try {
        const snap = await getDocs(collection(firestoreDb, 'notifications'));
        snap.forEach((d) => list.push(d.data() as NotificationItem));
      } catch (err) {
        console.error('Error fetching notifications from Firestore:', err);
        list = [...this.localNotifications];
      }
    } else {
      list = [...this.localNotifications];
    }

    if (filter === 'unread') return list.filter((n) => !n.read);
    if (filter === 'read') return list.filter((n) => n.read);
    if (filter === 'important') return list.filter((n) => n.important);
    return list;
  }

  async markNotificationRead(id: string): Promise<NotificationItem | null> {
    const list = await this.getNotifications();
    const notif = list.find((n) => n.id === id);
    if (!notif) return null;

    notif.read = true;
    if (firestoreDb) {
      try {
        await updateDoc(doc(firestoreDb, 'notifications', id), { read: true });
      } catch (err) {
        console.error('Error marking notification read in Firestore:', err);
      }
    }
    return notif;
  }

  async markAllNotificationsRead(): Promise<boolean> {
    const list = await this.getNotifications('unread');
    if (firestoreDb) {
      try {
        for (const notif of list) {
          await updateDoc(doc(firestoreDb, 'notifications', notif.id), { read: true });
        }
      } catch (err) {
        console.error('Error marking all notifications read in Firestore:', err);
      }
    }
    return true;
  }

  async deleteNotification(id: string): Promise<boolean> {
    if (firestoreDb) {
      try {
        await deleteDoc(doc(firestoreDb, 'notifications', id));
      } catch (err) {
        console.error('Error deleting notification from Firestore:', err);
      }
    } else {
      this.localNotifications = this.localNotifications.filter((n) => n.id !== id);
    }
    return true;
  }

  // Profile Management
  async getProfile(): Promise<UserProfile> {
    await this.ensureInitialized();
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'profiles', 'student_profile');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as UserProfile;
        }
      } catch (err) {
        console.error('Error fetching student profile from Firestore:', err);
      }
    }
    return this.localProfile;
  }

  async updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
    const current = await this.getProfile();
    const updated = { ...current, ...data };
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'profiles', 'student_profile'), updated);
      } catch (err) {
        console.error('Error updating student profile in Firestore:', err);
      }
    }
    this.localProfile = updated;
    return updated;
  }

  // Moderator Module Methods
  async getModeratorStats() {
    const list = await this.getComplaints();
    const pendingApprovals = list.filter((c) => c.status === 'Submitted' || c.status === 'Under Review').length;
    const approvedCount = list.filter((c) => c.status === 'In Progress' || c.status === 'Resolved').length;
    const rejectedCount = list.filter((c) => c.status === 'Rejected').length;
    const resolvedThisMonth = list.filter((c) => c.status === 'Resolved').length;

    return {
      totalComplaints: list.length,
      pendingApprovals,
      approvedToday: approvedCount,
      rejectedToday: rejectedCount,
      resolvedThisMonth
    };
  }

  async getPendingComplaints(): Promise<Complaint[]> {
    const list = await this.getComplaints();
    return list.filter((c) => c.status === 'Submitted' || c.status === 'Under Review');
  }

  async getApprovedComplaints(): Promise<Complaint[]> {
    const list = await this.getComplaints();
    return list.filter((c) => c.status === 'In Progress' || c.status === 'Resolved');
  }

  async getRejectedComplaints(): Promise<Complaint[]> {
    const list = await this.getComplaints();
    return list.filter((c) => c.status === 'Rejected');
  }

  async approveComplaint(idOrCode: string, remarkText?: string, department?: string): Promise<Complaint | null> {
    const complaint = await this.getComplaintById(idOrCode);
    if (!complaint) return null;

    const modProf = await this.getModeratorProfile();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (department) {
      complaint.department = department;
    }
    complaint.status = 'In Progress';
    complaint.lastUpdated = dateStr;

    complaint.timeline.unshift({
      id: `stage-${Date.now()}-mod-appr`,
      title: 'Approved by Moderator',
      description: `Verified & approved by ${modProf.fullName}. Route: ${complaint.department}`,
      status: 'completed',
      date: dateStr,
      time: timeStr,
      actor: modProf.fullName
    });

    const remarkContent = remarkText || `Complaint verified and approved for action by ${complaint.department}.`;
    complaint.remarks.push({
      id: `rem-${Date.now()}`,
      author: modProf.fullName,
      role: 'Chief Moderator',
      text: remarkContent,
      timestamp: `${dateStr}, ${timeStr}`,
      isSystem: false
    });

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'complaints', complaint.id), cleanForFirestore(complaint));

        // Add Notification
        const notifId = `notif-${Date.now()}`;
        const newNotif: NotificationItem = {
          id: notifId,
          title: 'Complaint Approved by Moderator',
          message: `Complaint ${complaint.complaintId} (${complaint.subject}) has been approved and assigned to ${complaint.department}.`,
          type: 'assigned',
          timestamp: 'Just now',
          read: false,
          important: true,
          complaintId: complaint.complaintId
        };
        this.localNotifications.unshift(newNotif);
        await setDoc(doc(firestoreDb, 'notifications', notifId), cleanForFirestore(newNotif));
      } catch (err) {
        console.error('Error approving complaint in Firestore:', err);
      }
    }

    return complaint;
  }

  async rejectComplaint(idOrCode: string, reasonText: string): Promise<Complaint | null> {
    const complaint = await this.getComplaintById(idOrCode);
    if (!complaint) return null;

    const modProf = await this.getModeratorProfile();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    complaint.status = 'Rejected';
    complaint.lastUpdated = dateStr;

    complaint.timeline.unshift({
      id: `stage-${Date.now()}-mod-rej`,
      title: 'Rejected by Moderator',
      description: `Reason: ${reasonText}`,
      status: 'completed',
      date: dateStr,
      time: timeStr,
      actor: modProf.fullName
    });

    complaint.remarks.push({
      id: `rem-${Date.now()}`,
      author: modProf.fullName,
      role: 'Chief Moderator',
      text: `Rejection Notice: ${reasonText}`,
      timestamp: `${dateStr}, ${timeStr}`,
      isSystem: false
    });

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'complaints', complaint.id), cleanForFirestore(complaint));

        // Add Notification
        const notifId = `notif-${Date.now()}`;
        const newNotif: NotificationItem = {
          id: notifId,
          title: 'Complaint Rejected by Moderator',
          message: `Complaint ${complaint.complaintId} was rejected. Reason: ${reasonText}`,
          type: 'system',
          timestamp: 'Just now',
          read: false,
          important: true,
          complaintId: complaint.complaintId
        };
        this.localNotifications.unshift(newNotif);
        await setDoc(doc(firestoreDb, 'notifications', notifId), cleanForFirestore(newNotif));
      } catch (err) {
        console.error('Error rejecting complaint in Firestore:', err);
      }
    }

    return complaint;
  }

  async getModeratorProfile(): Promise<ModeratorProfile> {
    await this.ensureInitialized();
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'profiles', 'moderator_profile');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as ModeratorProfile;
        }
      } catch (err) {
        console.error('Error fetching moderator profile from Firestore:', err);
      }
    }
    return this.localModeratorProfile;
  }

  async updateModeratorProfile(data: Partial<ModeratorProfile>): Promise<ModeratorProfile> {
    const current = await this.getModeratorProfile();
    const updated = { ...current, ...data };
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'profiles', 'moderator_profile'), updated);
      } catch (err) {
        console.error('Error updating moderator profile in Firestore:', err);
      }
    }
    this.localModeratorProfile = updated;
    return updated;
  }

  // =========================================
  // STAFF MODULE METHODS
  // =========================================

  async getStaffProfile(): Promise<StaffProfile> {
    await this.ensureInitialized();
    if (firestoreDb) {
      try {
        const docRef = doc(firestoreDb, 'profiles', 'staff_profile');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          return snap.data() as StaffProfile;
        }
      } catch (err) {
        console.error('Error fetching staff profile from Firestore:', err);
      }
    }
    return this.localStaffProfile;
  }

  async updateStaffProfile(data: Partial<StaffProfile>): Promise<StaffProfile> {
    const current = await this.getStaffProfile();
    const updated = { ...current, ...data };
    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'profiles', 'staff_profile'), cleanForFirestore(updated));
      } catch (err) {
        console.error('Error updating staff profile in Firestore:', err);
      }
    }
    this.localStaffProfile = updated;
    return updated;
  }

  async getStaffAssignedComplaints(): Promise<Complaint[]> {
    const all = await this.getComplaints();
    // Staff receives complaints that are assigned, in progress, under review or resolved
    return all.filter((c) => c.status !== 'Rejected');
  }

  async getStaffDashboardStats(): Promise<StaffStats> {
    const list = await this.getStaffAssignedComplaints();
    const assignedComplaints = list.filter((c) => c.status === 'Under Review' || c.status === 'Submitted').length;
    const inProgress = list.filter((c) => c.status === 'In Progress').length;
    const resolvedToday = list.filter((c) => c.status === 'Resolved').length;
    const pendingUpdates = list.filter((c) => c.status === 'In Progress' && (!c.remarks || c.remarks.length < 2)).length;
    const reopenedCount = list.filter((c) => c.status === 'Under Review').length;

    return {
      assignedComplaints: assignedComplaints || list.length,
      inProgress,
      resolvedToday,
      pendingUpdates,
      reopenedCount,
      totalAssigned: list.length,
    };
  }

  async acceptStaffAssignment(idOrCode: string): Promise<Complaint | null> {
    const complaint = await this.getComplaintById(idOrCode);
    if (!complaint) return null;

    const staffProf = await this.getStaffProfile();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    complaint.status = 'In Progress';
    complaint.assignedStaffId = staffProf.employeeId;
    complaint.assignedStaffName = staffProf.fullName;
    complaint.acceptedAt = `${dateStr}, ${timeStr}`;
    complaint.lastUpdated = dateStr;

    complaint.timeline.unshift({
      id: `stage-${Date.now()}-staff-acc`,
      title: 'Assignment Accepted by Staff',
      description: `Investigating officer ${staffProf.fullName} accepted the task and commenced work on-site.`,
      status: 'in_progress',
      date: dateStr,
      time: timeStr,
      actor: staffProf.fullName
    });

    complaint.remarks.push({
      id: `rem-${Date.now()}`,
      author: staffProf.fullName,
      role: 'Staff Engineer',
      text: `Work started: Assignment accepted by ${staffProf.fullName} (${staffProf.designation}).`,
      timestamp: `${dateStr}, ${timeStr}`,
      isSystem: false
    });

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'complaints', complaint.id), cleanForFirestore(complaint));
      } catch (err) {
        console.error('Error accepting complaint in Firestore:', err);
      }
    }

    return complaint;
  }

  async updateComplaintProgress(
    idOrCode: string,
    payload: { status?: ComplaintStatus; progressRemarks?: string; estimatedCompletionDate?: string }
  ): Promise<Complaint | null> {
    const complaint = await this.getComplaintById(idOrCode);
    if (!complaint) return null;

    const staffProf = await this.getStaffProfile();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (payload.status) {
      complaint.status = payload.status;
    }
    complaint.lastUpdated = dateStr;

    if (!complaint.resolutionDetails) {
      complaint.resolutionDetails = {};
    }
    if (payload.estimatedCompletionDate) {
      complaint.resolutionDetails.estimatedCompletionDate = payload.estimatedCompletionDate;
    }

    if (payload.progressRemarks) {
      complaint.remarks.push({
        id: `rem-${Date.now()}`,
        author: staffProf.fullName,
        role: 'Staff Engineer',
        text: `Progress Update: ${payload.progressRemarks}${
          payload.estimatedCompletionDate ? ` (ETA: ${payload.estimatedCompletionDate})` : ''
        }`,
        timestamp: `${dateStr}, ${timeStr}`,
        isSystem: false
      });
    }

    complaint.timeline.unshift({
      id: `stage-${Date.now()}-staff-prog`,
      title: 'Progress Updated',
      description: payload.progressRemarks || 'Technician updated progress state.',
      status: payload.status === 'Resolved' ? 'completed' : 'in_progress',
      date: dateStr,
      time: timeStr,
      actor: staffProf.fullName
    });

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'complaints', complaint.id), cleanForFirestore(complaint));
      } catch (err) {
        console.error('Error updating progress in Firestore:', err);
      }
    }

    return complaint;
  }

  async addEvidenceFiles(idOrCode: string, newEvidenceFiles: Attachment[]): Promise<Complaint | null> {
    const complaint = await this.getComplaintById(idOrCode);
    if (!complaint) return null;

    const staffProf = await this.getStaffProfile();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    if (!complaint.evidenceFiles) {
      complaint.evidenceFiles = [];
    }
    complaint.evidenceFiles.push(...newEvidenceFiles);
    complaint.attachments.push(...newEvidenceFiles);
    complaint.lastUpdated = dateStr;

    complaint.timeline.unshift({
      id: `stage-${Date.now()}-staff-evid`,
      title: 'Evidence Uploaded',
      description: `Uploaded ${newEvidenceFiles.length} photo/document proof(s) for site inspection.`,
      status: 'in_progress',
      date: dateStr,
      time: timeStr,
      actor: staffProf.fullName
    });

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'complaints', complaint.id), cleanForFirestore(complaint));
      } catch (err) {
        console.error('Error adding evidence in Firestore:', err);
      }
    }

    return complaint;
  }

  async submitComplaintResolution(
    idOrCode: string,
    payload: { summary?: string; actionsTaken?: string; finalRemarks?: string; completionDate?: string; evidenceFiles?: Attachment[] }
  ): Promise<Complaint | null> {
    const complaint = await this.getComplaintById(idOrCode);
    if (!complaint) return null;

    const staffProf = await this.getStaffProfile();
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    complaint.status = 'Resolved';
    complaint.lastUpdated = dateStr;

    complaint.resolutionDetails = {
      summary: payload.summary || 'Issue successfully rectified on site.',
      actionsTaken: payload.actionsTaken || 'Conducted inspection and replaced damaged components.',
      finalRemarks: payload.finalRemarks || 'Verified operating standard; issue closed.',
      completionDate: payload.completionDate || dateStr,
    };

    if (payload.evidenceFiles && payload.evidenceFiles.length > 0) {
      if (!complaint.evidenceFiles) {
        complaint.evidenceFiles = [];
      }
      complaint.evidenceFiles.push(...payload.evidenceFiles);
    }

    complaint.timeline.unshift({
      id: `stage-${Date.now()}-staff-res`,
      title: 'Grievance Resolved by Staff',
      description: `Resolution Summary: ${payload.summary || 'Work complete.'}${payload.evidenceFiles && payload.evidenceFiles.length > 0 ? ` (With ${payload.evidenceFiles.length} evidence image proof(s))` : ''}`,
      status: 'completed',
      date: dateStr,
      time: timeStr,
      actor: staffProf.fullName
    });

    complaint.remarks.push({
      id: `rem-${Date.now()}`,
      author: staffProf.fullName,
      role: 'Staff Engineer',
      text: `Final Resolution: ${payload.summary || 'Marked as resolved.'} ${payload.actionsTaken ? `Actions Taken: ${payload.actionsTaken}` : ''}`,
      timestamp: `${dateStr}, ${timeStr}`,
      isSystem: false
    });

    if (firestoreDb) {
      try {
        await setDoc(doc(firestoreDb, 'complaints', complaint.id), cleanForFirestore(complaint));

        // Add Notification
        const notifId = `notif-${Date.now()}`;
        const newNotif: NotificationItem = {
          id: notifId,
          title: 'Complaint Marked as Resolved',
          message: `Complaint ${complaint.complaintId} (${complaint.subject}) has been resolved by ${staffProf.fullName}.`,
          type: 'resolved',
          timestamp: 'Just now',
          read: false,
          important: true,
          complaintId: complaint.complaintId
        };
        this.localNotifications.unshift(newNotif);
        await setDoc(doc(firestoreDb, 'notifications', notifId), cleanForFirestore(newNotif));
      } catch (err) {
        console.error('Error resolving complaint in Firestore:', err);
      }
    }

    return complaint;
  }

  async getStaffWorkHistory(): Promise<Complaint[]> {
    const list = await this.getStaffAssignedComplaints();
    return list.filter((c) => c.status === 'Resolved');
  }
}

export const db = new FirestoreDataStore();
