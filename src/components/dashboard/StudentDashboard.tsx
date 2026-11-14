import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Clock,
  Megaphone,
  PhoneCall,
  Search,
  SearchCheck,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import { computePlatformStats, filterNotices } from '../../utils/campusLogic';
import { LoadingSkeleton } from '../ui/EmptyState';

export function StudentDashboard() {
  const {
    currentUser,
    users,
    notices,
    lostFoundItems,
    complaints,
    materials,
    activities,
    recentSearches,
    openRecentSearch,
    removeSearch,
    clearRecentSearches,
    navigate,
    isLoadingView,
  } = useCampus();

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

  const userComplaints =
    currentUser?.role === 'admin'
      ? complaints
      : complaints.filter((c) => c.studentId === currentUser?.id);

  const highlightedNotices = filterNotices(notices, { category: 'All' }).slice(0, 3);

  const quickActions = [
    {
      label: 'Report Lost / Found',
      description: 'Post missing or recovered items',
      route: 'lost-found' as const,
      icon: SearchCheck,
      tone: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    },
    {
      label: 'Submit Complaint',
      description: 'Report campus or hostel faults',
      route: 'complaints' as const,
      icon: ClipboardCheck,
      tone: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    {
      label: 'Read Notice Board',
      description: 'Official circulars & exam dates',
      route: 'notices' as const,
      icon: Megaphone,
      tone: 'text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
    },
    {
      label: 'Study Materials',
      description: 'PDF notes & past question papers',
      route: 'materials' as const,
      icon: BookOpen,
      tone: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
    },
    {
      label: 'Emergency Contacts',
      description: '24/7 security, medical & ambulance',
      route: 'emergency' as const,
      icon: PhoneCall,
      tone: 'text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="text-xs font-semibold text-blue-100">
            {currentUser?.department || 'University Campus'}
            {currentUser?.semester ? ` · ${currentUser.semester}` : ''}
          </p>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {currentUser?.name}
          </h1>
          <p className="mt-2 text-sm text-blue-50/90 max-w-2xl leading-relaxed">
            Check important college announcements, track your submitted facility complaints, recover
            lost items, and download semester study materials from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => navigate('complaints')}
            className="px-4 py-2.5 text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-xl transition-colors whitespace-nowrap"
          >
            New Complaint
          </button>
          {currentUser?.role === 'admin' && (
            <button
              type="button"
              onClick={() => navigate('admin')}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-purple-900/40 hover:bg-purple-900/60 border border-white/25 rounded-xl transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Console
            </button>
          )}
        </div>
      </section>

      {/* 4 Key Metrics */}
      <section aria-label="Campus Overview Statistics" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          type="button"
          onClick={() => navigate('notices')}
          className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500 rounded-2xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Notices</span>
            <Megaphone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums" data-testid="kpi-notices">
            {stats.activeNotices}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.importantNotices} marked important
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('lost-found')}
          className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500 rounded-2xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Lost &amp; Found Reports</span>
            <SearchCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums" data-testid="kpi-lost-found">
            {stats.totalLostFound}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.openLostFound} open · {stats.resolvedLostFound} resolved
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('complaints')}
          className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500 rounded-2xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {currentUser?.role === 'admin' ? 'All Campus Complaints' : 'Your Complaints'}
            </span>
            <ClipboardCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums" data-testid="kpi-complaints">
            {userComplaints.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.totalComplaints} total campus-wide
          </p>
        </button>

        <button
          type="button"
          onClick={() => navigate('materials')}
          className="text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-purple-300 dark:hover:border-purple-500 rounded-2xl p-5 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Available Study Materials</span>
            <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-900 dark:text-slate-100 tabular-nums" data-testid="kpi-materials">
            {stats.totalMaterials}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 tabular-nums">
            {stats.totalMaterialDownloads} total downloads
          </p>
        </button>
      </section>

      {/* Quick Access Buttons */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Quick Access</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.route}
                type="button"
                onClick={() => navigate(action.route)}
                className="group text-left bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-500 rounded-2xl p-4 transition-all hover:shadow-sm"
              >
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${action.tone}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors">
                  {action.label}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{action.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recent Searches */}
      <section
        aria-labelledby="recent-searches-heading"
        data-testid="recent-searches-section"
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 id="recent-searches-heading" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Recent Searches
              </h2>
              <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-slate-400">
                ({recentSearches.length}/5)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Your last 5 search queries across Lost &amp; Found and Study Materials
            </p>
          </div>

          {recentSearches.length > 0 && (
            <button
              type="button"
              onClick={clearRecentSearches}
              className="text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap"
            >
              Clear all
            </button>
          )}
        </div>

        {recentSearches.length === 0 ? (
          <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No recent searches yet. Search in Lost &amp; Found or Study Materials to save quick shortcuts here.
            </p>
            <div className="flex items-center gap-4 shrink-0 text-xs font-semibold">
              <button
                type="button"
                onClick={() => navigate('lost-found')}
                className="text-blue-600 dark:text-blue-400 hover:underline whitespace-nowrap"
              >
                Search Lost &amp; Found
              </button>
              <button
                type="button"
                onClick={() => navigate('materials')}
                className="text-purple-600 dark:text-purple-400 hover:underline whitespace-nowrap"
              >
                Search Study Materials
              </button>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100 dark:divide-slate-800 border-t border-slate-100 dark:border-slate-800" data-testid="recent-searches-list">
            {recentSearches.map((entry) => {
              const isMaterials = entry.module === 'materials';
              const moduleLabel = isMaterials ? 'Study Materials' : 'Lost & Found';
              const formattedTime = new Date(entry.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <li key={entry.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-3 last:pb-0">
                  <button
                    type="button"
                    onClick={() => openRecentSearch(entry)}
                    aria-label={`Search "${entry.query}" in ${moduleLabel}`}
                    className="group flex-1 min-w-0 flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-left py-1 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0 transition-colors" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400 truncate transition-colors">
                      {entry.query}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                    <span
                      className={`text-xs font-medium whitespace-nowrap ${
                        isMaterials
                          ? 'text-purple-700 dark:text-purple-400'
                          : 'text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {moduleLabel}
                    </span>
                    <span className="text-slate-300 dark:text-slate-700 hidden sm:inline" aria-hidden="true">·</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums hidden sm:inline">
                      {formattedTime}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => removeSearch(entry.id)}
                    aria-label={`Remove recent search ${entry.query}`}
                    className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Recent Campus Activities & Priority Notices */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recent Campus Activities</h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Live updates</span>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.slice(0, 6).map((act) => (
              <div key={act.id} className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{act.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{act.detail}</p>
                </div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums whitespace-nowrap shrink-0">
                  {act.timestamp}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Latest Notices</h2>
              <button
                type="button"
                onClick={() => navigate('notices')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View all
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="space-y-3">
              {highlightedNotices.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => navigate('notices')}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    n.isImportant
                      ? 'bg-gradient-to-r from-blue-50/70 to-purple-50/70 dark:from-blue-950/40 dark:to-purple-950/40 border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-600'
                      : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {n.isImportant && (
                      <>
                        <span className="font-semibold text-purple-700 dark:text-purple-400">Important</span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span>{n.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{n.publishedDate}</span>
                  </div>
                  <p className="mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-2">
                    {n.title}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
