import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type {
  ActivityItem,
  AppRoute,
  Complaint,
  ComplaintStatus,
  EmergencyContact,
  LostFoundItem,
  Notice,
  StudyMaterial,
  ToastMessage,
  User,
} from '../types/campus';
import {
  SEED_ACTIVITIES,
  SEED_COMPLAINTS,
  SEED_EMERGENCY_CONTACTS,
  SEED_LOST_FOUND,
  SEED_MATERIALS,
  SEED_NOTICES,
  SEED_USERS,
} from '../data/seedData';
import {
  parseRecentSearches,
  recordRecentSearch,
  removeRecentSearch,
  type RecentSearchEntry,
  type SearchModule,
} from '../utils/campusLogic';

const TOKEN_STORAGE_KEY = 'campusconnect_v1_token';
const RECENT_SEARCHES_STORAGE_PREFIX = 'campusconnect_recent_searches';

function getRecentSearchesKey(userId?: string | null): string {
  return `${RECENT_SEARCHES_STORAGE_PREFIX}_${userId || 'guest'}`;
}

function loadStoredRecentSearches(userId?: string | null): RecentSearchEntry[] {
  try {
    return parseRecentSearches(localStorage.getItem(getRecentSearchesKey(userId)));
  } catch {
    return [];
  }
}

function saveStoredRecentSearches(
  userId: string | null | undefined,
  entries: RecentSearchEntry[]
): void {
  try {
    const key = getRecentSearchesKey(userId);
    if (entries.length === 0) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, JSON.stringify(entries));
    }
  } catch {
    // ignore storage errors
  }
}

interface BootstrapPayload {
  user: User | null;
  users: User[];
  lostFoundItems: LostFoundItem[];
  complaints: Complaint[];
  notices: Notice[];
  materials: StudyMaterial[];
  emergencyContacts: EmergencyContact[];
  activities: ActivityItem[];
}

interface CampusContextValue {
  route: AppRoute;
  navigate: (next: AppRoute) => void;
  isLoadingView: boolean;
  triggerLoadingPreview: () => void;
  users: User[];
  currentUser: User | null;
  lostFoundItems: LostFoundItem[];
  complaints: Complaint[];
  notices: Notice[];
  materials: StudyMaterial[];
  emergencyContacts: EmergencyContact[];
  activities: ActivityItem[];
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  dismissToast: (id: string) => void;

  // Auth
  loginStudent: (email: string, password: string) => Promise<boolean>;
  loginAdmin: (email: string, password: string) => Promise<boolean>;
  loginDemoStudent: () => Promise<void>;
  loginDemoAdmin: () => Promise<void>;
  registerStudent: (payload: {
    name: string;
    email: string;
    password: string;
    rollNumber: string;
    department: string;
    semester: string;
    phone: string;
  }) => Promise<boolean>;
  updateProfile: (
    updates: Partial<Pick<User, 'name' | 'department' | 'semester' | 'phone' | 'rollNumber'>>
  ) => Promise<void>;
  logout: () => Promise<void>;

  // Lost & Found
  addLostFoundItem: (
    item: Omit<LostFoundItem, 'id' | 'status' | 'reportedById' | 'reportedByName' | 'createdAt'> & {
      imageFile?: File;
    }
  ) => Promise<void>;
  toggleLostFoundResolved: (id: string) => Promise<void>;
  deleteLostFoundItem: (id: string) => Promise<void>;

  // Complaints
  addComplaint: (
    complaint: Omit<
      Complaint,
      'id' | 'status' | 'submittedDate' | 'studentId' | 'studentName' | 'studentRoll' | 'updatedAt'
    > & { imageFile?: File }
  ) => Promise<void>;
  updateComplaintStatus: (id: string, status: ComplaintStatus, adminNote?: string) => Promise<void>;

  // Notices
  addNotice: (notice: Omit<Notice, 'id' | 'publishedDate' | 'authorName'>) => Promise<void>;
  updateNotice: (id: string, updates: Partial<Omit<Notice, 'id'>>) => Promise<void>;
  deleteNotice: (id: string) => Promise<void>;

  // Study Materials
  addMaterial: (
    material: Omit<StudyMaterial, 'id' | 'uploaderId' | 'uploaderName' | 'uploadDate' | 'downloads'> & {
      pdfFile?: File;
    }
  ) => Promise<void>;
  deleteMaterial: (id: string) => Promise<void>;
  downloadMaterial: (id: string) => void;

  // Emergency Contacts
  addEmergencyContact: (contact: Omit<EmergencyContact, 'id'>) => Promise<void>;
  updateEmergencyContact: (id: string, updates: Partial<Omit<EmergencyContact, 'id'>>) => Promise<void>;
  deleteEmergencyContact: (id: string) => Promise<void>;

  // Recent Searches
  recentSearches: RecentSearchEntry[];
  recordSearch: (module: SearchModule, query: string) => void;
  removeSearch: (id: string) => void;
  clearRecentSearches: () => void;
  openRecentSearch: (entry: RecentSearchEntry) => void;
  consumePendingSearch: (module: SearchModule) => string | null;

  // Demo Reset
  resetDemoData: () => Promise<void>;
}

const CampusContext = createContext<CampusContextValue | undefined>(undefined);

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

function setStoredToken(token: string | null): void {
  try {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore
  }
}

export function CampusProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(SEED_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [route, setRoute] = useState<AppRoute>('landing');
  const [isLoadingView, setIsLoadingView] = useState(true);

  const [lostFoundItems, setLostFoundItems] = useState<LostFoundItem[]>(SEED_LOST_FOUND);
  const [complaints, setComplaints] = useState<Complaint[]>(SEED_COMPLAINTS);
  const [notices, setNotices] = useState<Notice[]>(SEED_NOTICES);
  const [materials, setMaterials] = useState<StudyMaterial[]>(SEED_MATERIALS);
  const [emergencyContacts, setEmergencyContacts] = useState<EmergencyContact[]>(
    SEED_EMERGENCY_CONTACTS
  );
  const [activities, setActivities] = useState<ActivityItem[]>(SEED_ACTIVITIES);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearchEntry[]>(() =>
    loadStoredRecentSearches(null)
  );
  const recentSearchesRef = React.useRef<RecentSearchEntry[]>(recentSearches);
  const pendingSearchRef = React.useRef<{ module: SearchModule; query: string } | null>(null);

  useEffect(() => {
    const loaded = loadStoredRecentSearches(currentUser?.id);
    recentSearchesRef.current = loaded;
    setRecentSearches(loaded);
  }, [currentUser?.id]);

  const addToast = useCallback(
    (type: ToastMessage['type'], title: string, message?: string) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { id, type, title, message }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    },
    []
  );

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const apiFetch = useCallback(async <T,>(url: string, init: RequestInit = {}): Promise<T> => {
    const token = getStoredToken();
    const headers = new Headers(init.headers);
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    if (init.body && !(init.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(url, {
      ...init,
      headers,
      credentials: 'include',
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
    }
    return data as T;
  }, []);

  const loadBootstrap = useCallback(
    async (redirectFromAuth = false) => {
      try {
        const data = await apiFetch<BootstrapPayload>('/api/bootstrap');
        setLostFoundItems(data.lostFoundItems);
        setComplaints(data.complaints);
        setNotices(data.notices);
        setMaterials(data.materials);
        setEmergencyContacts(data.emergencyContacts);
        setActivities(data.activities);
        if (data.users.length > 0) {
          setUsers(data.users);
        }
        setCurrentUser(data.user);
        if (redirectFromAuth && data.user) {
          setRoute(data.user.role === 'admin' ? 'admin' : 'dashboard');
        }
      } catch {
        // Retain clean seed fallback if backend unreachable
      } finally {
        setIsLoadingView(false);
      }
    },
    [apiFetch]
  );

  useEffect(() => {
    const init = async () => {
      const params = new URLSearchParams(window.location.search);
      const autostart = params.get('autostart');
      if (autostart === '1' || autostart === 'admin') {
        try {
          const res = await apiFetch<{ token: string; user: User }>('/api/auth/demo', {
            method: 'POST',
            body: JSON.stringify({ role: autostart === 'admin' ? 'admin' : 'student' }),
          });
          setStoredToken(res.token);
          setCurrentUser(res.user);
          await loadBootstrap(false);
          setRoute(autostart === 'admin' ? 'admin' : 'dashboard');
          return;
        } catch {
          // fall through to standard bootstrap
        }
      }
      await loadBootstrap(true);
    };
    void init();
  }, [apiFetch, loadBootstrap]);

  const navigate = (next: AppRoute) => {
    const protectedRoutes: AppRoute[] = [
      'dashboard',
      'lost-found',
      'complaints',
      'notices',
      'materials',
      'emergency',
      'profile',
      'admin',
    ];
    if (protectedRoutes.includes(next) && !currentUser) {
      addToast('info', 'Sign in required', 'Please log in with your student or demo account to continue.');
      setRoute('student-login');
      return;
    }
    if (next === 'admin' && currentUser?.role !== 'admin') {
      addToast('error', 'Admin access required', 'Sign in via the Admin Portal to access management controls.');
      setRoute('admin-login');
      return;
    }
    setRoute(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const triggerLoadingPreview = () => {
    setIsLoadingView(true);
    void loadBootstrap(false);
  };

  const loginStudent = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role: 'student' }),
      });
      setStoredToken(res.token);
      setCurrentUser(res.user);
      await loadBootstrap(false);
      setRoute('dashboard');
      addToast(
        'success',
        `Welcome back, ${res.user.name.split(' ')[0]}`,
        'You are signed in to your Student Dashboard.'
      );
      return true;
    } catch (err) {
      addToast(
        'error',
        'Invalid student credentials',
        err instanceof Error ? err.message : 'Check your email and password.'
      );
      return false;
    }
  };

  const loginAdmin = async (email: string, password: string): Promise<boolean> => {
    try {
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, role: 'admin' }),
      });
      setStoredToken(res.token);
      setCurrentUser(res.user);
      await loadBootstrap(false);
      setRoute('admin');
      addToast('success', 'Administrator signed in', `Signed in as ${res.user.name}.`);
      return true;
    } catch (err) {
      addToast(
        'error',
        'Invalid admin credentials',
        err instanceof Error ? err.message : 'Authorized admin credentials required.'
      );
      return false;
    }
  };

  const loginDemoStudent = async () => {
    try {
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/demo', {
        method: 'POST',
        body: JSON.stringify({ role: 'student' }),
      });
      setStoredToken(res.token);
      setCurrentUser(res.user);
      await loadBootstrap(false);
      setRoute('dashboard');
      addToast(
        'success',
        `Signed in as ${res.user.name}`,
        'Exploring CampusConnect with live backend Student data.'
      );
    } catch (err) {
      addToast('error', 'Demo login failed', err instanceof Error ? err.message : 'Try again.');
    }
  };

  const loginDemoAdmin = async () => {
    try {
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/demo', {
        method: 'POST',
        body: JSON.stringify({ role: 'admin' }),
      });
      setStoredToken(res.token);
      setCurrentUser(res.user);
      await loadBootstrap(false);
      setRoute('admin');
      addToast(
        'success',
        `Signed in as ${res.user.name}`,
        'Exploring CampusConnect with full Administrator privileges.'
      );
    } catch (err) {
      addToast('error', 'Demo login failed', err instanceof Error ? err.message : 'Try again.');
    }
  };

  const registerStudent = async (payload: {
    name: string;
    email: string;
    password: string;
    rollNumber: string;
    department: string;
    semester: string;
    phone: string;
  }): Promise<boolean> => {
    try {
      const res = await apiFetch<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStoredToken(res.token);
      setCurrentUser(res.user);
      await loadBootstrap(false);
      setRoute('dashboard');
      addToast('success', 'Registration complete', `Welcome to CampusConnect, ${res.user.name}!`);
      return true;
    } catch (err) {
      addToast(
        'error',
        'Registration failed',
        err instanceof Error ? err.message : 'Could not register account.'
      );
      return false;
    }
  };

  const updateProfile = async (
    updates: Partial<Pick<User, 'name' | 'department' | 'semester' | 'phone' | 'rollNumber'>>
  ) => {
    try {
      const res = await apiFetch<{ user: User }>('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setCurrentUser(res.user);
      setUsers((prev) => prev.map((u) => (u.id === res.user.id ? res.user : u)));
      addToast('success', 'Profile updated', 'Your contact and academic details have been saved.');
    } catch (err) {
      addToast('error', 'Update failed', err instanceof Error ? err.message : 'Could not update profile.');
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setStoredToken(null);
    setCurrentUser(null);
    setRoute('landing');
    addToast('info', 'Signed out', 'You have been safely logged out of CampusConnect.');
  };

  // Lost & Found
  const addLostFoundItem = async (
    item: Omit<LostFoundItem, 'id' | 'status' | 'reportedById' | 'reportedByName' | 'createdAt'> & {
      imageFile?: File;
    }
  ) => {
    try {
      const formData = new FormData();
      formData.append('type', item.type);
      formData.append('itemName', item.itemName);
      formData.append('description', item.description);
      formData.append('category', item.category);
      formData.append('location', item.location);
      formData.append('date', item.date);
      formData.append('contactInfo', item.contactInfo);
      if (item.imageFile) {
        formData.append('image', item.imageFile);
      }

      const res = await apiFetch<{ item: LostFoundItem; activity: ActivityItem }>('/api/lost-found', {
        method: 'POST',
        body: formData,
      });
      setLostFoundItems((prev) => [res.item, ...prev]);
      setActivities((prev) => [res.activity, ...prev].slice(0, 15));
      addToast('success', 'Report published', `"${res.item.itemName}" saved to campus database.`);
    } catch (err) {
      addToast('error', 'Failed to publish report', err instanceof Error ? err.message : 'Try again.');
    }
  };

  const toggleLostFoundResolved = async (id: string) => {
    try {
      const res = await apiFetch<{ item: LostFoundItem }>(`/api/lost-found/${id}/toggle`, {
        method: 'PATCH',
      });
      setLostFoundItems((prev) => prev.map((item) => (item.id === id ? res.item : item)));
      addToast(
        'success',
        res.item.status === 'resolved' ? 'Marked as resolved' : 'Reopened report',
        `"${res.item.itemName}" status updated.`
      );
    } catch (err) {
      addToast('error', 'Action failed', err instanceof Error ? err.message : 'Could not update item.');
    }
  };

  const deleteLostFoundItem = async (id: string) => {
    try {
      await apiFetch(`/api/lost-found/${id}`, { method: 'DELETE' });
      setLostFoundItems((prev) => prev.filter((item) => item.id !== id));
      addToast('info', 'Report removed', 'The Lost & Found entry has been deleted.');
    } catch (err) {
      addToast('error', 'Delete failed', err instanceof Error ? err.message : 'Could not remove report.');
    }
  };

  // Complaints
  const addComplaint = async (
    complaint: Omit<
      Complaint,
      'id' | 'status' | 'submittedDate' | 'studentId' | 'studentName' | 'studentRoll' | 'updatedAt'
    > & { imageFile?: File }
  ) => {
    try {
      const formData = new FormData();
      formData.append('title', complaint.title);
      formData.append('category', complaint.category);
      formData.append('location', complaint.location);
      formData.append('description', complaint.description);
      if (complaint.imageFile) {
        formData.append('image', complaint.imageFile);
      }

      const res = await apiFetch<{ complaint: Complaint; activity: ActivityItem }>('/api/complaints', {
        method: 'POST',
        body: formData,
      });
      setComplaints((prev) => [res.complaint, ...prev]);
      setActivities((prev) => [res.activity, ...prev].slice(0, 15));
      addToast('success', 'Complaint submitted', 'Your ticket has been saved with status Pending.');
    } catch (err) {
      addToast('error', 'Submission failed', err instanceof Error ? err.message : 'Try again.');
    }
  };

  const updateComplaintStatus = async (id: string, status: ComplaintStatus, adminNote?: string) => {
    try {
      const res = await apiFetch<{ complaint: Complaint; activity: ActivityItem }>(
        `/api/complaints/${id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status, adminNote }),
        }
      );
      setComplaints((prev) => prev.map((c) => (c.id === id ? res.complaint : c)));
      setActivities((prev) => [res.activity, ...prev].slice(0, 15));
      addToast('success', 'Complaint status updated', `Ticket moved to ${status}.`);
    } catch (err) {
      addToast('error', 'Update failed', err instanceof Error ? err.message : 'Could not update status.');
    }
  };

  // Notices
  const addNotice = async (notice: Omit<Notice, 'id' | 'publishedDate' | 'authorName'>) => {
    try {
      const res = await apiFetch<{ notice: Notice; activity: ActivityItem }>('/api/notices', {
        method: 'POST',
        body: JSON.stringify(notice),
      });
      setNotices((prev) => [res.notice, ...prev]);
      setActivities((prev) => [res.activity, ...prev].slice(0, 15));
      addToast('success', 'Notice published', `"${res.notice.title}" is live on the Digital Notice Board.`);
    } catch (err) {
      addToast('error', 'Publish failed', err instanceof Error ? err.message : 'Could not publish notice.');
    }
  };

  const updateNotice = async (id: string, updates: Partial<Omit<Notice, 'id'>>) => {
    try {
      const res = await apiFetch<{ notice: Notice }>(`/api/notices/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setNotices((prev) => prev.map((n) => (n.id === id ? res.notice : n)));
      addToast('success', 'Notice updated', 'Changes saved to the Digital Notice Board.');
    } catch (err) {
      addToast('error', 'Update failed', err instanceof Error ? err.message : 'Could not update notice.');
    }
  };

  const deleteNotice = async (id: string) => {
    try {
      await apiFetch(`/api/notices/${id}`, { method: 'DELETE' });
      setNotices((prev) => prev.filter((n) => n.id !== id));
      addToast('info', 'Notice removed', 'The announcement has been deleted.');
    } catch (err) {
      addToast('error', 'Delete failed', err instanceof Error ? err.message : 'Could not remove notice.');
    }
  };

  // Study Materials
  const addMaterial = async (
    material: Omit<StudyMaterial, 'id' | 'uploaderId' | 'uploaderName' | 'uploadDate' | 'downloads'> & {
      pdfFile?: File;
    }
  ) => {
    try {
      const formData = new FormData();
      formData.append('title', material.title);
      formData.append('subject', material.subject);
      formData.append('semester', material.semester);
      formData.append('department', material.department);
      formData.append('materialType', material.materialType);
      formData.append('description', material.description);
      if (material.pdfFile) {
        formData.append('file', material.pdfFile);
      }

      const res = await apiFetch<{ material: StudyMaterial; activity: ActivityItem }>('/api/materials', {
        method: 'POST',
        body: formData,
      });
      setMaterials((prev) => [res.material, ...prev]);
      setActivities((prev) => [res.activity, ...prev].slice(0, 15));
      addToast('success', 'Study material uploaded', `"${res.material.title}" is now available.`);
    } catch (err) {
      addToast('error', 'Upload failed', err instanceof Error ? err.message : 'Could not upload material.');
    }
  };

  const deleteMaterial = async (id: string) => {
    try {
      await apiFetch(`/api/materials/${id}`, { method: 'DELETE' });
      setMaterials((prev) => prev.filter((m) => m.id !== id));
      addToast('info', 'Material deleted', 'The document was removed from the Study Materials Library.');
    } catch (err) {
      addToast('error', 'Delete failed', err instanceof Error ? err.message : 'Could not remove material.');
    }
  };

  const downloadMaterial = (id: string) => {
    const item = materials.find((m) => m.id === id);
    if (!item) return;

    const a = document.createElement('a');
    a.href = `/api/materials/${id}/download`;
    a.download = item.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setMaterials((prev) =>
      prev.map((m) => (m.id === id ? { ...m, downloads: m.downloads + 1 } : m))
    );
    addToast('success', 'Download started', `Downloading ${item.fileName}`);
  };

  // Emergency Contacts
  const addEmergencyContact = async (contact: Omit<EmergencyContact, 'id'>) => {
    try {
      const res = await apiFetch<{ contact: EmergencyContact }>('/api/emergency', {
        method: 'POST',
        body: JSON.stringify(contact),
      });
      setEmergencyContacts((prev) => [...prev, res.contact]);
      addToast('success', 'Emergency contact added', `${res.contact.officeName} added to directory.`);
    } catch (err) {
      addToast('error', 'Failed to add contact', err instanceof Error ? err.message : 'Try again.');
    }
  };

  const updateEmergencyContact = async (
    id: string,
    updates: Partial<Omit<EmergencyContact, 'id'>>
  ) => {
    try {
      const res = await apiFetch<{ contact: EmergencyContact }>(`/api/emergency/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setEmergencyContacts((prev) => prev.map((c) => (c.id === id ? res.contact : c)));
      addToast('success', 'Contact updated', 'Emergency directory details saved.');
    } catch (err) {
      addToast('error', 'Update failed', err instanceof Error ? err.message : 'Try again.');
    }
  };

  const deleteEmergencyContact = async (id: string) => {
    try {
      await apiFetch(`/api/emergency/${id}`, { method: 'DELETE' });
      setEmergencyContacts((prev) => prev.filter((c) => c.id !== id));
      addToast('info', 'Contact deleted', 'Emergency contact removed from directory.');
    } catch (err) {
      addToast('error', 'Delete failed', err instanceof Error ? err.message : 'Try again.');
    }
  };

  const recordSearch = useCallback(
    (module: SearchModule, query: string) => {
      const next = recordRecentSearch(recentSearchesRef.current, query, module);
      recentSearchesRef.current = next;
      setRecentSearches(next);
      saveStoredRecentSearches(currentUser?.id, next);
    },
    [currentUser?.id]
  );

  const removeSearch = useCallback(
    (id: string) => {
      const next = removeRecentSearch(recentSearchesRef.current, id);
      recentSearchesRef.current = next;
      setRecentSearches(next);
      saveStoredRecentSearches(currentUser?.id, next);
    },
    [currentUser?.id]
  );

  const clearRecentSearches = useCallback(() => {
    recentSearchesRef.current = [];
    setRecentSearches([]);
    saveStoredRecentSearches(currentUser?.id, []);
  }, [currentUser?.id]);

  const openRecentSearch = (entry: RecentSearchEntry) => {
    pendingSearchRef.current = { module: entry.module, query: entry.query };
    navigate(entry.module);
  };

  const consumePendingSearch = useCallback((module: SearchModule): string | null => {
    const pending = pendingSearchRef.current;
    if (pending && pending.module === module) {
      pendingSearchRef.current = null;
      return pending.query;
    }
    return null;
  }, []);

  const resetDemoData = async () => {
    try {
      await apiFetch('/api/admin/reset-demo', { method: 'POST' });
      const demo = await apiFetch<{ token: string; user: User }>('/api/auth/demo', {
        method: 'POST',
        body: JSON.stringify({ role: currentUser?.role ?? 'student' }),
      });
      setStoredToken(demo.token);
      setCurrentUser(demo.user);
      await loadBootstrap(false);
      addToast('info', 'Demo data restored', 'All CampusConnect database records were reset.');
    } catch (err) {
      addToast('error', 'Reset failed', err instanceof Error ? err.message : 'Try again.');
    }
  };

  return (
    <CampusContext.Provider
      value={{
        route,
        navigate,
        isLoadingView,
        triggerLoadingPreview,
        users,
        currentUser,
        lostFoundItems,
        complaints,
        notices,
        materials,
        emergencyContacts,
        activities,
        toasts,
        addToast,
        dismissToast,
        loginStudent,
        loginAdmin,
        loginDemoStudent,
        loginDemoAdmin,
        registerStudent,
        updateProfile,
        logout,
        addLostFoundItem,
        toggleLostFoundResolved,
        deleteLostFoundItem,
        addComplaint,
        updateComplaintStatus,
        addNotice,
        updateNotice,
        deleteNotice,
        addMaterial,
        deleteMaterial,
        downloadMaterial,
        addEmergencyContact,
        updateEmergencyContact,
        deleteEmergencyContact,
        recentSearches,
        recordSearch,
        removeSearch,
        clearRecentSearches,
        openRecentSearch,
        consumePendingSearch,
        resetDemoData,
      }}
    >
      {children}
    </CampusContext.Provider>
  );
}

export function useCampus() {
  const ctx = useContext(CampusContext);
  if (!ctx) throw new Error('useCampus must be used inside CampusProvider');
  return ctx;
}
