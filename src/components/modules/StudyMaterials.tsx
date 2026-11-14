import React, { useEffect, useRef, useState } from 'react';
import { BookOpen, Clock, Download, FileText, Plus, Search, Trash2, Upload, X } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { MaterialType } from '../../types/campus';
import { filterStudyMaterials, formatFileSize, validatePdfFile } from '../../utils/campusLogic';
import { EmptyState, LoadingSkeleton } from '../ui/EmptyState';

const SEMESTERS = [
  'All',
  'Semester 1',
  'Semester 2',
  'Semester 3',
  'Semester 4',
  'Semester 5',
  'Semester 6',
  'Semester 7',
  'Semester 8',
];

const DEPARTMENTS = [
  'All',
  'Computer Science & Engineering',
  'Electronics & Communication',
  'Mechanical Engineering',
  'Civil Engineering',
  'Biotechnology',
  'Business Administration',
];

export function StudyMaterials() {
  const {
    currentUser,
    materials,
    addMaterial,
    deleteMaterial,
    downloadMaterial,
    recentSearches,
    recordSearch,
    consumePendingSearch,
    isLoadingView,
  } = useCampus();

  const [search, setSearch] = useState(() => consumePendingSearch('materials') ?? '');
  const [semester, setSemester] = useState('All');
  const [department, setDepartment] = useState('All');
  const [materialType, setMaterialType] = useState<MaterialType | 'All'>('All');
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
      recordSearchRef.current('materials', trimmed);
      dirtySearchRef.current = false;
    }, 650);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    return () => {
      if (dirtySearchRef.current && latestSearchRef.current.trim().length >= 2) {
        recordSearchRef.current('materials', latestSearchRef.current.trim());
      }
    };
  }, []);

  const moduleRecentSearches = recentSearches.filter((entry) => entry.module === 'materials');

  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [uploadSem, setUploadSem] = useState('Semester 5');
  const [uploadDept, setUploadDept] = useState('Computer Science & Engineering');
  const [uploadType, setUploadType] = useState<MaterialType>('PDF Notes');
  const [description, setDescription] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileSizeLabel, setFileSizeLabel] = useState('');
  const [pdfFile, setPdfFile] = useState<File | undefined>(undefined);
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoadingView) {
    return <LoadingSkeleton rows={3} />;
  }

  const filtered = filterStudyMaterials(materials, {
    search,
    semester,
    department,
    materialType,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validatePdfFile(file);
    if (err) {
      setFormError(err);
      e.target.value = '';
      return;
    }
    setFormError(null);
    setFileName(file.name);
    setFileSizeLabel(formatFileSize(file.size));
    setPdfFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim().length < 4) {
      setFormError('Please enter a clear title for the study material.');
      return;
    }
    if (subject.trim().length < 2) {
      setFormError('Please enter the subject or course name.');
      return;
    }
    if (description.trim().length < 8) {
      setFormError('Please enter a short description of the topics covered.');
      return;
    }

    const safeFileName =
      fileName || `${subject.trim().replace(/\s+/g, '_')}_${uploadType.replace(/\s+/g, '_')}.pdf`;

    await addMaterial({
      title: title.trim(),
      subject: subject.trim(),
      semester: uploadSem,
      department: uploadDept,
      materialType: uploadType,
      description: description.trim(),
      fileName: safeFileName,
      fileSizeLabel: fileSizeLabel || '420 KB',
      pdfFile,
    });

    setTitle('');
    setSubject('');
    setDescription('');
    setFileName('');
    setFileSizeLabel('');
    setPdfFile(undefined);
    setFormError(null);
    setShowUpload(false);
  };

  const fieldClass =
    'w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors';

  const filterSelectClass =
    'w-full px-3 py-2 text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:border-blue-600 dark:focus:border-blue-500';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Study Materials Library
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Browse, upload, and download lecture PDF notes and previous-year university question
            papers.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setFormError(null);
            setShowUpload(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          Upload Material
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <form
            className="md:col-span-5 relative"
            onSubmit={(e) => {
              e.preventDefault();
              const trimmed = search.trim();
              if (trimmed.length > 0) {
                recordSearch('materials', trimmed);
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
                  recordSearch('materials', trimmed);
                  dirtySearchRef.current = false;
                }
              }}
              placeholder="Search by subject, title, or topic..."
              aria-label="Search study materials"
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-blue-500"
            />
          </form>

          <div className="md:col-span-3">
            <select
              aria-label="Filter by department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className={filterSelectClass}
            >
              {DEPARTMENTS.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filter by semester"
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className={filterSelectClass}
            >
              {SEMESTERS.map((sem) => (
                <option key={sem} value={sem}>
                  {sem === 'All' ? 'All Semesters' : sem}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label="Filter by resource type"
              value={materialType}
              onChange={(e) => setMaterialType(e.target.value as MaterialType | 'All')}
              className={filterSelectClass}
            >
              <option value="All">All Types</option>
              <option value="PDF Notes">PDF Notes</option>
              <option value="Question Paper">Question Papers</option>
            </select>
          </div>
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
                  recordSearch('materials', entry.query);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-50 dark:hover:bg-purple-950/60 hover:text-purple-700 dark:hover:text-purple-300 transition-colors whitespace-nowrap"
              >
                {entry.query}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Materials Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No study materials found"
          description="No notes or question papers match your active filters. Upload a PDF to help fellow students."
          actionLabel="Upload Study Material"
          onAction={() => setShowUpload(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="materials-grid">
          {filtered.map((m) => {
            const canDelete = currentUser?.role === 'admin' || currentUser?.id === m.uploaderId;

            return (
              <article
                key={m.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-purple-300 dark:hover:border-purple-500 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span
                      className={`font-semibold ${
                        m.materialType === 'Question Paper'
                          ? 'text-purple-700 dark:text-purple-400'
                          : 'text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {m.materialType}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                      {m.fileSizeLabel}
                    </span>
                  </div>

                  <h2 className="mt-2 text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {m.title}
                  </h2>
                  <p className="mt-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {m.subject} · {m.semester}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{m.department}</p>

                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {m.description}
                  </p>
                </div>

                <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span className="truncate">By {m.uploaderName}</span>
                    <span className="font-mono tabular-nums shrink-0">{m.uploadDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => downloadMaterial(m.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                      <span className="font-mono tabular-nums text-blue-100">({m.downloads})</span>
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() => deleteMaterial(m.id)}
                        aria-label={`Delete study material: ${m.title}`}
                        className="p-2 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Upload Material Modal */}
      {showUpload && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mat-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 id="mat-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Upload Study Material
              </h2>
              <button
                type="button"
                onClick={() => setShowUpload(false)}
                aria-label="Close upload modal"
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
                  onClick={() => setUploadType('PDF Notes')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                    uploadType === 'PDF Notes'
                      ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  PDF Notes
                </button>
                <button
                  type="button"
                  onClick={() => setUploadType('Question Paper')}
                  className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                    uploadType === 'Question Paper'
                      ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Question Paper
                </button>
              </div>

              <div>
                <label htmlFor="mat-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Resource Title
                </label>
                <input
                  id="mat-title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Computer Networks Unit 1–4 Summary"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="mat-subject" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Subject Name
                </label>
                <input
                  id="mat-subject"
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Computer Networks"
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="mat-dept" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Department
                  </label>
                  <select
                    id="mat-dept"
                    value={uploadDept}
                    onChange={(e) => setUploadDept(e.target.value)}
                    className={fieldClass}
                  >
                    {DEPARTMENTS.filter((d) => d !== 'All').map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="mat-sem" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Semester
                  </label>
                  <select
                    id="mat-sem"
                    value={uploadSem}
                    onChange={(e) => setUploadSem(e.target.value)}
                    className={fieldClass}
                  >
                    {SEMESTERS.filter((s) => s !== 'All').map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="mat-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Description
                </label>
                <textarea
                  id="mat-desc"
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mention syllabus chapters, exam year, or included solved examples..."
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="mat-pdf" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Attach PDF File (Optional for demo, max 10 MB)
                </label>
                <label
                  htmlFor="mat-pdf"
                  className="flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-300 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 cursor-pointer transition-colors"
                >
                  {fileName ? (
                    <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  <span>
                    {fileName ? `${fileName} (${fileSizeLabel})` : 'Select a .pdf study document'}
                  </span>
                  <input
                    id="mat-pdf"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpload(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl"
                >
                  Publish Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
