import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { LostFoundCategory, LostFoundItem, LostFoundType } from '../../types/campus';
import { filterLostFoundItems, validateImageFile } from '../../utils/campusLogic';
import { EmptyState, LoadingSkeleton } from '../ui/EmptyState';
import { ImageWithFallback } from '../ui/ImageWithFallback';

const CATEGORIES: Array<LostFoundCategory | 'All'> = [
  'All',
  'Electronics',
  'Documents',
  'Books',
  'Accessories',
  'Other',
];

export function LostAndFound() {
  const {
    currentUser,
    lostFoundItems,
    addLostFoundItem,
    toggleLostFoundResolved,
    deleteLostFoundItem,
    recentSearches,
    recordSearch,
    consumePendingSearch,
    addToast,
    isLoadingView,
  } = useCampus();

  const [typeFilter, setTypeFilter] = useState<'all' | LostFoundType>('all');
  const [categoryFilter, setCategoryFilter] = useState<LostFoundCategory | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [search, setSearch] = useState(() => consumePendingSearch('lost-found') ?? '');
  const latestSearchRef = useRef(search);
  const dirtySearchRef = useRef(false);
  const recordSearchRef = useRef(recordSearch);
  recordSearchRef.current = recordSearch;

  useEffect(() => {
    latestSearchRef.current = search;
    if (!dirtySearchRef.current) return;
    const trimmed = search.trim();
    if (trimmed.length < 2) return;
    const timer = window.setTimeout(() => {
      recordSearchRef.current('lost-found', trimmed);
      dirtySearchRef.current = false;
    }, 650);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    return () => {
      if (dirtySearchRef.current && latestSearchRef.current.trim().length >= 2) {
        recordSearchRef.current('lost-found', latestSearchRef.current.trim());
      }
    };
  }, []);

  const moduleRecentSearches = recentSearches.filter((entry) => entry.module === 'lost-found');

  const [showReportModal, setShowReportModal] = useState(false);
  const [claimItem, setClaimItem] = useState<LostFoundItem | null>(null);
  const [claimNote, setClaimNote] = useState('');

  // Form states
  const [reportType, setReportType] = useState<LostFoundType>('lost');
  const [itemName, setItemName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<LostFoundCategory>('Electronics');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [contactInfo, setContactInfo] = useState(
    currentUser ? `${currentUser.name} · ${currentUser.phone || currentUser.email}` : ''
  );
  const [imagePreview, setImagePreview] = useState<string | undefined>(undefined);
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoadingView) {
    return <LoadingSkeleton rows={3} />;
  }

  const filteredItems = filterLostFoundItems(lostFoundItems, {
    search,
    type: typeFilter,
    category: categoryFilter,
    status: statusFilter,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const error = validateImageFile(file);
    if (error) {
      setFormError(error);
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

  const resetForm = () => {
    setItemName('');
    setDescription('');
    setLocation('');
    setCategory('Electronics');
    setDate(new Date().toISOString().slice(0, 10));
    setContactInfo(
      currentUser ? `${currentUser.name} · ${currentUser.phone || currentUser.email}` : ''
    );
    setImagePreview(undefined);
    setImageFile(undefined);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itemName.trim().length < 2) {
      setFormError('Please enter a descriptive item name.');
      return;
    }
    if (description.trim().length < 8) {
      setFormError('Please describe distinguishing features of the item.');
      return;
    }
    if (location.trim().length < 2) {
      setFormError('Please specify the campus location.');
      return;
    }
    if (contactInfo.trim().length < 4) {
      setFormError('Please provide contact information for claims or returns.');
      return;
    }

    await addLostFoundItem({
      type: reportType,
      itemName: itemName.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      date,
      contactInfo: contactInfo.trim(),
      imageUrl: imagePreview,
      imageFile,
    });
    resetForm();
    setShowReportModal(false);
  };

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimItem) return;
    if (claimNote.trim().length < 4) {
      addToast('error', 'Message required', 'Please enter your contact details or ownership verification note.');
      return;
    }
    addToast(
      'success',
      'Inquiry sent to reporter',
      `Your message regarding "${claimItem.itemName}" has been shared with ${claimItem.reportedByName}.`
    );
    setClaimNote('');
    setClaimItem(null);
  };

  const fieldClass =
    'w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Lost &amp; Found Hub
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Report missing belongings, browse found items on campus, and coordinate quick returns.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => {
              setReportType('lost');
              resetForm();
              setShowReportModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Report Lost Item
          </button>
          <button
            type="button"
            onClick={() => {
              setReportType('found');
              resetForm();
              setShowReportModal(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-950/90 border border-purple-200 dark:border-purple-800 rounded-xl transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Report Found Item
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5">
        <div className="flex flex-col md:flex-row gap-3">
          <form
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = search.trim();
              if (trimmed.length > 0) {
                recordSearch('lost-found', trimmed);
                dirtySearchRef.current = false;
              }
            }}
          >
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => {
                dirtySearchRef.current = true;
                setSearch(e.target.value);
              }}
              onBlur={() => {
                const trimmed = search.trim();
                if (dirtySearchRef.current && trimmed.length >= 2) {
                  recordSearch('lost-found', trimmed);
                  dirtySearchRef.current = false;
                }
              }}
              placeholder="Search items, locations, or descriptions..."
              aria-label="Search lost and found items"
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500"
            />
          </form>

          <div className="flex flex-wrap items-center gap-2">
            {/* Segmented Type Filter */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
              {([
                { value: 'all', label: 'All Reports' },
                { value: 'lost', label: 'Lost' },
                { value: 'found', label: 'Found' },
              ] as const).map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTypeFilter(t.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                    typeFilter === t.value
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <select
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'all' | 'open' | 'resolved')}
              className="px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open Only</option>
              <option value="resolved">Resolved Only</option>
            </select>
          </div>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          {CATEGORIES.map((cat) => (
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

        {moduleRecentSearches.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <Clock className="w-3.5 h-3.5" />
              Recent:
            </span>
            {moduleRecentSearches.map((entry) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  dirtySearchRef.current = false;
                  setSearch(entry.query);
                  recordSearch('lost-found', entry.query);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-700 dark:hover:text-blue-300 transition-colors whitespace-nowrap"
              >
                {entry.query}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Grid */}
      {filteredItems.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No matching Lost & Found items"
          description="Try adjusting your search keywords or category filters, or submit a new item report."
          actionLabel="Report an Item"
          onAction={() => {
            resetForm();
            setShowReportModal(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="lost-found-grid">
          {filteredItems.map((item) => {
            const canManage =
              currentUser?.role === 'admin' || currentUser?.id === item.reportedById;

            return (
              <article
                key={item.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
              >
                <div>
                  <div className="h-44 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <ImageWithFallback
                      src={item.imageUrl}
                      alt={item.itemName}
                      className="w-full h-44 object-cover"
                      fallbackLabel={item.category}
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <span
                          className={`font-semibold ${
                            item.type === 'lost'
                              ? 'text-rose-700 dark:text-rose-400'
                              : 'text-blue-700 dark:text-blue-400'
                          }`}
                        >
                          {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>{item.category}</span>
                        {item.imageExt && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="font-mono uppercase">{item.imageExt}</span>
                          </>
                        )}
                      </div>
                      <span
                        className={`font-semibold ${
                          item.status === 'resolved'
                            ? 'text-emerald-700 dark:text-emerald-400'
                            : 'text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {item.status === 'resolved' ? 'Resolved' : 'Open'}
                      </span>
                    </div>

                    <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {item.itemName}
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                        <span className="truncate">{item.location}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2 text-slate-500 dark:text-slate-400">
                        <span>Reported by {item.reportedByName}</span>
                        <span className="font-mono tabular-nums">{item.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setClaimItem(item)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-950/90 rounded-xl transition-colors whitespace-nowrap"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    {item.type === 'found' ? 'Claim / Contact' : 'Contact Owner'}
                  </button>

                  {canManage && (
                    <button
                      type="button"
                      onClick={() => toggleLostFoundResolved(item.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                        item.status === 'resolved'
                          ? 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                          : 'text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-950/90'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {item.status === 'resolved' ? 'Reopen' : 'Mark Resolved'}
                    </button>
                  )}

                  {currentUser?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => deleteLostFoundItem(item.id)}
                      aria-label={`Delete report: ${item.itemName}`}
                      className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Report Lost / Found Modal */}
      {showReportModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lf-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 id="lf-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {reportType === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
              </h2>
              <button
                type="button"
                onClick={() => setShowReportModal(false)}
                aria-label="Close report modal"
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
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setReportType('lost')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                    reportType === 'lost'
                      ? 'bg-white dark:bg-slate-900 text-rose-700 dark:text-rose-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  I Lost Something
                </button>
                <button
                  type="button"
                  onClick={() => setReportType('found')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                    reportType === 'found'
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  I Found Something
                </button>
              </div>

              <div>
                <label htmlFor="lf-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Item Name
                </label>
                <input
                  id="lf-name"
                  type="text"
                  required
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g. Texas Instruments Scientific Calculator"
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="lf-category" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Category
                  </label>
                  <select
                    id="lf-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as LostFoundCategory)}
                    className={fieldClass}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Documents">Documents</option>
                    <option value="Books">Books</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="lf-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Date {reportType === 'lost' ? 'Lost' : 'Found'}
                  </label>
                  <input
                    id="lf-date"
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className={fieldClass}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lf-location" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Campus Location
                </label>
                <input
                  id="lf-location"
                  type="text"
                  required
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Central Library, 2nd Floor"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="lf-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Item Description
                </label>
                <textarea
                  id="lf-desc"
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Color, brand, stickers, or identifying marks..."
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="lf-contact" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contact Information
                </label>
                <input
                  id="lf-contact"
                  type="text"
                  required
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder="Phone number or campus email"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="lf-photo" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Upload Item Photograph (Optional, max 5 MB)
                </label>
                <label
                  htmlFor="lf-photo"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  <span>{imagePreview ? 'Change uploaded photo' : 'Choose JPG, PNG, or WEBP image'}</span>
                  <input
                    id="lf-photo"
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
                      alt="Uploaded item preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(undefined);
                        setImageFile(undefined);
                      }}
                      aria-label="Remove uploaded photo"
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
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
                >
                  Publish Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Claim / Contact Modal */}
      {claimItem && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="claim-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h2 id="claim-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {claimItem.type === 'found' ? 'Claim Found Item' : 'Contact Item Owner'}
              </h2>
              <button
                type="button"
                onClick={() => setClaimItem(null)}
                aria-label="Close contact dialog"
                className="p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{claimItem.itemName}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {claimItem.location} · Reported by {claimItem.reportedByName}
            </p>

            <div className="mt-4 p-3.5 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Direct Contact Details</p>
              <p className="mt-1 text-sm font-semibold text-blue-700 dark:text-blue-400">{claimItem.contactInfo}</p>
            </div>

            <form onSubmit={handleClaimSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="claim-note" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Send Verification / Pickup Note
                </label>
                <textarea
                  id="claim-note"
                  rows={3}
                  required
                  value={claimNote}
                  onChange={(e) => setClaimNote(e.target.value)}
                  placeholder="Describe a unique detail or share your pickup availability..."
                  className={fieldClass}
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setClaimItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
