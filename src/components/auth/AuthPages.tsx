import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, GraduationCap, ShieldCheck, UserPlus } from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import { DEMO_ADMIN_CREDENTIALS, DEMO_STUDENT_CREDENTIALS } from '../../data/seedData';
import { validateEmail, validatePhone } from '../../utils/campusLogic';
import { ThemeToggle } from '../ui/ThemeToggle';

export function AuthPages() {
  const {
    route,
    navigate,
    loginStudent,
    loginAdmin,
    loginDemoStudent,
    loginDemoAdmin,
    registerStudent,
  } = useCampus();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration fields
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('Computer Science & Engineering');
  const [semester, setSemester] = useState('Semester 3');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isAdminLogin = route === 'admin-login';
  const isRegister = route === 'student-register';

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validateEmail(email)) {
      setFormError('Please enter a valid university email address.');
      return;
    }
    if (password.length < 4) {
      setFormError('Please enter your password (minimum 4 characters).');
      return;
    }
    setSubmitting(true);
    try {
      if (isAdminLogin) {
        await loginAdmin(email, password);
      } else {
        await loginStudent(email, password);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (name.trim().length < 2) {
      setFormError('Please enter your full name.');
      return;
    }
    if (!validateEmail(email)) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (rollNumber.trim().length < 3) {
      setFormError('Please enter your university roll or ID number.');
      return;
    }
    if (!validatePhone(phone)) {
      setFormError('Please enter a valid contact phone number.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await registerStudent({ name, email, password, rollNumber, department, semester, phone });
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-slate-700 rounded-xl placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 transition-colors';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center py-10 px-4 sm:px-6 transition-colors">
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            type="button"
            onClick={() => navigate('landing')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to CampusConnect Home
          </button>
          <ThemeToggle />
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 sm:p-8 shadow-sm">
          {/* Role Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                navigate('student-login');
              }}
              className={`py-2 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                route === 'student-login'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                navigate('student-register');
              }}
              className={`py-2 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                route === 'student-register'
                  ? 'bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setFormError(null);
                navigate('admin-login');
              }}
              className={`py-2 px-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                route === 'admin-login'
                  ? 'bg-white dark:bg-slate-900 text-purple-700 dark:text-purple-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Admin Login
            </button>
          </div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-white shrink-0 ${
                isAdminLogin ? 'bg-purple-600' : 'bg-blue-600'
              }`}
            >
              {isAdminLogin ? (
                <ShieldCheck className="w-5 h-5" />
              ) : isRegister ? (
                <UserPlus className="w-5 h-5" />
              ) : (
                <GraduationCap className="w-5 h-5" />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isAdminLogin
                  ? 'Administrator Sign In'
                  : isRegister
                    ? 'Student Registration'
                    : 'Student Sign In'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAdminLogin
                  ? 'Manage notices, complaints, materials & contacts'
                  : isRegister
                    ? 'Create your CampusConnect student account'
                    : 'Access your campus dashboard and services'}
              </p>
            </div>
          </div>

          {formError && (
            <div
              role="alert"
              className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs font-medium text-rose-700 dark:text-rose-300"
            >
              {formError}
            </div>
          )}

          {isRegister ? (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label htmlFor="reg-name" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Kabir Malhotra"
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="reg-roll" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Roll / Student ID
                  </label>
                  <input
                    id="reg-roll"
                    type="text"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(e.target.value)}
                    placeholder="CS2026-104"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Phone Number
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 00000"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label htmlFor="reg-dept" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Department
                  </label>
                  <select
                    id="reg-dept"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className={inputClass}
                  >
                    <option>Computer Science &amp; Engineering</option>
                    <option>Electronics &amp; Communication</option>
                    <option>Mechanical Engineering</option>
                    <option>Civil Engineering</option>
                    <option>Biotechnology</option>
                    <option>Business Administration</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="reg-sem" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Semester
                  </label>
                  <select
                    id="reg-sem"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className={inputClass}
                  >
                    {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="reg-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  University Email
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campusconnect.edu"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="reg-pass" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="reg-pass"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                {submitting ? 'Creating Account...' : 'Create Student Account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isAdminLogin ? 'Administrator Email' : 'Student Email'}
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    isAdminLogin ? DEMO_ADMIN_CREDENTIALS.email : DEMO_STUDENT_CREDENTIALS.email
                  }
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${inputClass} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className={`w-full py-2.5 px-4 text-sm font-semibold text-white rounded-xl transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                  isAdminLogin
                    ? 'bg-purple-600 hover:bg-purple-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting
                  ? 'Signing In...'
                  : isAdminLogin
                    ? 'Sign In to Admin Portal'
                    : 'Sign In to Student Portal'}
              </button>
            </form>
          )}

          {/* Demo Credentials & 1-Click Demo Access */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Quick Competition Demo Access
            </p>
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 space-y-1.5 font-mono">
              <div className="flex items-center justify-between gap-2">
                <span>Student:</span>
                <span className="text-slate-900 dark:text-slate-100 truncate">{DEMO_STUDENT_CREDENTIALS.email}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Password:</span>
                <span className="text-slate-900 dark:text-slate-100">{DEMO_STUDENT_CREDENTIALS.password}</span>
              </div>
              <div className="pt-1 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-2">
                <span>Admin:</span>
                <span className="text-slate-900 dark:text-slate-100 truncate">{DEMO_ADMIN_CREDENTIALS.email}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span>Password:</span>
                <span className="text-slate-900 dark:text-slate-100">{DEMO_ADMIN_CREDENTIALS.password}</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={loginDemoStudent}
                className="py-2.5 px-3 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-950/90 border border-blue-200 dark:border-blue-800 rounded-xl transition-colors"
              >
                Demo Student Login
              </button>
              <button
                type="button"
                onClick={loginDemoAdmin}
                className="py-2.5 px-3 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-950/90 border border-purple-200 dark:border-purple-800 rounded-xl transition-colors"
              >
                Demo Admin Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
