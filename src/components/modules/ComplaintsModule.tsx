import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  MapPin,
  Plus,
  Search,
  Upload,
  Wrench,
  X,
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { Complaint, ComplaintCategory, ComplaintStatus } from '../../types/campus';
import { filterComplaints, validateImageFile } from '../../utils/campusLogic';
import { EmptyState, LoadingSkeleton } from '../ui/EmptyState';
import { ImageWithFallback } from '../ui/ImageWithFallback';

const COMPLAINT_CATEGORIES: ComplaintCategory[] = [
  'Electricity',
  'Water Supply',
  'Classroom',
  'Washroom',
  'Internet',
  'Cleanliness',
  'Infrastructure',
  'Other',
];

export function ComplaintsModule() {
  const {
    currentUser,
    complaints,
    addComplaint,
    updateComplaintStatus,
    isLoadingView,
  } = useCampus();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ComplaintCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'All'>('All');
  const [scope, setScope] = useState<'mine' | 'all'>(
    currentUser?.role === 'admin' ? 'all' : 'mine'
  );

  const [showModal, setShowModal] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ComplaintCategory>('Electricity');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoadingView) {
    return <LoadingSkeleton rows={3} />;
  }

  const filtered = filterComplaints(complaints, {
    search,
    category: categoryFilter,
    status: statusFilter,
    studentId: scope === 'mine' && currentUser?.role !== 'admin' ? currentUser?.id : undefined,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      setFormError(err);
      e.target.value = '';
      return;
    }
    setFormError(null);
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setImagePreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 4) {
      setFormError('Please provide a clear complaint title (at least 4 characters).');
      return;
    }
    if (location.trim().length < 2) {
      setFormError('Please enter the building, room, or floor location.');
      return;
    }
    if (description.trim().length < 10) {
      setFormError('Please describe the issue in detail so maintenance can act quickly.');
      return;
    }

    await addComplaint({
      title: title.trim(),
      category,
      location: location.trim(),
      description: description.trim(),
      imageUrl: imagePreview,
      imageFile,
    });

    setTitle('');
    setLocation('');
    setDescription('');
    setImagePreview(undefined);
    setImageFile(undefined);
    setFormError(null);
    setShowModal(false);
  };

  const renderStatusIndicator = (status: ComplaintStatus) => {
    if (status === 'Resolved') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Resolved
        </span>
      );
    }
    if (status === 'In Progress') {
      return (
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
          <Wrench className="w-3.5 h-3.5" />
          In Progress
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
        <Clock className="w-3.5 h-3.5" />
        Pending
      </span>
    );
  };

  const fieldClass =
    'w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Campus Complaints
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Submit facility, utility, or infrastructure issues and track resolution progress.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Submit Complaint
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints by title, building, or description..."
            aria-label="Search complaints"
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {currentUser?.role !== 'admin' && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <button
                type="button"
                onClick={() => setScope('mine')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  scope === 'mine'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                My History
              </button>
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  scope === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Campus
              </button>
            </div>
          )}

          <select
            aria-label="Filter by complaint category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as ComplaintCategory | 'All')}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
          >
            <option value="All">All Categories</option>
            {COMPLAINT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by complaint status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ComplaintStatus | 'All')}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardCheck}
          title="No complaints found"
          description="No complaints match your current filter selection. Submit a new ticket if you spotted an issue on campus."
          actionLabel="Submit New Complaint"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="space-y-3.5" data-testid="complaints-list">
          {filtered.map((c) => (
            <article
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                    {renderStatusIndicator(c.status)}
                    <span aria-hidden="true">·</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{c.category}</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono tabular-nums">Submitted {c.submittedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>By {c.studentName}</span>
                  </div>

                  <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100">{c.title}</h2>
                  <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      {c.location}
                    </span>
                    {c.adminNote && (
                      <span className="text-blue-700 dark:text-blue-400 font-medium">
                        Admin Note: {c.adminNote}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex sm:flex-row md:flex-col items-center md:items-end gap-2.5 shrink-0">
                  {c.imageUrl && (
                    <button
                      type="button"
                      onClick={() => setSelectedComplaint(c)}
                      className="w-24 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 shrink-0"
                    >
                      <ImageWithFallback
                        src={c.imageUrl}
                        alt={`Supporting photo for ${c.title}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}

                  {currentUser?.role === 'admin' ? (
                    <select
                      aria-label={`Update status for ${c.title}`}
                      value={c.status}
                      onChange={(e) => updateComplaintStatus(c.id, e.target.value as ComplaintStatus)}
                      className="px-3 py-1.5 text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800 rounded-xl focus:outline-none focus:border-purple-600"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSelectedComplaint(c)}
                      className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Submit Complaint Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cmp-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 id="cmp-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Submit Campus Complaint
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close complaint modal"
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
                <label htmlFor="cmp-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Complaint Title
                </label>
                <input
                  id="cmp-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Broken ceiling fan in Lecture Hall 104"
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="cmp-cat" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    id="cmp-cat"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                    className={fieldClass}
                  >
                    {COMPLAINT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="cmp-loc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Location of Problem
                  </label>
                  <input
                    id="cmp-loc"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Hostel Block B, Room 312"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="cmp-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Detailed Description
                </label>
                <textarea
                  id="cmp-desc"
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain the issue, how long it has persisted, and any safety impact..."
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="cmp-photo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Supporting Photograph (Optional, max 5 MB)
                </label>
                <label
                  htmlFor="cmp-photo"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{imagePreview ? 'Replace supporting photograph' : 'Attach JPG, PNG, or WEBP photo'}</span>
                  <input
                    id="cmp-photo"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={handleImageChange}
                    className="sr-only"
                  />
                </label>
                {imagePreview && (
                  <div className="mt-2.5 relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 h-36">
                    <img
                      src={imagePreview}
                      alt="Complaint supporting preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(undefined);
                        setImageFile(undefined);
                      }}
                      aria-label="Remove supporting photo"
                      className="absolute top-2 right-2 p-1.5 bg-slate-900/75 text-white rounded-lg"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedComplaint && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cmp-detail-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              {renderStatusIndicator(selectedComplaint.status)}
              <button
                type="button"
                onClick={() => setSelectedComplaint(null)}
                aria-label="Close complaint details"
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <h2 id="cmp-detail-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {selectedComplaint.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {selectedComplaint.category} · {selectedComplaint.location} · Submitted{' '}
              {selectedComplaint.submittedDate}
            </p>
            <p className="mt-4 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedComplaint.description}
            </p>
            {selectedComplaint.imageUrl && (
              <div className="mt-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 max-h-60">
                <ImageWithFallback
                  src={selectedComplaint.imageUrl}
                  alt={selectedComplaint.title}
                  className="w-full h-56 object-cover"
                />
              </div>
            )}
            {selectedComplaint.adminNote && (
              <div className="mt-4 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200">
                <span className="font-semibold">Administration Update: </span>
                {selectedComplaint.adminNote}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
