import React, { useState } from 'react';
import { Edit3, Megaphone, Plus, Search, Star, Trash2, X } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { Notice, NoticeCategory } from '../../types/campus';
import { filterNotices } from '../../utils/campusLogic';
import { EmptyState, LoadingSkeleton } from '../ui/EmptyState';

const NOTICE_CATEGORIES: Array<NoticeCategory | 'All'> = [
  'All',
  'Academic',
  'Examination',
  'Events',
  'Holidays',
  'General',
];

export function NoticeBoard() {
  const { currentUser, notices, addNotice, updateNotice, deleteNotice, isLoadingView } = useCampus();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<NoticeCategory | 'All'>('All');
  const [importantOnly, setImportantOnly] = useState(false);

  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [readingNotice, setReadingNotice] = useState<Notice | null>(null);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<NoticeCategory>('Academic');
  const [description, setDescription] = useState('');
  const [isImportant, setIsImportant] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoadingView) {
    return <LoadingSkeleton rows={3} />;
  }

  const filtered = filterNotices(notices, {
    search,
    category: categoryFilter,
    importantOnly,
  });

  const openCreateModal = () => {
    setEditingNotice(null);
    setTitle('');
    setCategory('Academic');
    setDescription('');
    setIsImportant(false);
    setFormError(null);
    setShowEditor(true);
  };

  const openEditModal = (n: Notice) => {
    setEditingNotice(n);
    setTitle(n.title);
    setCategory(n.category);
    setDescription(n.description);
    setIsImportant(n.isImportant);
    setFormError(null);
    setShowEditor(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 4) {
      setFormError('Notice title must be at least 4 characters.');
      return;
    }
    if (description.trim().length < 10) {
      setFormError('Please provide full announcement details.');
      return;
    }

    if (editingNotice) {
      updateNotice(editingNotice.id, {
        title: title.trim(),
        category,
        description: description.trim(),
        isImportant,
      });
    } else {
      addNotice({
        title: title.trim(),
        category,
        description: description.trim(),
        isImportant,
      });
    }
    setShowEditor(false);
  };

  const fieldClass =
    'w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Digital Notice Board
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Official academic circulars, examination timetables, events, and campus announcements.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Publish Notice
          </button>
        )}
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notices by title or keyword..."
              aria-label="Search notices"
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500"
            />
          </div>

          <button
            type="button"
            onClick={() => setImportantOnly(!importantOnly)}
            className={`inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-colors whitespace-nowrap ${
              importantOnly
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500'
            }`}
          >
            <Star className="w-3.5 h-3.5" />
            Important Only
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {NOTICE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No notices match your filters"
          description="Try clearing the search box or switching to All categories."
          actionLabel={currentUser?.role === 'admin' ? 'Publish New Notice' : undefined}
          onAction={currentUser?.role === 'admin' ? openCreateModal : undefined}
        />
      ) : (
        <div className="space-y-4" data-testid="notices-list">
          {filtered.map((n) => (
            <article
              key={n.id}
              className={`rounded-2xl p-6 border transition-colors ${
                n.isImportant
                  ? 'bg-gradient-to-br from-blue-50/75 via-white to-purple-50/75 dark:from-blue-950/40 dark:via-slate-900 dark:to-purple-950/40 border-blue-300 dark:border-blue-800'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {n.isImportant && (
                      <>
                        <span className="inline-flex items-center gap-1 font-bold text-purple-700 dark:text-purple-400">
                          <Star className="w-3.5 h-3.5 fill-purple-600 text-purple-600 dark:fill-purple-400 dark:text-purple-400" />
                          Important Notice
                        </span>
                        <span aria-hidden="true">·</span>
                      </>
                    )}
                    <span className="font-semibold text-blue-700 dark:text-blue-400">{n.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">{n.publishedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>Issued by {n.authorName}</span>
                  </div>

                  <h2 className="mt-2 text-lg font-bold text-slate-900 dark:text-slate-100">{n.title}</h2>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-3">
                    {n.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setReadingNotice(n)}
                    className="px-3.5 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-950/90 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Read Full Notice
                  </button>

                  {currentUser?.role === 'admin' && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditModal(n)}
                        aria-label={`Edit notice: ${n.title}`}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteNotice(n.id)}
                        aria-label={`Delete notice: ${n.title}`}
                        className="p-2 text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Read Notice Modal */}
      {readingNotice && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="read-notice-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-xl">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                {readingNotice.isImportant && (
                  <>
                    <span className="font-bold text-purple-700 dark:text-purple-400">Important Notice</span>
                    <span aria-hidden="true">·</span>
                  </>
                )}
                <span className="font-semibold text-blue-700 dark:text-blue-400">{readingNotice.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">{readingNotice.publishedDate}</span>
              </div>
              <button
                type="button"
                onClick={() => setReadingNotice(null)}
                aria-label="Close notice dialog"
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 id="read-notice-title" className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {readingNotice.title}
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Issued by {readingNotice.authorName}</p>
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {readingNotice.description}
            </div>
          </div>
        </div>
      )}

      {/* Admin Create/Edit Modal */}
      {showEditor && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="notice-editor-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 id="notice-editor-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editingNotice ? 'Edit Notice' : 'Publish College Notice'}
              </h2>
              <button
                type="button"
                onClick={() => setShowEditor(false)}
                aria-label="Close notice editor"
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="not-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Notice Title
                </label>
                <input
                  id="not-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Semester Registration Deadline Extended"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="not-cat" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  id="not-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as NoticeCategory)}
                  className={fieldClass}
                >
                  <option value="Academic">Academic</option>
                  <option value="Examination">Examination</option>
                  <option value="Events">Events</option>
                  <option value="Holidays">Holidays</option>
                  <option value="General">General</option>
                </select>
              </div>

              <div>
                <label htmlFor="not-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  id="not-desc"
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter official circular details, dates, and instructions..."
                  className={fieldClass}
                />
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isImportant}
                  onChange={(e) => setIsImportant(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-purple-600 focus:ring-purple-600"
                />
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Highlight as Important Priority Notice
                </span>
              </label>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditor(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  {editingNotice ? 'Save Changes' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
