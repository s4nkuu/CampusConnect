import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  Edit3,
  Flame,
  HeartPulse,
  Hospital,
  MapPin,
  PhoneCall,
  Plus,
  ShieldAlert,
  Stethoscope,
  Trash2,
  X,
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import type { EmergencyCategory, EmergencyContact } from '../../types/campus';
import { validatePhone } from '../../utils/campusLogic';
import { LoadingSkeleton } from '../ui/EmptyState';

const EMERGENCY_CATEGORIES: EmergencyCategory[] = [
  'College Administration',
  "Principal's Office",
  'College Security',
  'Medical Assistance',
  'Ambulance',
  'Nearby Hospital',
  'Fire & Emergency Services',
];

function getCategoryIcon(cat: EmergencyCategory) {
  switch (cat) {
    case 'College Security':
      return ShieldAlert;
    case 'Medical Assistance':
      return Stethoscope;
    case 'Ambulance':
      return HeartPulse;
    case 'Nearby Hospital':
      return Hospital;
    case 'Fire & Emergency Services':
      return Flame;
    default:
      return Building2;
  }
}

export function EmergencyContacts() {
  const {
    currentUser,
    emergencyContacts,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    isLoadingView,
  } = useCampus();

  const [editing, setEditing] = useState<EmergencyContact | null>(null);
  const [showModal, setShowModal] = useState(false);

  const [category, setCategory] = useState<EmergencyCategory>('College Security');
  const [officeName, setOfficeName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('24/7 Emergency Response');
  const [formError, setFormError] = useState<string | null>(null);

  if (isLoadingView) {
    return <LoadingSkeleton rows={3} />;
  }

  const openAdd = () => {
    setEditing(null);
    setCategory('College Security');
    setOfficeName('');
    setContactPerson('');
    setPhone('');
    setAlternatePhone('');
    setLocation('');
    setAvailability('24/7 Emergency Response');
    setFormError(null);
    setShowModal(true);
  };

  const openEdit = (c: EmergencyContact) => {
    setEditing(c);
    setCategory(c.category);
    setOfficeName(c.officeName);
    setContactPerson(c.contactPerson);
    setPhone(c.phone);
    setAlternatePhone(c.alternatePhone || '');
    setLocation(c.location);
    setAvailability(c.availability);
    setFormError(null);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (officeName.trim().length < 3) {
      setFormError('Please enter the office or service name.');
      return;
    }
    if (!validatePhone(phone)) {
      setFormError('Please enter a valid primary phone number.');
      return;
    }
    if (alternatePhone.trim() && !validatePhone(alternatePhone)) {
      setFormError('Alternate phone number format is invalid.');
      return;
    }

    const payload = {
      category,
      officeName: officeName.trim(),
      contactPerson: contactPerson.trim() || 'Duty Officer',
      phone: phone.trim(),
      alternatePhone: alternatePhone.trim() || undefined,
      location: location.trim() || 'Main Campus',
      availability: availability.trim() || '24/7',
      isSampleData: false,
    };

    if (editing) {
      updateEmergencyContact(editing.id, payload);
    } else {
      addEmergencyContact(payload);
    }
    setShowModal(false);
  };

  const fieldClass =
    'w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-purple-600 dark:focus:border-purple-500 transition-colors';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Emergency Contacts Directory
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Tap any phone number for immediate dialing to campus security, administration, medical,
            and emergency services.
          </p>
        </div>

        {currentUser?.role === 'admin' && (
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        )}
      </div>

      {/* Clear Sample Contact Notice */}
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-900/60 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
          <span className="font-bold">Sample Campus Contact Directory: </span>
          Entries marked as sample data demonstrate CampusConnect’s layout and one-tap calling.
          College administrators can edit or replace any contact with verified institutional phone
          numbers at any time.
        </div>
      </div>

      {/* Contacts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" data-testid="emergency-grid">
        {emergencyContacts.map((c) => {
          const Icon = getCategoryIcon(c.category);
          const isCritical =
            c.category === 'Ambulance' ||
            c.category === 'Fire & Emergency Services' ||
            c.category === 'College Security';

          return (
            <article
              key={c.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-500 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isCritical
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.category}</p>
                      <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {c.officeName}
                      </h2>
                    </div>
                  </div>

                  {currentUser?.role === 'admin' && (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => openEdit(c)}
                        aria-label={`Edit ${c.officeName}`}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteEmergencyContact(c.id)}
                        aria-label={`Delete ${c.officeName}`}
                        className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  <p className="font-medium text-slate-800 dark:text-slate-200">{c.contactPerson}</p>
                  <p className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                    <span>{c.location}</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    {c.availability}
                    {c.isSampleData && ' · Sample Directory Entry'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                <a
                  href={`tel:${c.phone.replace(/[^\d+]/g, '')}`}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap font-mono tabular-nums ${
                    isCritical
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  Call {c.phone}
                </a>

                {c.alternatePhone && (
                  <a
                    href={`tel:${c.alternatePhone.replace(/[^\d+]/g, '')}`}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap font-mono tabular-nums"
                  >
                    Alt: {c.alternatePhone}
                  </a>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {/* Admin Add/Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/50 dark:bg-black/70 backdrop-blur-[1px] flex items-center justify-center p-4 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="emg-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-xl my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 id="emg-modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {editing ? 'Update Emergency Contact' : 'Add Emergency Contact'}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                aria-label="Close contact editor"
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
                <label htmlFor="emg-cat" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Category
                </label>
                <select
                  id="emg-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as EmergencyCategory)}
                  className={fieldClass}
                >
                  {EMERGENCY_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="emg-office" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Office / Service Name
                </label>
                <input
                  id="emg-office"
                  type="text"
                  required
                  value={officeName}
                  onChange={(e) => setOfficeName(e.target.value)}
                  placeholder="e.g. 24/7 Campus Security Control Room"
                  className={fieldClass}
                />
              </div>

              <div>
                <label htmlFor="emg-person" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Contact Person / Desk
                </label>
                <input
                  id="emg-person"
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  placeholder="e.g. Chief Security Officer"
                  className={fieldClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="emg-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Primary Phone
                  </label>
                  <input
                    id="emg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 11 2659 1999"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="emg-alt" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Alternate Phone (Optional)
                  </label>
                  <input
                    id="emg-alt"
                    type="tel"
                    value={alternatePhone}
                    onChange={(e) => setAlternatePhone(e.target.value)}
                    placeholder="+91 98100 11999"
                    className={fieldClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="emg-loc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Location
                  </label>
                  <input
                    id="emg-loc"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Main Gate Post"
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="emg-avail" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Availability
                  </label>
                  <input
                    id="emg-avail"
                    type="text"
                    value={availability}
                    onChange={(e) => setAvailability(e.target.value)}
                    placeholder="24/7 Emergency Response"
                    className={fieldClass}
                  />
                </div>
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
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
                >
                  {editing ? 'Save Contact' : 'Add Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
