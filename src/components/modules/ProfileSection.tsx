import React, { useState } from 'react';
import { LogOut, RotateCcw, Save } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import { validatePhone } from '../../utils/campusLogic';

export function ProfileSection() {
  const { currentUser, updateProfile, logout, resetDemoData, addToast } = useCampus();

  const [name, setName] = useState(currentUser?.name || '');
  const [department, setDepartment] = useState(
    currentUser?.department || 'Computer Science & Engineering'
  );
  const [semester, setSemester] = useState(currentUser?.semester || 'Semester 5');
  const [rollNumber, setRollNumber] = useState(currentUser?.rollNumber || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');

  if (!currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      addToast('error', 'Invalid name', 'Full name must be at least 2 characters.');
      return;
    }
    if (phone.trim() && !validatePhone(phone)) {
      addToast('error', 'Invalid phone number', 'Please enter a valid contact phone number.');
      return;
    }
    updateProfile({
      name: name.trim(),
      department: department.trim(),
      semester,
      rollNumber: rollNumber.trim(),
      phone: phone.trim(),
    });
  };

  const fieldClass =
    'w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors';

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Account Profile
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          View and update your CampusConnect academic and contact information.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold text-white shrink-0 ${
                currentUser.role === 'admin' ? 'bg-purple-600' : 'bg-blue-600'
              }`}
            >
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{currentUser.email}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 capitalize">
                Role: {currentUser.role} · Joined {currentUser.joinedAt}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-950/90 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors whitespace-nowrap self-start sm:self-center"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="prof-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                id="prof-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="prof-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Phone Number
              </label>
              <input
                id="prof-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={fieldClass}
              />
            </div>

            <div>
              <label htmlFor="prof-dept" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Department / Office
              </label>
              <input
                id="prof-dept"
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className={fieldClass}
              />
            </div>

            {currentUser.role === 'student' && (
              <>
                <div>
                  <label htmlFor="prof-roll" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Roll Number
                  </label>
                  <input
                    id="prof-roll"
                    type="text"
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label htmlFor="prof-sem" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Semester
                  </label>
                  <select
                    id="prof-sem"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className={fieldClass}
                  >
                    {[
                      'Semester 1',
                      'Semester 2',
                      'Semester 3',
                      'Semester 4',
                      'Semester 5',
                      'Semester 6',
                      'Semester 7',
                      'Semester 8',
                    ].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={resetDemoData}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo Data
            </button>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
