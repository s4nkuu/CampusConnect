import type {
  Complaint,
  ComplaintCategory,
  ComplaintStatus,
  LostFoundCategory,
  LostFoundItem,
  LostFoundType,
  MaterialType,
  Notice,
  NoticeCategory,
  StudyMaterial,
  User,
} from '../types/campus';

export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function validateEmail(email: string): boolean {
  const trimmed = email.trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed);
}

export function validatePhone(phone: string): boolean {
  const digits = phone.replace(/[\s\-()+]/g, '');
  return digits.length >= 3 && digits.length <= 15 && /^\d+$/.test(digits);
}

export function validateImageFile(file: { type: string; size: number; name: string }): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return `"${file.name}" is not a supported image format. Please upload JPG, PNG, WEBP, or GIF.`;
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return `"${file.name}" exceeds the 5 MB image limit.`;
  }
  return null;
}

export function validatePdfFile(file: { type: string; size: number; name: string }): string | null {
  const isPdfMime = file.type === 'application/pdf';
  const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
  if (!isPdfMime && !isPdfExt) {
    return `"${file.name}" must be a PDF document (.pdf).`;
  }
  if (file.size > MAX_PDF_SIZE_BYTES) {
    return `"${file.name}" exceeds the 10 MB PDF limit.`;
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function filterLostFoundItems(
  items: LostFoundItem[],
  options: {
    search?: string;
    type?: LostFoundType | 'all';
    category?: LostFoundCategory | 'All';
    status?: 'all' | 'open' | 'resolved';
  }
): LostFoundItem[] {
  const q = (options.search ?? '').trim().toLowerCase();
  return items.filter((item) => {
    if (options.type && options.type !== 'all' && item.type !== options.type) return false;
    if (options.category && options.category !== 'All' && item.category !== options.category) return false;
    if (options.status && options.status !== 'all' && item.status !== options.status) return false;
    if (!q) return true;
    return (
      item.itemName.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.location.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });
}

export function filterComplaints(
  complaints: Complaint[],
  options: {
    search?: string;
    category?: ComplaintCategory | 'All';
    status?: ComplaintStatus | 'All';
    studentId?: string;
  }
): Complaint[] {
  const q = (options.search ?? '').trim().toLowerCase();
  return complaints.filter((c) => {
    if (options.studentId && c.studentId !== options.studentId) return false;
    if (options.category && options.category !== 'All' && c.category !== options.category) return false;
    if (options.status && options.status !== 'All' && c.status !== options.status) return false;
    if (!q) return true;
    return (
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.location.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.studentName.toLowerCase().includes(q)
    );
  });
}

export function filterNotices(
  notices: Notice[],
  options: {
    search?: string;
    category?: NoticeCategory | 'All';
    importantOnly?: boolean;
  }
): Notice[] {
  const q = (options.search ?? '').trim().toLowerCase();
  return notices
    .filter((n) => {
      if (options.category && options.category !== 'All' && n.category !== options.category) return false;
      if (options.importantOnly && !n.isImportant) return false;
      if (!q) return true;
      return (
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (a.isImportant !== b.isImportant) return a.isImportant ? -1 : 1;
      return b.publishedDate.localeCompare(a.publishedDate);
    });
}

export function filterStudyMaterials(
  materials: StudyMaterial[],
  options: {
    search?: string;
    semester?: string;
    department?: string;
    materialType?: MaterialType | 'All';
  }
): StudyMaterial[] {
  const q = (options.search ?? '').trim().toLowerCase();
  return materials.filter((m) => {
    if (options.semester && options.semester !== 'All' && m.semester !== options.semester) return false;
    if (options.department && options.department !== 'All' && m.department !== options.department) return false;
    if (options.materialType && options.materialType !== 'All' && m.materialType !== options.materialType) return false;
    if (!q) return true;
    return (
      m.title.toLowerCase().includes(q) ||
      m.subject.toLowerCase().includes(q) ||
      m.department.toLowerCase().includes(q) ||
      m.semester.toLowerCase().includes(q) ||
      m.description.toLowerCase().includes(q)
    );
  });
}

export interface PlatformStats {
  totalStudents: number;
  activeNotices: number;
  importantNotices: number;
  totalLostFound: number;
  openLostFound: number;
  resolvedLostFound: number;
  totalComplaints: number;
  pendingComplaints: number;
  inProgressComplaints: number;
  resolvedComplaints: number;
  totalMaterials: number;
  totalMaterialDownloads: number;
}

export function computePlatformStats(data: {
  users: User[];
  notices: Notice[];
  lostFound: LostFoundItem[];
  complaints: Complaint[];
  materials: StudyMaterial[];
}): PlatformStats {
  const totalStudents = data.users.filter((u) => u.role === 'student').length;
  const activeNotices = data.notices.length;
  const importantNotices = data.notices.filter((n) => n.isImportant).length;
  const totalLostFound = data.lostFound.length;
  const openLostFound = data.lostFound.filter((i) => i.status === 'open').length;
  const resolvedLostFound = data.lostFound.filter((i) => i.status === 'resolved').length;
  const totalComplaints = data.complaints.length;
  const pendingComplaints = data.complaints.filter((c) => c.status === 'Pending').length;
  const inProgressComplaints = data.complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedComplaints = data.complaints.filter((c) => c.status === 'Resolved').length;
  const totalMaterials = data.materials.length;
  const totalMaterialDownloads = data.materials.reduce((sum, m) => sum + (m.downloads || 0), 0);

  return {
    totalStudents,
    activeNotices,
    importantNotices,
    totalLostFound,
    openLostFound,
    resolvedLostFound,
    totalComplaints,
    pendingComplaints,
    inProgressComplaints,
    resolvedComplaints,
    totalMaterials,
    totalMaterialDownloads,
  };
}

export interface MonthlyComplaintBucket {
  label: string;
  rangeLabel: string;
  Pending: number;
  'In Progress': number;
  Resolved: number;
  total: number;
}

export interface MonthlyComplaintDistribution {
  monthLabel: string;
  monthPrefix: string;
  totalInMonth: number;
  statusTotals: {
    Pending: number;
    'In Progress': number;
    Resolved: number;
  };
  buckets: MonthlyComplaintBucket[];
}

export function computeMonthlyComplaintDistribution(
  complaints: Complaint[],
  referenceDate: Date = new Date()
): MonthlyComplaintDistribution {
  const year = referenceDate.getFullYear();
  const monthIdx = referenceDate.getMonth(); // 0-indexed
  const monthPrefix = `${year}-${String(monthIdx + 1).padStart(2, '0')}`;
  const monthShort = referenceDate.toLocaleString('en-US', { month: 'short' });
  const monthLabel = referenceDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();

  const buckets: MonthlyComplaintBucket[] = [
    { label: 'Wk 1', rangeLabel: `${monthShort} 1–7`, Pending: 0, 'In Progress': 0, Resolved: 0, total: 0 },
    { label: 'Wk 2', rangeLabel: `${monthShort} 8–14`, Pending: 0, 'In Progress': 0, Resolved: 0, total: 0 },
    { label: 'Wk 3', rangeLabel: `${monthShort} 15–21`, Pending: 0, 'In Progress': 0, Resolved: 0, total: 0 },
    { label: 'Wk 4', rangeLabel: `${monthShort} 22–${daysInMonth}`, Pending: 0, 'In Progress': 0, Resolved: 0, total: 0 },
  ];

  const statusTotals = {
    Pending: 0,
    'In Progress': 0,
    Resolved: 0,
  };

  let totalInMonth = 0;

  for (const c of complaints) {
    if (!c.submittedDate.startsWith(monthPrefix)) continue;
    const dayPart = Number(c.submittedDate.slice(8, 10));
    if (!Number.isFinite(dayPart) || dayPart < 1 || dayPart > daysInMonth) continue;

    const bucketIndex = dayPart <= 7 ? 0 : dayPart <= 14 ? 1 : dayPart <= 21 ? 2 : 3;
    buckets[bucketIndex][c.status] += 1;
    buckets[bucketIndex].total += 1;
    statusTotals[c.status] += 1;
    totalInMonth += 1;
  }

  return {
    monthLabel,
    monthPrefix,
    totalInMonth,
    statusTotals,
    buckets,
  };
}

/**
 * Generates a valid, self-contained minimal PDF binary string so downloaded
 * demo study materials open cleanly in any PDF viewer.
 */
export function buildSamplePdfText(material: {
  title: string;
  subject: string;
  department: string;
  semester: string;
  uploaderName: string;
  uploadDate: string;
  description: string;
}): string {
  const sanitize = (str: string) => str.replace(/[()\\]/g, ' ').replace(/[^\x20-\x7E]/g, ' ');
  const lines = [
    `CampusConnect Academic Library`,
    `Title: ${sanitize(material.title)}`,
    `Subject: ${sanitize(material.subject)}`,
    `Department: ${sanitize(material.department)} | ${sanitize(material.semester)}`,
    `Uploaded by: ${sanitize(material.uploaderName)} on ${sanitize(material.uploadDate)}`,
    `Summary: ${sanitize(material.description).slice(0, 95)}`,
    `Generated for CampusConnect demonstration and student revision.`,
  ];

  const streamBody = [
    'BT',
    '/F1 16 Tf',
    '50 750 Td',
    `(${lines[0]}) Tj`,
    '/F1 12 Tf',
    '0 -32 Td',
    `(${lines[1]}) Tj`,
    '0 -22 Td',
    `(${lines[2]}) Tj`,
    '0 -22 Td',
    `(${lines[3]}) Tj`,
    '0 -22 Td',
    `(${lines[4]}) Tj`,
    '0 -30 Td',
    `(${lines[5]}) Tj`,
    '0 -28 Td',
    `(${lines[6]}) Tj`,
    'ET',
  ].join('\n');

  const objects = [
    '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
    '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
    '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
    `4 0 obj << /Length ${streamBody.length} >> stream\n${streamBody}\nendstream endobj`,
    '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
  ];

  let pdf = '%PDF-1.4\n';
  const offsets: number[] = [];
  for (const obj of objects) {
    offsets.push(pdf.length);
    pdf += obj + '\n';
  }
  const xrefStart = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += '0000000000 65535 f \n';
  for (const offset of offsets) {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
  return pdf;
}

export type ThemeMode = 'light' | 'dark';

export function resolveThemePreference(
  saved: string | null | undefined,
  prefersDark: boolean
): ThemeMode {
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  return prefersDark ? 'dark' : 'light';
}

export type SearchModule = 'lost-found' | 'materials';

export interface RecentSearchEntry {
  id: string;
  query: string;
  module: SearchModule;
  timestamp: string;
}

export const MAX_RECENT_SEARCHES = 5;

export function parseRecentSearches(raw: string | null | undefined): RecentSearchEntry[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const valid: RecentSearchEntry[] = [];
    for (const entry of parsed) {
      if (
        entry &&
        typeof entry === 'object' &&
        typeof entry.query === 'string' &&
        entry.query.trim().length > 0 &&
        (entry.module === 'lost-found' || entry.module === 'materials')
      ) {
        valid.push({
          id:
            typeof entry.id === 'string' && entry.id.trim().length > 0
              ? entry.id
              : `${entry.module}-${entry.query.trim().toLowerCase()}`,
          query: entry.query.trim(),
          module: entry.module,
          timestamp:
            typeof entry.timestamp === 'string' && entry.timestamp.length > 0
              ? entry.timestamp
              : new Date(0).toISOString(),
        });
      }
      if (valid.length >= MAX_RECENT_SEARCHES) break;
    }
    return valid;
  } catch {
    return [];
  }
}

export function recordRecentSearch(
  existing: RecentSearchEntry[],
  query: string,
  module: SearchModule,
  nowIso: string = new Date().toISOString()
): RecentSearchEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return existing.slice(0, MAX_RECENT_SEARCHES);

  const normalized = trimmed.toLowerCase();
  const deduped = existing.filter(
    (entry) => !(entry.module === module && entry.query.trim().toLowerCase() === normalized)
  );

  const nextEntry: RecentSearchEntry = {
    id: `${module}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    query: trimmed,
    module,
    timestamp: nowIso,
  };

  return [nextEntry, ...deduped].slice(0, MAX_RECENT_SEARCHES);
}

export function removeRecentSearch(
  existing: RecentSearchEntry[],
  id: string
): RecentSearchEntry[] {
  return existing.filter((entry) => entry.id !== id);
}

