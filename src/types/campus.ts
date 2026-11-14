export type UserRole = 'student' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  rollNumber?: string;
  department?: string;
  semester?: string;
  phone?: string;
  joinedAt: string;
}

export type LostFoundType = 'lost' | 'found';
export type LostFoundCategory = 'Electronics' | 'Documents' | 'Books' | 'Accessories' | 'Other';
export type LostFoundStatus = 'open' | 'resolved';

export interface LostFoundItem {
  id: string;
  type: LostFoundType;
  itemName: string;
  description: string;
  category: LostFoundCategory;
  location: string;
  date: string;
  contactInfo: string;
  imageUrl?: string;
  imageExt?: string;
  status: LostFoundStatus;
  reportedById: string;
  reportedByName: string;
  createdAt: string;
}

export type ComplaintCategory =
  | 'Electricity'
  | 'Water Supply'
  | 'Classroom'
  | 'Washroom'
  | 'Internet'
  | 'Cleanliness'
  | 'Infrastructure'
  | 'Other';

export type ComplaintStatus = 'Pending' | 'In Progress' | 'Resolved';

export interface Complaint {
  id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  location: string;
  imageUrl?: string;
  imageExt?: string;
  status: ComplaintStatus;
  submittedDate: string;
  studentId: string;
  studentName: string;
  studentRoll?: string;
  adminNote?: string;
  updatedAt: string;
}

export type NoticeCategory = 'Academic' | 'Examination' | 'Events' | 'Holidays' | 'General';

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: NoticeCategory;
  publishedDate: string;
  isImportant: boolean;
  authorName: string;
}

export type MaterialType = 'PDF Notes' | 'Question Paper';

export interface StudyMaterial {
  id: string;
  title: string;
  subject: string;
  semester: string;
  department: string;
  materialType: MaterialType;
  description: string;
  fileName: string;
  fileExt?: string;
  fileSizeLabel: string;
  fileDataUrl?: string;
  uploaderId: string;
  uploaderName: string;
  uploadDate: string;
  downloads: number;
}

export type EmergencyCategory =
  | 'College Administration'
  | "Principal's Office"
  | 'College Security'
  | 'Medical Assistance'
  | 'Ambulance'
  | 'Nearby Hospital'
  | 'Fire & Emergency Services';

export interface EmergencyContact {
  id: string;
  category: EmergencyCategory;
  officeName: string;
  contactPerson: string;
  phone: string;
  alternatePhone?: string;
  location: string;
  availability: string;
  isSampleData: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  detail: string;
  module: 'notices' | 'lost-found' | 'complaints' | 'materials' | 'emergency' | 'auth';
  timestamp: string;
}

export type AppRoute =
  | 'landing'
  | 'student-login'
  | 'student-register'
  | 'admin-login'
  | 'dashboard'
  | 'lost-found'
  | 'complaints'
  | 'notices'
  | 'materials'
  | 'emergency'
  | 'profile'
  | 'admin';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  message?: string;
}
