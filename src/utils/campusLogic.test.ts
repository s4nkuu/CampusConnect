import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildSamplePdfText,
  computeMonthlyComplaintDistribution,
  computePlatformStats,
  filterComplaints,
  filterLostFoundItems,
  filterNotices,
  filterStudyMaterials,
  formatFileSize,
  MAX_RECENT_SEARCHES,
  parseRecentSearches,
  recordRecentSearch,
  removeRecentSearch,
  resolveThemePreference,
  validateEmail,
  validateImageFile,
  validatePdfFile,
  validatePhone,
} from './campusLogic';
import type { Complaint, LostFoundItem, Notice, StudyMaterial, User } from '../types/campus';

test('email and phone validation accept valid campus formats and reject invalid input', () => {
  assert.equal(validateEmail('aarav.sharma@campus.edu'), true);
  assert.equal(validateEmail('not-an-email'), false);
  assert.equal(validateEmail(''), false);

  assert.equal(validatePhone('+1 (555) 234-5678'), true);
  assert.equal(validatePhone('911'), true);
  assert.equal(validatePhone('abc-123'), false);
  assert.equal(validatePhone('12'), false);
});

test('file validation checks image MIME/size and PDF extension/size', () => {
  assert.equal(validateImageFile({ name: 'photo.jpg', type: 'image/jpeg', size: 1024 * 500 }), null);
  assert.notEqual(validateImageFile({ name: 'script.exe', type: 'application/x-msdownload', size: 100 }), null);
  assert.notEqual(validateImageFile({ name: 'huge.png', type: 'image/png', size: 8 * 1024 * 1024 }), null);

  assert.equal(validatePdfFile({ name: 'notes.pdf', type: 'application/pdf', size: 2048 }), null);
  assert.notEqual(validatePdfFile({ name: 'notes.docx', type: 'application/msword', size: 2048 }), null);
  assert.equal(formatFileSize(1536 * 1024), '1.5 MB');
});

test('filterLostFoundItems filters by type, category, status, and search term', () => {
  const items: LostFoundItem[] = [
    {
      id: '1',
      type: 'lost',
      itemName: 'MacBook Pro Sleeve',
      description: 'Navy laptop sleeve left in central library',
      category: 'Electronics',
      location: 'Central Library',
      date: '2026-11-10',
      contactInfo: 'aarav@campus.edu',
      status: 'open',
      reportedById: 's1',
      reportedByName: 'Aarav',
      createdAt: '2026-11-10T10:00:00Z',
    },
    {
      id: '2',
      type: 'found',
      itemName: 'Student ID Card',
      description: 'Found near science quad',
      category: 'Documents',
      location: 'Science Quad',
      date: '2026-11-11',
      contactInfo: 'security@campus.edu',
      status: 'resolved',
      reportedById: 's2',
      reportedByName: 'Priya',
      createdAt: '2026-11-11T10:00:00Z',
    },
  ];

  assert.equal(filterLostFoundItems(items, { type: 'lost' }).length, 1);
  assert.equal(filterLostFoundItems(items, { category: 'Documents' }).length, 1);
  assert.equal(filterLostFoundItems(items, { status: 'open', search: 'library' }).length, 1);
  assert.equal(filterLostFoundItems(items, { search: 'nonexistent' }).length, 0);
});

test('filterNotices sorts important notices first and filters by category', () => {
  const notices: Notice[] = [
    {
      id: 'n1',
      title: 'General Cafeteria Timing',
      description: 'Updated breakfast hours',
      category: 'General',
      publishedDate: '2026-11-12',
      isImportant: false,
      authorName: 'Admin',
    },
    {
      id: 'n2',
      title: 'Mid-Semester Exam Schedule',
      description: 'Check hall tickets',
      category: 'Examination',
      publishedDate: '2026-11-08',
      isImportant: true,
      authorName: 'Exam Cell',
    },
  ];

  const sorted = filterNotices(notices, { category: 'All' });
  assert.equal(sorted[0].id, 'n2');
  assert.equal(filterNotices(notices, { category: 'Examination' }).length, 1);
  assert.equal(filterNotices(notices, { importantOnly: true }).length, 1);
});

test('filterComplaints and filterStudyMaterials and computePlatformStats work accurately', () => {
  const users: User[] = [
    { id: 's1', name: 'Aarav', email: 'a@c.edu', password: '123', role: 'student', joinedAt: '2026-09-01' },
    { id: 'a1', name: 'Admin', email: 'admin@c.edu', password: '123', role: 'admin', joinedAt: '2026-09-01' },
  ];
  const complaints: Complaint[] = [
    {
      id: 'c1',
      title: 'Wi-Fi Down in Block B',
      description: 'No internet in room 204',
      category: 'Internet',
      location: 'Academic Block B',
      status: 'Pending',
      submittedDate: '2026-11-10',
      studentId: 's1',
      studentName: 'Aarav',
      updatedAt: '2026-11-10',
    },
    {
      id: 'c2',
      title: 'Broken Projector',
      description: 'HDMI port damaged',
      category: 'Classroom',
      location: 'Lecture Hall 2',
      status: 'Resolved',
      submittedDate: '2026-11-09',
      studentId: 's2',
      studentName: 'Riya',
      updatedAt: '2026-11-11',
    },
  ];
  const materials: StudyMaterial[] = [
    {
      id: 'm1',
      title: 'Data Structures Notes',
      subject: 'Data Structures & Algorithms',
      semester: 'Semester 3',
      department: 'Computer Science',
      materialType: 'PDF Notes',
      description: 'Trees, graphs, and dynamic programming',
      fileName: 'dsa-notes.pdf',
      fileSizeLabel: '1.2 MB',
      uploaderId: 's1',
      uploaderName: 'Aarav',
      uploadDate: '2026-11-05',
      downloads: 42,
    },
  ];

  assert.equal(filterComplaints(complaints, { studentId: 's1' }).length, 1);
  assert.equal(filterComplaints(complaints, { status: 'Resolved' }).length, 1);
  assert.equal(filterStudyMaterials(materials, { semester: 'Semester 3', search: 'graphs' }).length, 1);

  const stats = computePlatformStats({
    users,
    notices: [],
    lostFound: [],
    complaints,
    materials,
  });

  assert.equal(stats.totalStudents, 1);
  assert.equal(stats.pendingComplaints, 1);
  assert.equal(stats.resolvedComplaints, 1);
  assert.equal(stats.totalMaterialDownloads, 42);

  const pdfText = buildSamplePdfText(materials[0]);
  assert.ok(pdfText.startsWith('%PDF-1.4'));
  assert.ok(pdfText.includes('%%EOF'));
});

test('computeMonthlyComplaintDistribution aggregates complaint statuses across weeks of current month', () => {
  const sampleComplaints: Complaint[] = [
    {
      id: 'c1',
      title: 'Week 1 Resolved',
      description: 'Fixed',
      category: 'Classroom',
      location: 'Block A',
      status: 'Resolved',
      submittedDate: '2026-11-03',
      studentId: 's1',
      studentName: 'Aarav',
      updatedAt: '2026-11-04',
    },
    {
      id: 'c2',
      title: 'Week 2 Pending',
      description: 'Open',
      category: 'Electricity',
      location: 'Block B',
      status: 'Pending',
      submittedDate: '2026-11-11',
      studentId: 's2',
      studentName: 'Priya',
      updatedAt: '2026-11-11',
    },
    {
      id: 'c3',
      title: 'Week 2 In Progress',
      description: 'Working',
      category: 'Internet',
      location: 'Block C',
      status: 'In Progress',
      submittedDate: '2026-11-12',
      studentId: 's1',
      studentName: 'Aarav',
      updatedAt: '2026-11-12',
    },
    {
      id: 'c4',
      title: 'Prior Month Ignored',
      description: 'Old',
      category: 'Other',
      location: 'Quad',
      status: 'Resolved',
      submittedDate: '2026-10-28',
      studentId: 's1',
      studentName: 'Aarav',
      updatedAt: '2026-10-29',
    },
  ];

  const dist = computeMonthlyComplaintDistribution(sampleComplaints, new Date('2026-11-12T12:00:00Z'));
  assert.equal(dist.monthPrefix, '2026-11');
  assert.equal(dist.totalInMonth, 3);
  assert.equal(dist.statusTotals.Resolved, 1);
  assert.equal(dist.statusTotals.Pending, 1);
  assert.equal(dist.statusTotals['In Progress'], 1);
  assert.equal(dist.buckets[0].Resolved, 1);
  assert.equal(dist.buckets[1].Pending, 1);
  assert.equal(dist.buckets[1]['In Progress'], 1);
  assert.equal(dist.buckets[3].rangeLabel, 'Nov 22–30');
});

test('resolveThemePreference respects explicit saved theme and falls back to OS preference', () => {
  assert.equal(resolveThemePreference('dark', false), 'dark');
  assert.equal(resolveThemePreference('light', true), 'light');
  assert.equal(resolveThemePreference(null, true), 'dark');
  assert.equal(resolveThemePreference('invalid', false), 'light');
});

test('recent search helpers deduplicate, cap at 5 queries, remove entries, and parse safely', () => {
  let list = recordRecentSearch([], '  headphones  ', 'lost-found', '2026-11-13T08:00:00Z');
  assert.equal(list.length, 1);
  assert.equal(list[0].query, 'headphones');
  assert.equal(list[0].module, 'lost-found');

  // Empty or whitespace-only queries are ignored
  assert.equal(recordRecentSearch(list, '   ', 'materials').length, 1);

  list = recordRecentSearch(list, 'operating systems', 'materials', '2026-11-13T08:01:00Z');
  list = recordRecentSearch(list, 'calculator', 'lost-found', '2026-11-13T08:02:00Z');
  list = recordRecentSearch(list, 'data structures', 'materials', '2026-11-13T08:03:00Z');
  list = recordRecentSearch(list, 'id card', 'lost-found', '2026-11-13T08:04:00Z');
  assert.equal(list.length, MAX_RECENT_SEARCHES);

  // 6th distinct query evicts the oldest ('headphones')
  list = recordRecentSearch(list, 'compiler design', 'materials', '2026-11-13T08:05:00Z');
  assert.equal(list.length, 5);
  assert.equal(list[0].query, 'compiler design');
  assert.equal(list.some((item) => item.query === 'headphones'), false);

  // Case-insensitive duplicate in the same module moves to front without shrinking below 5
  list = recordRecentSearch(list, 'Calculator', 'lost-found', '2026-11-13T08:06:00Z');
  assert.equal(list.length, 5);
  assert.equal(list[0].query, 'Calculator');

  // Same query text in a different module is retained distinctly
  list = recordRecentSearch(list, 'operating systems', 'lost-found', '2026-11-13T08:07:00Z');
  assert.equal(list.length, 5);
  assert.equal(list[0].module, 'lost-found');

  const removed = removeRecentSearch(list, list[0].id);
  assert.equal(removed.length, 4);

  // Parsing handles malformed JSON and respects MAX_RECENT_SEARCHES
  assert.deepEqual(parseRecentSearches('not-json'), []);
  const serialized = JSON.stringify([
    ...list,
    { id: 'extra', query: 'should-truncate', module: 'materials', timestamp: '2026-11-13T08:08:00Z' },
  ]);
  assert.equal(parseRecentSearches(serialized).length, 5);
});

