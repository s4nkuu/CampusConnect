import { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Megaphone,
  PhoneCall,
  SearchCheck,
  Trash2,
  Users,
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { ComplaintStatus } from '../../types/campus';
import { computePlatformStats } from '../../utils/campusLogic';
import { LoadingSkeleton } from '../ui/EmptyState';
import { ComplaintStatusChart } from './ComplaintStatusChart';

type AdminTab = 'overview' | 'students' | 'complaints' | 'lost-found' | 'notices' | 'materials' | 'emergency';

export function AdminDashboard() {
  const {
    currentUser,
    users,
    complaints,
    lostFoundItems,
    notices,
    materials,
    emergencyContacts,
    activities,
    updateComplaintStatus,
    toggleLostFoundResolved,
    deleteLostFoundItem,
    deleteNotice,
    deleteMaterial,
    navigate,
    isLoadingView,
  } = useCampus();

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [adminNoteMap, setAdminNoteMap] = useState<Record<string, string>>({});

  if (isLoadingView) {
    return <LoadingSkeleton rows={4} />;
  }

  const stats = computePlatformStats({
    users,
    notices,
    lostFound: lostFoundItems,
    complaints,
    materials,
  });

  const students = users.filter((u) => u.role === 'student');

  const tabs: Array<{ id: AdminTab; label: string }> = [
    { id: 'overview', label: 'Statistics & Activity' },
    { id: 'students', label: `Students (${stats.totalStudents})` },
    { id: 'complaints', label: `Complaints (${stats.totalComplaints})` },
    { id: 'lost-found', label: `Lost & Found (${stats.totalLostFound})` },
    { id: 'notices', label: `Notices (${stats.activeNotices})` },
    { id: 'materials', label: `Materials (${stats.totalMaterials})` },
    { id: 'emergency', label: `Emergency (${emergencyContacts.length})` },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="bg-gradient-to-r from-purple-700 to-blue-700 text-white rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-purple-100">University Administration Portal</p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight">
            Admin Command Console
          </h1>
          <p className="mt-1.5 text-sm text-purple-50/90">
            Signed in as {currentUser?.name}. Manage students, resolve campus complaints, publish
            notices, curate study materials, and maintain emergency contacts.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate('notices')}
            className="px-4 py-2.5 text-xs font-semibold text-purple-700 bg-white hover:bg-purple-50 rounded-xl transition-colors whitespace-nowrap"
          >
            + Publish Notice
          </button>
          <button
            type="button"
            onClick={() => navigate('emergency')}
            className="px-4 py-2.5 text-xs font-semibold text-white bg-white/15 hover:bg-white/25 border border-white/25 rounded-xl transition-colors whitespace-nowrap"
          >
            Edit Emergency Contacts
          </button>
        </div>
      </section>

      {/* Admin Sub-Navigation */}
      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3.5 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 hover:border-purple-300 dark:hover:border-purple-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Platform Statistics */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Registered Students</span>
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {stats.totalStudents}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Active student profiles</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Pending Complaints</span>
                <ClipboardCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {stats.pendingComplaints}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {stats.inProgressComplaints} in progress · {stats.resolvedComplaints} resolved
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Open Lost &amp; Found</span>
                <SearchCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {stats.openLostFound}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                {stats.resolvedLostFound} returned/resolved
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Material Downloads</span>
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {stats.totalMaterialDownloads}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
                Across {stats.totalMaterials} study files
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <ComplaintStatusChart complaints={complaints} />
            </div>

            <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-4">Platform Activity Log</h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {activities.slice(0, 6).map((act) => (
                  <div key={act.id} className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{act.title}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">{act.detail}</p>
                    </div>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums whitespace-nowrap">
                      {act.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Registered Students */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Registered Students Directory</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">{students.length} students</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/70 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <th className="py-3 px-4">Student Name</th>
                  <th className="py-3 px-4">Roll No.</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Semester</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4 text-right">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-100">{s.name}</td>
                    <td className="py-3 px-4 font-mono text-xs text-slate-700 dark:text-slate-300">{s.rollNumber || '—'}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">{s.department || '—'}</td>
                    <td className="py-3 px-4 text-xs text-slate-600 dark:text-slate-400">{s.semester || '—'}</td>
                    <td className="py-3 px-4 text-xs text-blue-700 dark:text-blue-400">{s.email}</td>
                    <td className="py-3 px-4 text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums text-right">
                      {s.joinedAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Complaints Manager */}
      {activeTab === 'complaints' && (
        <div className="space-y-3.5" data-testid="admin-complaints-manager">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-blue-700 dark:text-blue-400">{c.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{c.location}</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {c.studentName} ({c.studentRoll || 'Student'})
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">{c.submittedDate}</span>
                </div>
                <h3 className="mt-1.5 text-base font-bold text-slate-900 dark:text-slate-100">{c.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{c.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                <input
                  type="text"
                  value={adminNoteMap[c.id] ?? c.adminNote ?? ''}
                  onChange={(e) => setAdminNoteMap((prev) => ({ ...prev, [c.id]: e.target.value }))}
                  placeholder="Optional resolution note..."
                  aria-label={`Admin note for ${c.title}`}
                  className="px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 min-w-[200px]"
                />
                <select
                  aria-label={`Status for ${c.title}`}
                  value={c.status}
                  onChange={(e) =>
                    updateComplaintStatus(
                      c.id,
                      e.target.value as ComplaintStatus,
                      adminNoteMap[c.id] ?? c.adminNote
                    )
                  }
                  className="px-3 py-2 text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 rounded-xl focus:outline-none focus:border-purple-600"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Lost & Found Manager */}
      {activeTab === 'lost-found' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Lost &amp; Found Reports Manager</h2>
            <button
              type="button"
              onClick={() => navigate('lost-found')}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
            >
              Open Full Board
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {lostFoundItems.map((item) => (
              <div key={item.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-semibold capitalize">{item.type}</span> · {item.category} ·{' '}
                    {item.location} · {item.date}
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{item.itemName}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleLostFoundResolved(item.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl ${
                      item.status === 'resolved'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {item.status === 'resolved' ? 'Resolved' : 'Mark Resolved'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteLostFoundItem(item.id)}
                    aria-label={`Delete ${item.itemName}`}
                    className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Notices Manager */}
      {activeTab === 'notices' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Published Notices</h2>
            <button
              type="button"
              onClick={() => navigate('notices')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
            >
              <Megaphone className="w-3.5 h-3.5" />
              Create / Edit Notices
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {notices.map((n) => (
              <div key={n.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {n.isImportant && <span className="font-bold text-purple-700 dark:text-purple-400">Important · </span>}
                    {n.category} · <span className="font-mono tabular-nums">{n.publishedDate}</span>
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{n.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteNotice(n.id)}
                  aria-label={`Delete notice ${n.title}`}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Study Materials Manager */}
      {activeTab === 'materials' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Study Materials Repository</h2>
            <button
              type="button"
              onClick={() => navigate('materials')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Upload / Browse Materials
            </button>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {materials.map((m) => (
              <div key={m.id} className="p-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {m.materialType} · {m.department} · {m.semester} ·{' '}
                    <span className="font-mono tabular-nums">{m.downloads} downloads</span>
                  </p>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">{m.title}</p>
                </div>
                <button
                  type="button"
                  onClick={() => deleteMaterial(m.id)}
                  aria-label={`Remove material ${m.title}`}
                  className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Emergency Directory Quick Jump */}
      {activeTab === 'emergency' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Emergency Contact Management</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Currently managing {emergencyContacts.length} campus &amp; external emergency listings.
              Open the directory editor to add, edit, or verify phone numbers.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('emergency')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl whitespace-nowrap shrink-0"
          >
            <PhoneCall className="w-4 h-4" />
            Manage Emergency Contacts
          </button>
        </div>
      )}
    </div>
  );
}
