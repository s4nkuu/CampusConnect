import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import {
  COMPLAINTS_UPLOAD_DIR,
  LOST_FOUND_UPLOAD_DIR,
  MATERIALS_UPLOAD_DIR,
  db,
  seedDatabaseIfEmpty,
} from './db.ts';
import {
  generateSessionToken,
  hashPassword,
  resolveSafeExtension,
  verifyPassword,
} from './auth.ts';
import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_PDF_SIZE_BYTES,
  buildSamplePdfText,
  formatFileSize,
} from '../src/utils/campusLogic.ts';
import type {
  ActivityItem,
  Complaint,
  EmergencyContact,
  LostFoundItem,
  Notice,
  StudyMaterial,
  User,
} from '../src/types/campus.ts';

interface DbUserRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: 'student' | 'admin';
  roll_number: string | null;
  department: string | null;
  semester: string | null;
  phone: string | null;
  joined_at: string;
}

function mapUser(row: DbUserRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    rollNumber: row.roll_number ?? undefined,
    department: row.department ?? undefined,
    semester: row.semester ?? undefined,
    phone: row.phone ?? undefined,
    joinedAt: row.joined_at,
  };
}

function mapLostFound(row: Record<string, unknown>): LostFoundItem {
  return {
    id: String(row.id),
    type: row.type as 'lost' | 'found',
    itemName: String(row.item_name),
    description: String(row.description),
    category: row.category as LostFoundItem['category'],
    location: String(row.location),
    date: String(row.date),
    contactInfo: String(row.contact_info),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    imageExt: row.image_ext ? String(row.image_ext) : undefined,
    status: row.status as 'open' | 'resolved',
    reportedById: String(row.reported_by_id),
    reportedByName: String(row.reported_by_name),
    createdAt: String(row.created_at),
  };
}

function mapComplaint(row: Record<string, unknown>): Complaint {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    category: row.category as Complaint['category'],
    location: String(row.location),
    imageUrl: row.image_url ? String(row.image_url) : undefined,
    imageExt: row.image_ext ? String(row.image_ext) : undefined,
    status: row.status as Complaint['status'],
    submittedDate: String(row.submitted_date),
    studentId: String(row.student_id),
    studentName: String(row.student_name),
    studentRoll: row.student_roll ? String(row.student_roll) : undefined,
    adminNote: row.admin_note ? String(row.admin_note) : undefined,
    updatedAt: String(row.updated_at),
  };
}

function mapNotice(row: Record<string, unknown>): Notice {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    category: row.category as Notice['category'],
    publishedDate: String(row.published_date),
    isImportant: Boolean(row.is_important),
    authorName: String(row.author_name),
  };
}

function mapMaterial(row: Record<string, unknown>): StudyMaterial {
  return {
    id: String(row.id),
    title: String(row.title),
    subject: String(row.subject),
    semester: String(row.semester),
    department: String(row.department),
    materialType: row.material_type as StudyMaterial['materialType'],
    description: String(row.description),
    fileName: String(row.file_name),
    fileExt: row.file_ext ? String(row.file_ext) : 'pdf',
    fileSizeLabel: String(row.file_size_label),
    uploaderId: String(row.uploader_id),
    uploaderName: String(row.uploader_name),
    uploadDate: String(row.upload_date),
    downloads: Number(row.downloads ?? 0),
  };
}

function mapEmergency(row: Record<string, unknown>): EmergencyContact {
  return {
    id: String(row.id),
    category: row.category as EmergencyContact['category'],
    officeName: String(row.office_name),
    contactPerson: String(row.contact_person),
    phone: String(row.phone),
    alternatePhone: row.alternate_phone ? String(row.alternate_phone) : undefined,
    location: String(row.location),
    availability: String(row.availability),
    isSampleData: Boolean(row.is_sample_data),
  };
}

function mapActivity(row: Record<string, unknown>): ActivityItem {
  return {
    id: String(row.id),
    title: String(row.title),
    detail: String(row.detail),
    module: row.module as ActivityItem['module'],
    timestamp: String(row.timestamp),
  };
}

function logActivity(title: string, detail: string, module: ActivityItem['module']): ActivityItem {
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const timestamp = `${dateStr} · ${timeStr}`;
  const id = `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const maxOrderRow = db.prepare('SELECT COALESCE(MAX(created_order), 0) as max_order FROM activities').get() as {
    max_order: number;
  };
  const nextOrder = Number(maxOrderRow.max_order) + 1;
  db.prepare(
    'INSERT INTO activities (id, title, detail, module, timestamp, created_order) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(id, title, detail, module, timestamp, nextOrder);
  return { id, title, detail, module, timestamp };
}

function extractToken(req: express.Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7).trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [key, val] = part.trim().split('=');
      if (key === 'cc_session' && val) {
        return decodeURIComponent(val);
      }
    }
  }
  return null;
}

function getAuthenticatedUser(req: express.Request): User | null {
  const token = extractToken(req);
  if (!token) return null;
  const row = db
    .prepare(
      `SELECT u.* FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ?`
    )
    .get(token) as DbUserRow | undefined;
  return row ? mapUser(row) : null;
}

function createMulterImageUpload(destDir: string) {
  return multer({
    storage: multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, destDir),
      filename: (_req, file, cb) => {
        const ext = resolveSafeExtension(file.originalname, file.mimetype);
        cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
      },
    }),
    limits: { fileSize: MAX_IMAGE_SIZE_BYTES },
    fileFilter: (_req, file, cb) => {
      if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype.toLowerCase())) {
        cb(new Error('Only JPG, PNG, WEBP, or GIF images are allowed.'));
        return;
      }
      cb(null, true);
    },
  });
}

const lostFoundUpload = createMulterImageUpload(LOST_FOUND_UPLOAD_DIR);
const complaintUpload = createMulterImageUpload(COMPLAINTS_UPLOAD_DIR);

const materialUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, MATERIALS_UPLOAD_DIR),
    filename: (_req, file, cb) => {
      const ext = resolveSafeExtension(file.originalname, file.mimetype);
      cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`);
    },
  }),
  limits: { fileSize: MAX_PDF_SIZE_BYTES },
  fileFilter: (_req, file, cb) => {
    const isPdf =
      file.mimetype.toLowerCase() === 'application/pdf' ||
      file.originalname.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      cb(new Error('Only PDF documents (.pdf) are allowed.'));
      return;
    }
    cb(null, true);
  },
});

function createSessionCookieHeader(token: string): string {
  return `cc_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

export function createApiRouter(): express.Router {
  const router = express.Router();

  router.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'campusconnect-api' });
  });

  // --- Auth Routes ---
  router.post('/auth/login', (req, res) => {
    const { email, password, role } = req.body as {
      email?: string;
      password?: string;
      role?: 'student' | 'admin';
    };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }
    const row = db
      .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
      .get(email.trim()) as DbUserRow | undefined;

    if (!row || (role && row.role !== role) || !verifyPassword(password, row.password_hash)) {
      res.status(401).json({ error: 'Invalid credentials.' });
      return;
    }

    const token = generateSessionToken();
    db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)').run(
      token,
      row.id,
      new Date().toISOString()
    );
    res.setHeader('Set-Cookie', createSessionCookieHeader(token));
    res.json({ token, user: mapUser(row) });
  });

  router.post('/auth/demo', (req, res) => {
    const { role } = req.body as { role?: 'student' | 'admin' };
    const targetEmail =
      role === 'admin' ? 'admin@campusconnect.edu' : 'student@campusconnect.edu';
    const row = db
      .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?)')
      .get(targetEmail) as DbUserRow | undefined;

    if (!row) {
      res.status(404).json({ error: 'Demo account not found.' });
      return;
    }
    const token = generateSessionToken();
    db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)').run(
      token,
      row.id,
      new Date().toISOString()
    );
    res.setHeader('Set-Cookie', createSessionCookieHeader(token));
    res.json({ token, user: mapUser(row) });
  });

  router.post('/auth/register', (req, res) => {
    const { name, email, password, rollNumber, department, semester, phone } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      rollNumber?: string;
      department?: string;
      semester?: string;
      phone?: string;
    };

    if (!name || !email || !password || password.length < 6) {
      res.status(400).json({ error: 'Valid name, email, and password (6+ chars) are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = db
      .prepare('SELECT id FROM users WHERE LOWER(email) = LOWER(?)')
      .get(normalizedEmail);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists.' });
      return;
    }

    const id = `stu-${Date.now()}`;
    const joinedAt = new Date().toISOString().slice(0, 10);
    const passwordHash = hashPassword(password);

    db.prepare(
      `INSERT INTO users (id, name, email, password_hash, role, roll_number, department, semester, phone, joined_at)
       VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, ?)`
    ).run(
      id,
      name.trim(),
      normalizedEmail,
      passwordHash,
      rollNumber?.trim().toUpperCase() || null,
      department?.trim() || null,
      semester?.trim() || null,
      phone?.trim() || null,
      joinedAt
    );

    const userRow = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(id) as unknown as DbUserRow;
    const token = generateSessionToken();
    db.prepare('INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)').run(
      token,
      id,
      new Date().toISOString()
    );

    logActivity(
      'New Student Registered',
      `${name.trim()} (${department || 'Campus'}) joined CampusConnect`,
      'auth'
    );

    res.setHeader('Set-Cookie', createSessionCookieHeader(token));
    res.status(201).json({ token, user: mapUser(userRow) });
  });

  router.post('/auth/logout', (req, res) => {
    const token = extractToken(req);
    if (token) {
      db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
    }
    res.setHeader('Set-Cookie', 'cc_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
    res.json({ ok: true });
  });

  router.get('/auth/me', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    res.json({ user });
  });

  router.patch('/profile', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated.' });
      return;
    }
    const { name, department, semester, phone, rollNumber } = req.body as {
      name?: string;
      department?: string;
      semester?: string;
      phone?: string;
      rollNumber?: string;
    };

    db.prepare(
      `UPDATE users SET name = ?, department = ?, semester = ?, phone = ?, roll_number = ? WHERE id = ?`
    ).run(
      name?.trim() || user.name,
      department !== undefined ? department.trim() : user.department ?? null,
      semester !== undefined ? semester.trim() : user.semester ?? null,
      phone !== undefined ? phone.trim() : user.phone ?? null,
      rollNumber !== undefined ? rollNumber.trim() : user.rollNumber ?? null,
      user.id
    );

    const updated = db
      .prepare('SELECT * FROM users WHERE id = ?')
      .get(user.id) as unknown as DbUserRow;
    res.json({ user: mapUser(updated) });
  });

  // --- Bootstrap State ---
  router.get('/bootstrap', (req, res) => {
    const user = getAuthenticatedUser(req);

    const lostFoundItems = db
      .prepare('SELECT * FROM lost_found_items ORDER BY created_at DESC')
      .all()
      .map((r) => mapLostFound(r as Record<string, unknown>));

    const complaints = db
      .prepare('SELECT * FROM complaints ORDER BY submitted_date DESC, updated_at DESC')
      .all()
      .map((r) => mapComplaint(r as Record<string, unknown>));

    const notices = db
      .prepare('SELECT * FROM notices ORDER BY is_important DESC, published_date DESC')
      .all()
      .map((r) => mapNotice(r as Record<string, unknown>));

    const materials = db
      .prepare('SELECT * FROM study_materials ORDER BY upload_date DESC')
      .all()
      .map((r) => mapMaterial(r as Record<string, unknown>));

    const emergencyContacts = db
      .prepare('SELECT * FROM emergency_contacts ORDER BY id ASC')
      .all()
      .map((r) => mapEmergency(r as Record<string, unknown>));

    const activities = db
      .prepare('SELECT * FROM activities ORDER BY created_order DESC LIMIT 15')
      .all()
      .map((r) => mapActivity(r as Record<string, unknown>));

    const users =
      user?.role === 'admin'
        ? db
            .prepare('SELECT * FROM users ORDER BY joined_at DESC')
            .all()
            .map((r) => mapUser(r as unknown as DbUserRow))
        : [];

    res.json({
      user,
      users,
      lostFoundItems,
      complaints,
      notices,
      materials,
      emergencyContacts,
      activities,
    });
  });

  // --- Lost & Found ---
  router.get('/lost-found', (_req, res) => {
    const items = db
      .prepare('SELECT * FROM lost_found_items ORDER BY created_at DESC')
      .all()
      .map((r) => mapLostFound(r as Record<string, unknown>));
    res.json({ items });
  });

  router.post('/lost-found', lostFoundUpload.single('image'), (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }

    const { type, itemName, description, category, location, date, contactInfo } = req.body as {
      type?: 'lost' | 'found';
      itemName?: string;
      description?: string;
      category?: string;
      location?: string;
      date?: string;
      contactInfo?: string;
    };

    if (!type || !itemName || !description || !category || !location || !date || !contactInfo) {
      res.status(400).json({ error: 'All required Lost & Found fields must be provided.' });
      return;
    }

    const id = `lf-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const imageUrl = req.file ? `/uploads/lost-found/${req.file.filename}` : null;
    const imageExt = req.file ? path.extname(req.file.filename).replace('.', '') : null;

    db.prepare(
      `INSERT INTO lost_found_items
       (id, type, item_name, description, category, location, date, contact_info, image_url, image_ext, status, reported_by_id, reported_by_name, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?)`
    ).run(
      id,
      type,
      itemName.trim(),
      description.trim(),
      category,
      location.trim(),
      date,
      contactInfo.trim(),
      imageUrl,
      imageExt,
      user.id,
      user.name,
      createdAt
    );

    const createdRow = db
      .prepare('SELECT * FROM lost_found_items WHERE id = ?')
      .get(id) as Record<string, unknown>;
    const activity = logActivity(
      `${type === 'lost' ? 'Lost' : 'Found'} Item Reported: ${itemName.trim()}`,
      `${location.trim()} · Reported by ${user.name}`,
      'lost-found'
    );

    res.status(201).json({ item: mapLostFound(createdRow), activity });
  });

  router.patch('/lost-found/:id/toggle', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const existing = db
      .prepare('SELECT * FROM lost_found_items WHERE id = ?')
      .get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }
    if (user.role !== 'admin' && existing.reported_by_id !== user.id) {
      res.status(403).json({ error: 'Not authorized to modify this item.' });
      return;
    }
    const nextStatus = existing.status === 'resolved' ? 'open' : 'resolved';
    db.prepare('UPDATE lost_found_items SET status = ? WHERE id = ?').run(nextStatus, req.params.id);
    const updated = db
      .prepare('SELECT * FROM lost_found_items WHERE id = ?')
      .get(req.params.id) as Record<string, unknown>;
    res.json({ item: mapLostFound(updated) });
  });

  router.delete('/lost-found/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const existing = db
      .prepare('SELECT * FROM lost_found_items WHERE id = ?')
      .get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }
    if (user.role !== 'admin' && existing.reported_by_id !== user.id) {
      res.status(403).json({ error: 'Not authorized to delete this item.' });
      return;
    }
    if (
      existing.image_url &&
      String(existing.image_url).startsWith('/uploads/lost-found/') &&
      !String(existing.image_url).includes('seed-')
    ) {
      const diskPath = path.join(LOST_FOUND_UPLOAD_DIR, path.basename(String(existing.image_url)));
      if (fs.existsSync(diskPath)) fs.unlinkSync(diskPath);
    }
    db.prepare('DELETE FROM lost_found_items WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });

  // --- Complaints ---
  router.get('/complaints', (_req, res) => {
    const items = db
      .prepare('SELECT * FROM complaints ORDER BY submitted_date DESC, updated_at DESC')
      .all()
      .map((r) => mapComplaint(r as Record<string, unknown>));
    res.json({ complaints: items });
  });

  router.post('/complaints', complaintUpload.single('image'), (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const { title, description, category, location } = req.body as {
      title?: string;
      description?: string;
      category?: string;
      location?: string;
    };
    if (!title || !description || !category || !location) {
      res.status(400).json({ error: 'Title, category, location, and description are required.' });
      return;
    }
    const id = `cmp-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    const imageUrl = req.file ? `/uploads/complaints/${req.file.filename}` : null;
    const imageExt = req.file ? path.extname(req.file.filename).replace('.', '') : null;

    db.prepare(
      `INSERT INTO complaints
       (id, title, description, category, location, image_url, image_ext, status, submitted_date, student_id, student_name, student_roll, admin_note, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?, NULL, ?)`
    ).run(
      id,
      title.trim(),
      description.trim(),
      category,
      location.trim(),
      imageUrl,
      imageExt,
      today,
      user.id,
      user.name,
      user.rollNumber ?? null,
      today
    );

    const created = db
      .prepare('SELECT * FROM complaints WHERE id = ?')
      .get(id) as Record<string, unknown>;
    const activity = logActivity(
      `New ${category} Complaint Submitted`,
      `${title.trim()} · ${location.trim()}`,
      'complaints'
    );
    res.status(201).json({ complaint: mapComplaint(created), activity });
  });

  router.patch('/complaints/:id/status', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }
    const { status, adminNote } = req.body as {
      status?: Complaint['status'];
      adminNote?: string;
    };
    if (!status || !['Pending', 'In Progress', 'Resolved'].includes(status)) {
      res.status(400).json({ error: 'Valid status is required.' });
      return;
    }
    const existing = db
      .prepare('SELECT * FROM complaints WHERE id = ?')
      .get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Complaint not found.' });
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const nextNote = adminNote !== undefined ? adminNote : (existing.admin_note as string | null);

    db.prepare('UPDATE complaints SET status = ?, admin_note = ?, updated_at = ? WHERE id = ?').run(
      status,
      nextNote,
      today,
      req.params.id
    );
    const updated = db
      .prepare('SELECT * FROM complaints WHERE id = ?')
      .get(req.params.id) as Record<string, unknown>;
    const activity = logActivity(
      `Complaint Updated to ${status}`,
      `${String(existing.title)} · ${String(existing.location)}`,
      'complaints'
    );
    res.json({ complaint: mapComplaint(updated), activity });
  });

  // --- Notices ---
  router.get('/notices', (_req, res) => {
    const notices = db
      .prepare('SELECT * FROM notices ORDER BY is_important DESC, published_date DESC')
      .all()
      .map((r) => mapNotice(r as Record<string, unknown>));
    res.json({ notices });
  });

  router.post('/notices', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }
    const { title, description, category, isImportant } = req.body as {
      title?: string;
      description?: string;
      category?: string;
      isImportant?: boolean;
    };
    if (!title || !description || !category) {
      res.status(400).json({ error: 'Notice title, category, and description are required.' });
      return;
    }
    const id = `not-${Date.now()}`;
    const publishedDate = new Date().toISOString().slice(0, 10);
    db.prepare(
      `INSERT INTO notices (id, title, description, category, published_date, is_important, author_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(id, title.trim(), description.trim(), category, publishedDate, isImportant ? 1 : 0, user.name);
    const created = db.prepare('SELECT * FROM notices WHERE id = ?').get(id) as Record<string, unknown>;
    const activity = logActivity(`New ${category} Notice Published`, title.trim(), 'notices');
    res.status(201).json({ notice: mapNotice(created), activity });
  });

  router.patch('/notices/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }
    const existing = db
      .prepare('SELECT * FROM notices WHERE id = ?')
      .get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Notice not found.' });
      return;
    }
    const { title, description, category, isImportant } = req.body as {
      title?: string;
      description?: string;
      category?: string;
      isImportant?: boolean;
    };
    db.prepare(
      'UPDATE notices SET title = ?, description = ?, category = ?, is_important = ? WHERE id = ?'
    ).run(
      title?.trim() || String(existing.title),
      description?.trim() || String(existing.description),
      category || String(existing.category),
      isImportant !== undefined ? (isImportant ? 1 : 0) : Number(existing.is_important),
      req.params.id
    );
    const updated = db
      .prepare('SELECT * FROM notices WHERE id = ?')
      .get(req.params.id) as Record<string, unknown>;
    res.json({ notice: mapNotice(updated) });
  });

  router.delete('/notices/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }
    db.prepare('DELETE FROM notices WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });

  // --- Study Materials ---
  router.get('/materials', (_req, res) => {
    const materials = db
      .prepare('SELECT * FROM study_materials ORDER BY upload_date DESC')
      .all()
      .map((r) => mapMaterial(r as Record<string, unknown>));
    res.json({ materials });
  });

  router.post('/materials', materialUpload.single('file'), (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const { title, subject, semester, department, materialType, description } = req.body as {
      title?: string;
      subject?: string;
      semester?: string;
      department?: string;
      materialType?: string;
      description?: string;
    };
    if (!title || !subject || !semester || !department || !materialType || !description) {
      res.status(400).json({ error: 'All study material metadata fields are required.' });
      return;
    }

    const id = `mat-${Date.now()}`;
    const uploadDate = new Date().toISOString().slice(0, 10);
    const fileName =
      req.file?.originalname ||
      `${subject.trim().replace(/\s+/g, '_')}_${materialType.replace(/\s+/g, '_')}.pdf`;
    const fileSizeLabel = req.file ? formatFileSize(req.file.size) : '420 KB';
    const fileDiskPath = req.file ? req.file.path : null;

    db.prepare(
      `INSERT INTO study_materials
       (id, title, subject, semester, department, material_type, description, file_name, file_ext, file_size_label, file_disk_path, uploader_id, uploader_name, upload_date, downloads)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pdf', ?, ?, ?, ?, ?, 0)`
    ).run(
      id,
      title.trim(),
      subject.trim(),
      semester,
      department,
      materialType,
      description.trim(),
      fileName,
      fileSizeLabel,
      fileDiskPath,
      user.id,
      user.name,
      uploadDate
    );

    const created = db
      .prepare('SELECT * FROM study_materials WHERE id = ?')
      .get(id) as Record<string, unknown>;
    const activity = logActivity(
      `${materialType} Uploaded: ${subject.trim()}`,
      `${title.trim()} · ${semester}`,
      'materials'
    );
    res.status(201).json({ material: mapMaterial(created), activity });
  });

  router.get('/materials/:id/download', (req, res) => {
    const row = db
      .prepare('SELECT * FROM study_materials WHERE id = ?')
      .get(req.params.id) as Record<string, unknown> | undefined;
    if (!row) {
      res.status(404).json({ error: 'Study material not found.' });
      return;
    }

    db.prepare('UPDATE study_materials SET downloads = downloads + 1 WHERE id = ?').run(
      req.params.id
    );

    const safeFileName = String(row.file_name).replace(/["\r\n]/g, '');
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${safeFileName}"`);

    const diskPath = row.file_disk_path ? String(row.file_disk_path) : null;
    if (diskPath && fs.existsSync(diskPath)) {
      res.sendFile(path.resolve(diskPath));
      return;
    }

    const pdfText = buildSamplePdfText({
      title: String(row.title),
      subject: String(row.subject),
      department: String(row.department),
      semester: String(row.semester),
      uploaderName: String(row.uploader_name),
      uploadDate: String(row.upload_date),
      description: String(row.description),
    });
    res.send(Buffer.from(pdfText, 'utf8'));
  });

  router.delete('/materials/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    const existing = db
      .prepare('SELECT * FROM study_materials WHERE id = ?')
      .get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Study material not found.' });
      return;
    }
    if (user.role !== 'admin' && existing.uploader_id !== user.id) {
      res.status(403).json({ error: 'Not authorized to remove this material.' });
      return;
    }
    if (existing.file_disk_path && fs.existsSync(String(existing.file_disk_path))) {
      fs.unlinkSync(String(existing.file_disk_path));
    }
    db.prepare('DELETE FROM study_materials WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });

  // --- Emergency Contacts ---
  router.get('/emergency', (_req, res) => {
    const contacts = db
      .prepare('SELECT * FROM emergency_contacts ORDER BY id ASC')
      .all()
      .map((r) => mapEmergency(r as Record<string, unknown>));
    res.json({ contacts });
  });

  router.post('/emergency', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }
    const {
      category,
      officeName,
      contactPerson,
      phone,
      alternatePhone,
      location,
      availability,
      isSampleData,
    } = req.body as Partial<EmergencyContact>;

    if (!category || !officeName || !phone) {
      res.status(400).json({ error: 'Category, office name, and phone number are required.' });
      return;
    }

    const id = `emg-${Date.now()}`;
    db.prepare(
      `INSERT INTO emergency_contacts
       (id, category, office_name, contact_person, phone, alternate_phone, location, availability, is_sample_data)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      id,
      category,
      officeName.trim(),
      contactPerson?.trim() || 'Duty Officer',
      phone.trim(),
      alternatePhone?.trim() || null,
      location?.trim() || 'Main Campus',
      availability?.trim() || '24/7',
      isSampleData ? 1 : 0
    );

    const created = db
      .prepare('SELECT * FROM emergency_contacts WHERE id = ?')
      .get(id) as Record<string, unknown>;
    res.status(201).json({ contact: mapEmergency(created) });
  });

  router.patch('/emergency/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }
    const existing = db
      .prepare('SELECT * FROM emergency_contacts WHERE id = ?')
      .get(req.params.id) as Record<string, unknown> | undefined;
    if (!existing) {
      res.status(404).json({ error: 'Emergency contact not found.' });
      return;
    }
    const body = req.body as Partial<EmergencyContact>;
    db.prepare(
      `UPDATE emergency_contacts
       SET category = ?, office_name = ?, contact_person = ?, phone = ?, alternate_phone = ?, location = ?, availability = ?, is_sample_data = ?
       WHERE id = ?`
    ).run(
      body.category ?? String(existing.category),
      body.officeName?.trim() ?? String(existing.office_name),
      body.contactPerson?.trim() ?? String(existing.contact_person),
      body.phone?.trim() ?? String(existing.phone),
      body.alternatePhone !== undefined
        ? body.alternatePhone.trim() || null
        : (existing.alternate_phone as string | null),
      body.location?.trim() ?? String(existing.location),
      body.availability?.trim() ?? String(existing.availability),
      body.isSampleData !== undefined ? (body.isSampleData ? 1 : 0) : Number(existing.is_sample_data),
      req.params.id
    );
    const updated = db
      .prepare('SELECT * FROM emergency_contacts WHERE id = ?')
      .get(req.params.id) as Record<string, unknown>;
    res.json({ contact: mapEmergency(updated) });
  });

  router.delete('/emergency/:id', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user || user.role !== 'admin') {
      res.status(403).json({ error: 'Admin access required.' });
      return;
    }
    db.prepare('DELETE FROM emergency_contacts WHERE id = ?').run(req.params.id);
    res.json({ ok: true });
  });

  // --- Reset Demo Data ---
  router.post('/admin/reset-demo', (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    seedDatabaseIfEmpty(true);
    res.json({ ok: true });
  });

  // Multer & API Error Handler
  router.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      if (err instanceof multer.MulterError) {
        res.status(400).json({ error: `File upload error: ${err.message}` });
        return;
      }
      res.status(400).json({ error: err.message || 'Bad request.' });
    }
  );

  return router;
}
