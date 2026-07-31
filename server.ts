import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { createServer as createViteServer } from 'vite';
import { db } from './server/models/data';
import { openApiSpec, generatePostmanCollection } from './server/swagger';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure upload directory
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/\s+/g, '_'));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowed = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, JPEG, and PDF are allowed.'));
    }
  }
});

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// =========================================
// API ENDPOINTS (MVC Routes with Firestore)
// =========================================

// 1. Complaint APIs
app.get('/api/complaints', async (req: Request, res: Response) => {
  try {
    const { status, department, search } = req.query;
    const list = await db.getComplaints({
      status: status as string,
      department: department as string,
      search: search as string
    });
    res.json({
      success: true,
      data: list,
      count: list.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/complaints/stats', async (req: Request, res: Response) => {
  try {
    const stats = await db.getStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/complaints/:id', async (req: Request, res: Response) => {
  try {
    const complaint = await db.getComplaintById(req.params.id);
    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }
    res.json({
      success: true,
      data: complaint
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/complaints', async (req: Request, res: Response) => {
  try {
    await db.clearAllComplaints();
    res.json({ success: true, message: 'All grievances removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/complaints/clear', async (req: Request, res: Response) => {
  try {
    await db.clearAllComplaints();
    res.json({ success: true, message: 'All grievances removed successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/complaints', (req: Request, res: Response, next) => {
  upload.array('supportingFiles', 5)(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message || 'File upload error'
      });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const { department, category, subject, description, priority, location } = req.body;

    if (!department || !category || !subject || !description) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: department, category, subject, description are mandatory.'
      });
      return;
    }

    const files = req.files as Express.Multer.File[];
    const attachments = (files || []).map((f, i) => ({
      id: `att-${Date.now()}-${i}`,
      name: f.originalname,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      type: f.mimetype,
      url: `/uploads/${f.filename}`
    }));

    const created = await db.addComplaint({
      department,
      category,
      subject,
      description,
      priority: (priority as 'Low' | 'Medium' | 'High') || 'Medium',
      location: location || '',
      attachments
    });

    res.status(201).json({
      success: true,
      message: 'Complaint raised successfully',
      data: created
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error creating complaint' });
  }
});

app.post('/api/complaints/:id/remarks', async (req: Request, res: Response) => {
  try {
    const { text, author } = req.body;
    if (!text) {
      res.status(400).json({ success: false, message: 'Remark text is required' });
      return;
    }

    const remark = await db.addRemark(req.params.id, text, author);
    if (!remark) {
      res.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Remark added successfully',
      data: remark
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. Notification APIs
app.get('/api/notifications', async (req: Request, res: Response) => {
  try {
    const filter = (req.query.filter as any) || 'all';
    const list = await db.getNotifications(filter);
    const unread = await db.getNotifications('unread');
    res.json({
      success: true,
      data: list,
      unreadCount: unread.length
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/notifications/:id/read', async (req: Request, res: Response) => {
  try {
    const updated = await db.markNotificationRead(req.params.id);
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.patch('/api/notifications/read-all', async (req: Request, res: Response) => {
  try {
    await db.markAllNotificationsRead();
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.delete('/api/notifications/:id', async (req: Request, res: Response) => {
  try {
    await db.deleteNotification(req.params.id);
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. User Profile APIs
app.get('/api/profile', async (req: Request, res: Response) => {
  try {
    const profile = await db.getProfile();
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/profile', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateProfile(req.body);
    res.json({ success: true, message: 'Profile updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================
// MODERATOR MODULE API ENDPOINTS
// =========================================

app.get('/api/moderator/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await db.getModeratorStats();
    const pendingList = await db.getPendingComplaints();
    const allComplaints = await db.getComplaints();
    const recentActivity = allComplaints.slice(0, 5);
    res.json({
      success: true,
      data: {
        stats,
        pendingApprovals: pendingList,
        recentActivity
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/moderator/pending', async (req: Request, res: Response) => {
  try {
    const list = await db.getPendingComplaints();
    res.json({ success: true, data: list, count: list.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/moderator/approved', async (req: Request, res: Response) => {
  try {
    const list = await db.getApprovedComplaints();
    res.json({ success: true, data: list, count: list.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/moderator/rejected', async (req: Request, res: Response) => {
  try {
    const list = await db.getRejectedComplaints();
    res.json({ success: true, data: list, count: list.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/moderator/complaints/:id/approve', async (req: Request, res: Response) => {
  try {
    const { remark, department } = req.body;
    const updated = await db.approveComplaint(req.params.id, remark, department);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }
    res.json({ success: true, message: 'Complaint approved and assigned successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/moderator/complaints/:id/reject', async (req: Request, res: Response) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      res.status(400).json({ success: false, message: 'Rejection reason is required' });
      return;
    }
    const updated = await db.rejectComplaint(req.params.id, reason);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }
    res.json({ success: true, message: 'Complaint rejected successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/moderator/profile', async (req: Request, res: Response) => {
  try {
    const profile = await db.getModeratorProfile();
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/moderator/profile', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateModeratorProfile(req.body);
    res.json({ success: true, message: 'Moderator profile updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =========================================
// STAFF MODULE API ENDPOINTS
// =========================================

app.get('/api/staff/profile', async (req: Request, res: Response) => {
  try {
    const profile = await db.getStaffProfile();
    res.json({ success: true, data: profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/staff/profile', async (req: Request, res: Response) => {
  try {
    const updated = await db.updateStaffProfile(req.body);
    res.json({ success: true, message: 'Staff profile updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/staff/dashboard', async (req: Request, res: Response) => {
  try {
    const stats = await db.getStaffDashboardStats();
    const assignedComplaints = await db.getStaffAssignedComplaints();
    res.json({
      success: true,
      data: {
        stats,
        recentAssignments: assignedComplaints.slice(0, 5),
        allAssigned: assignedComplaints
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/staff/assigned', async (req: Request, res: Response) => {
  try {
    const list = await db.getStaffAssignedComplaints();
    res.json({ success: true, data: list, count: list.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/staff/complaints/:id/accept', async (req: Request, res: Response) => {
  try {
    const updated = await db.acceptStaffAssignment(req.params.id);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }
    res.json({ success: true, message: 'Assignment accepted successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.put('/api/staff/complaints/:id/progress', async (req: Request, res: Response) => {
  try {
    const { status, progressRemarks, estimatedCompletionDate } = req.body;
    const updated = await db.updateComplaintProgress(req.params.id, {
      status,
      progressRemarks,
      estimatedCompletionDate
    });
    if (!updated) {
      res.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }
    res.json({ success: true, message: 'Complaint progress updated successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/staff/complaints/:id/evidence', (req: Request, res: Response, next) => {
  upload.array('evidenceFiles', 5)(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ success: false, message: err.message || 'Evidence file upload error' });
    }
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, message: 'No evidence files uploaded' });
      return;
    }

    const evidenceAttachments = files.map((f, i) => ({
      id: `evid-${Date.now()}-${i}`,
      name: f.originalname,
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      type: f.mimetype,
      url: `/uploads/${f.filename}`
    }));

    const updated = await db.addEvidenceFiles(req.params.id, evidenceAttachments);
    if (!updated) {
      res.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }

    res.json({ success: true, message: 'Evidence proof uploaded successfully', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post('/api/staff/complaints/:id/resolve', (req: Request, res: Response, next) => {
  upload.array('evidenceFiles', 5)(req, res, (err: any) => {
    // If upload error occurs or if standard json request, continue
    next();
  });
}, async (req: Request, res: Response) => {
  try {
    const { resolutionSummary, actionsTaken, finalRemarks, completionDate } = req.body;
    
    let evidenceAttachments: any[] = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const files = req.files as Express.Multer.File[];
      evidenceAttachments = files.map((f, i) => ({
        id: `evid-${Date.now()}-${i}`,
        name: f.originalname,
        size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        type: f.mimetype,
        url: `/uploads/${f.filename}`
      }));
    }

    const updated = await db.submitComplaintResolution(req.params.id, {
      summary: resolutionSummary,
      actionsTaken,
      finalRemarks,
      completionDate,
      evidenceFiles: evidenceAttachments
    });

    if (!updated) {
      res.status(404).json({ success: false, message: 'Complaint not found' });
      return;
    }
    res.json({ success: true, message: 'Grievance resolved successfully with image proof evidence', data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/api/staff/history', async (req: Request, res: Response) => {
  try {
    const history = await db.getStaffWorkHistory();
    res.json({ success: true, data: history, count: history.length });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 4. OpenAPI & Postman Documentation Routes
app.get('/api/openapi.json', (req: Request, res: Response) => {
  res.json(openApiSpec);
});

app.get('/api/postman-collection', (req: Request, res: Response) => {
  const collection = generatePostmanCollection();
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', 'attachment; filename="Campus_Voice_API_Postman_Collection.json"');
  res.json(collection);
});

// Start Server helper
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
