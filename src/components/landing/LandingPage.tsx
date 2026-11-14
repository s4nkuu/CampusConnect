import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  Clock,
  GraduationCap,
  Megaphone,
  MessageSquareHeart,
  PhoneCall,
  SearchCheck,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useCampus } from '../../context/CampusContext';
import heroCampusImg from '../../assets/images/hero_campus_commons_1794555522502.jpg';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { ThemeToggle } from '../ui/ThemeToggle';

export function LandingPage() {
  const { navigate, loginDemoStudent, loginDemoAdmin, currentUser } = useCampus();

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Bar Contract: Brand wordmark — 4 single-line links — 1 primary CTA */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
          <a
            href="#top"
            className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap shrink-0 font-display"
          >
            Campus<span className="text-blue-600 dark:text-blue-400">Connect</span>
          </a>

          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300"
          >
            <a
              href="#overview"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
            >
              Overview
            </a>
            <a
              href="#features"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
            >
              Features
            </a>
            <a
              href="#why-campusconnect"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
            >
              Why CampusConnect
            </a>
            <a
              href="#impact"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors whitespace-nowrap shrink-0"
            >
              Impact
            </a>
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={() => navigate(currentUser.role === 'admin' ? 'admin' : 'dashboard')}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                Open Dashboard
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('student-login')}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shrink-0"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-slate-50 via-white to-white dark:from-slate-900 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-6 py-14 lg:py-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
              <div className="lg:col-span-6 flex flex-col justify-center">
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-400 tracking-wide">
                  Unified University Support Platform
                </p>
                <h1 className="mt-3 text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 leading-[1.1] text-balance">
                  One Campus. One Platform. Every Solution.
                </h1>
                <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-xl">
                  CampusConnect brings lost &amp; found recovery, campus complaint tracking, verified
                  college notices, shared study materials, and 24/7 emergency contacts into one
                  dependable portal for students and university administration.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3.5">
                  <button
                    type="button"
                    onClick={loginDemoStudent}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap shrink-0 shadow-sm shadow-blue-600/20"
                  >
                    Explore Student Demo
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('student-login')}
                    className="px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-blue-400 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    Student Login
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('admin-login')}
                    className="px-5 py-3 text-sm font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 dark:hover:bg-purple-950/90 border border-purple-200 dark:border-purple-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
                  >
                    Admin Login
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Instant demo access available for both Student and Administrator roles—no setup required.
                  </p>
                  <ThemeToggle showLabel />
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="h-full min-h-[280px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 shadow-sm">
                  <ImageWithFallback
                    src={heroCampusImg}
                    alt="Modern sunlit university campus commons and student center"
                    className="w-full h-full min-h-[280px] lg:min-h-[420px] object-cover"
                    fallbackLabel="University Campus Commons"
                  />
                </div>
              </div>
            </div>

            {/* Full-width 4-column metric strip below hero split */}
            <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 pt-10 border-t border-slate-200 dark:border-slate-800">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">6 Core Modules</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Notices, Complaints, Lost &amp; Found, Notes, Safety, Admin
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 tabular-nums">&lt; 30 sec</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Average time to file a maintenance complaint or item report
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 tabular-nums">3-Stage Tracking</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  Transparent Pending, In Progress &amp; Resolved ticket lifecycle
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums">24/7 Directory</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  One-tap emergency calling for security, medical &amp; ambulance
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Overview: What CampusConnect Is, Problems Solved & Who Benefits */}
        <section id="overview" className="py-16 lg:py-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">01. What CampusConnect Solves</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
                Replacing scattered campus notice boards and paper registers with clarity
              </h2>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                On most college campuses, critical academic notices get buried in informal chat
                threads, facility issues go unresolved without tracking, lost ID cards never reach
                their owners, and freshers struggle to find reliable study notes or emergency contacts.
                CampusConnect unifies every essential student service under one institutional roof.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-4">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Students &amp; Hostellers</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Report hostel or classroom faults with photo proof, recover lost belongings,
                  download peer-shared exam papers, and stay current on official deadlines.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center mb-4">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">College Administration</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Manage incoming maintenance tickets in one queue, update status transparently,
                  broadcast priority notices, and keep campus emergency numbers verified.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white flex items-center justify-center mb-4">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Faculty &amp; Campus Security</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Share verified syllabus notes and past papers by semester, return found items at
                  security desks quickly, and coordinate rapid campus safety assistance.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Major Features Asymmetric Bento Grid */}
        <section id="features" className="py-16 lg:py-20 bg-slate-50 dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">02. Major Features</p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
                  Six integrated modules built for daily university life
                </h2>
              </div>
              <button
                type="button"
                onClick={loginDemoStudent}
                className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 whitespace-nowrap shrink-0"
              >
                Try all modules live
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Feature 1 (Wide) */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-3">
                    <ClipboardCheck className="w-5 h-5" />
                    <span className="text-xs font-semibold tracking-wide text-blue-700 dark:text-blue-400">
                      Campus Complaint Tracker
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Structured Issue Reporting &amp; Real-Time Resolution Status
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                    Students submit categorized issues across Electricity, Water Supply, Classroom,
                    Washroom, Internet, Cleanliness, and Infrastructure—complete with building
                    location and supporting photo evidence. Administrators update tickets through
                    Pending, In Progress, and Resolved stages.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>Photo attachments</span>
                  <span aria-hidden="true">·</span>
                  <span>8 campus categories</span>
                  <span aria-hidden="true">·</span>
                  <span>Full student ticket history</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-3">
                    <SearchCheck className="w-5 h-5" />
                    <span className="text-xs font-semibold tracking-wide text-purple-700 dark:text-purple-400">
                      Lost &amp; Found Hub
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Photo-Verified Item Recovery
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Report lost or found electronics, ID cards, books, and accessories with item
                    photographs, campus location, and direct claim contact options.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  Filter by category · Mark resolved anytime
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-blue-600 dark:text-blue-400 mb-3">
                    <Megaphone className="w-5 h-5" />
                    <span className="text-xs font-semibold tracking-wide text-blue-700 dark:text-blue-400">
                      Digital Notice Board
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Highlighted Official Announcements
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    Academic, Examination, Events, Holidays, and General notices published directly by
                    administrators with priority highlighting for urgent updates.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                  Instant search · Admin create, edit &amp; delete
                </div>
              </div>

              {/* Feature 4 (Wide) */}
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3 text-purple-600 dark:text-purple-400 mb-3">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-xs font-semibold tracking-wide text-purple-700 dark:text-purple-400">
                      Study Materials Library
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    Departmental Notes &amp; Previous-Year Question Papers
                  </h3>
                  <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                    A centralized peer-and-faculty academic repository organized by subject,
                    semester, and department. Upload validated PDF notes or past exam papers and
                    download study packs in one click.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>PDF validation &amp; instant download</span>
                  <span aria-hidden="true">·</span>
                  <span>Semester &amp; department filters</span>
                  <span aria-hidden="true">·</span>
                  <span>Uploader attribution</span>
                </div>
              </div>

              {/* Feature 5 */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7">
                <div className="flex items-center gap-3 text-rose-600 dark:text-rose-400 mb-3">
                  <PhoneCall className="w-5 h-5" />
                  <span className="text-xs font-semibold tracking-wide text-rose-700 dark:text-rose-400">
                    Emergency Contacts
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">One-Tap Safety Directory</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Clickable phone links for College Security, Principal’s Office, Medical Clinic,
                  Ambulance, Nearby Hospital, and Fire Services.
                </p>
              </div>

              {/* Feature 6 (Wide) */}
              <div className="md:col-span-2 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold text-blue-100">Administrative Control Center</p>
                  <h3 className="mt-1.5 text-xl font-bold">
                    Complete Governance Dashboard for University Staff
                  </h3>
                  <p className="mt-2 text-sm text-blue-50/90 max-w-xl leading-relaxed">
                    Monitor student registrations, resolve facility complaints, curate study
                    materials, publish urgent notices, and verify emergency contacts from one console.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={loginDemoAdmin}
                  className="px-5 py-2.5 text-sm font-semibold text-blue-700 bg-white hover:bg-blue-50 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  Open Admin Demo
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Dedicated Section: Why CampusConnect? */}
        <section id="why-campusconnect" className="py-16 lg:py-20 bg-white dark:bg-slate-950 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="max-w-7xl mx-auto px-6">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">03. Why CampusConnect?</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
                Why CampusConnect?
              </h2>
              <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                Designed around real everyday student friction, CampusConnect transforms how
                students interact with college offices, academic resources, and campus safety.
              </p>
            </div>

            <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="border-t-2 border-blue-600 dark:border-blue-500 pt-5">
                <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-bold text-lg">
                  <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                  <h3>Saves Students’ Valuable Time</h3>
                </div>
                <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Eliminates walking between administrative desks to file maintenance complaints,
                  hunting through corridors for physical notice boards, or asking dozens of seniors
                  for past question papers before exams.
                </p>
              </div>

              <div className="border-t-2 border-purple-600 dark:border-purple-500 pt-5">
                <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-bold text-lg">
                  <MessageSquareHeart className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
                  <h3>Improves Campus Communication</h3>
                </div>
                <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Replaces unverified rumors with official, categorized announcements and gives
                  students clear visibility as complaints progress from Pending to Resolved.
                </p>
              </div>

              <div className="border-t-2 border-slate-900 dark:border-slate-300 pt-5">
                <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-bold text-lg">
                  <ShieldCheck className="w-5 h-5 text-slate-900 dark:text-slate-100 shrink-0" />
                  <h3>Makes College Services Accessible</h3>
                </div>
                <p className="mt-2.5 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Works smoothly across mobile phones, tablets, and library desktops—ensuring every
                  student, day scholar, and hosteller can reach emergency helplines and academic
                  materials anytime.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Social & Educational Impact */}
        <section id="impact" className="py-16 lg:py-20 bg-slate-50 dark:bg-slate-950">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              <div className="lg:col-span-6">
                <p className="text-sm font-semibold text-purple-700 dark:text-purple-400">04. Social &amp; Educational Impact</p>
                <h2 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-100 text-balance">
                  Equitable academic access and a safer, more responsive campus
                </h2>
                <p className="mt-4 text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  By digitizing campus support, first-generation and out-of-state students gain equal
                  access to curated lecture notes, past question banks, and verified emergency
                  contacts from day one—while colleges save thousands of sheets of notice paper
                  every semester.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-5">
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-400 tabular-nums">Paperless</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Digital circulars &amp; study packs cut campus printing waste
                    </p>
                  </div>
                  <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-400 tabular-nums">100% Traceable</p>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                      Accountable facility maintenance &amp; faster safety response
                    </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8">
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Ready to explore CampusConnect live?</h3>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                  Launch directly into a populated Student or Administrator session with persistent
                  database storage, or register a brand-new student profile.
                </p>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={loginDemoStudent}
                    className="px-5 py-3 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Launch Demo Student
                  </button>
                  <button
                    type="button"
                    onClick={loginDemoAdmin}
                    className="px-5 py-3 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Launch Demo Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('student-register')}
                    className="sm:col-span-2 px-5 py-3 text-sm font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors whitespace-nowrap"
                  >
                    Create New Student Account
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Quiet Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100 font-display">
              Campus<span className="text-blue-600 dark:text-blue-400">Connect</span>
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              One Campus. One Platform. Every Solution.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-400">
            <button
              type="button"
              onClick={() => navigate('student-login')}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Student Login
            </button>
            <button
              type="button"
              onClick={() => navigate('student-register')}
              className="hover:text-blue-600 dark:hover:text-blue-400"
            >
              Student Registration
            </button>
            <button
              type="button"
              onClick={() => navigate('admin-login')}
              className="hover:text-purple-600 dark:hover:text-purple-400"
            >
              Admin Portal
            </button>
            <ThemeToggle showLabel />
          </div>
        </div>
      </footer>
    </div>
  );
}
