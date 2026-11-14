import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { hashPassword } from './auth.ts';

export const STORAGE_ROOT = path.resolve(process.cwd(), 'storage');
export const UPLOADS_ROOT = path.join(STORAGE_ROOT, 'uploads');
export const LOST_FOUND_UPLOAD_DIR = path.join(UPLOADS_ROOT, 'lost-found');
export const COMPLAINTS_UPLOAD_DIR = path.join(UPLOADS_ROOT, 'complaints');
export const MATERIALS_UPLOAD_DIR = path.join(UPLOADS_ROOT, 'materials');
export const DB_PATH = path.join(STORAGE_ROOT, 'campusconnect.db');

for (const dir of [
  STORAGE_ROOT,
  UPLOADS_ROOT,
  LOST_FOUND_UPLOAD_DIR,
  COMPLAINTS_UPLOAD_DIR,
  MATERIALS_UPLOAD_DIR,
]) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('student', 'admin')),
    roll_number TEXT,
    department TEXT,
    semester TEXT,
    phone TEXT,
    joined_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    token TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS lost_found_items (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK(type IN ('lost', 'found')),
    item_name TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    date TEXT NOT NULL,
    contact_info TEXT NOT NULL,
    image_url TEXT,
    image_ext TEXT,
    status TEXT NOT NULL CHECK(status IN ('open', 'resolved')),
    reported_by_id TEXT NOT NULL,
    reported_by_name TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS complaints (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    location TEXT NOT NULL,
    image_url TEXT,
    image_ext TEXT,
    status TEXT NOT NULL CHECK(status IN ('Pending', 'In Progress', 'Resolved')),
    submitted_date TEXT NOT NULL,
    student_id TEXT NOT NULL,
    student_name TEXT NOT NULL,
    student_roll TEXT,
    admin_note TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    published_date TEXT NOT NULL,
    is_important INTEGER NOT NULL DEFAULT 0,
    author_name TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS study_materials (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    semester TEXT NOT NULL,
    department TEXT NOT NULL,
    material_type TEXT NOT NULL,
    description TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_ext TEXT NOT NULL DEFAULT 'pdf',
    file_size_label TEXT NOT NULL,
    file_disk_path TEXT,
    uploader_id TEXT NOT NULL,
    uploader_name TEXT NOT NULL,
    upload_date TEXT NOT NULL,
    downloads INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS emergency_contacts (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    office_name TEXT NOT NULL,
    contact_person TEXT NOT NULL,
    phone TEXT NOT NULL,
    alternate_phone TEXT,
    location TEXT NOT NULL,
    availability TEXT NOT NULL,
    is_sample_data INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS activities (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    detail TEXT NOT NULL,
    module TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    created_order INTEGER NOT NULL
  );
`);

function copySeedImageIfAvailable(sourceFileName: string, targetFileName: string): string | null {
  const srcPath = path.resolve(process.cwd(), 'src', 'assets', 'images', sourceFileName);
  const destPath = path.join(LOST_FOUND_UPLOAD_DIR, targetFileName);
  if (fs.existsSync(srcPath)) {
    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath);
    }
    return `/uploads/lost-found/${targetFileName}`;
  }
  return null;
}

export function seedDatabaseIfEmpty(force = false): void {
  if (force) {
    db.exec(`
      DELETE FROM sessions;
      DELETE FROM activities;
      DELETE FROM emergency_contacts;
      DELETE FROM study_materials;
      DELETE FROM notices;
      DELETE FROM complaints;
      DELETE FROM lost_found_items;
      DELETE FROM users;
    `);
  }

  const userCountRow = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCountRow.count > 0) return;

  const insertUser = db.prepare(`
    INSERT INTO users (id, name, email, password_hash, role, roll_number, department, semester, phone, joined_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedUsers = [
    ['stu-1', 'Aarav Sharma', 'student@campusconnect.edu', hashPassword('campus123'), 'student', 'CS2024-042', 'Computer Science & Engineering', 'Semester 5', '+91 98765 43210', '2024-08-12'],
    ['stu-2', 'Priya Menon', 'priya.menon@campusconnect.edu', hashPassword('password123'), 'student', 'EC2024-019', 'Electronics & Communication', 'Semester 5', '+91 98201 55412', '2024-08-14'],
    ['stu-3', 'Rohan Deshmukh', 'rohan.d@campusconnect.edu', hashPassword('password123'), 'student', 'ME2023-088', 'Mechanical Engineering', 'Semester 7', '+91 97654 22109', '2023-08-10'],
    ['stu-4', 'Ananya Verma', 'ananya.v@campusconnect.edu', hashPassword('password123'), 'student', 'BT2025-015', 'Biotechnology', 'Semester 3', '+91 99110 88231', '2025-08-18'],
    ['adm-1', 'Dr. Meera Nair', 'admin@campusconnect.edu', hashPassword('admin123'), 'admin', null, 'Dean of Student Affairs', null, '+91 98111 00400', '2022-06-01'],
  ];

  for (const u of seedUsers) {
    insertUser.run(...u);
  }

  const laptopUrl = copySeedImageIfAvailable('item_laptop_sleeve_1794555522824.jpg', 'seed-laptop-sleeve.jpg');
  const idCardUrl = copySeedImageIfAvailable('item_student_id_1794555522875.jpg', 'seed-student-id.jpg');
  const headphonesUrl = copySeedImageIfAvailable('item_headphones_case_1794555523617.jpg', 'seed-headphones.jpg');

  const insertLf = db.prepare(`
    INSERT INTO lost_found_items (id, type, item_name, description, category, location, date, contact_info, image_url, image_ext, status, reported_by_id, reported_by_name, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedLf = [
    ['lf-1', 'found', 'Navy Laptop Sleeve & Silver Ultrabook', 'Found on the second-floor quiet reading table near the East window. Left inside a dark navy zippered sleeve with a spiral notebook.', 'Electronics', 'Central Library, 2nd Floor', '2026-11-11', 'Library Helpdesk · +91 98765 11022', laptopUrl, laptopUrl ? 'jpg' : null, 'open', 'stu-2', 'Priya Menon', '2026-11-11T14:20:00Z'],
    ['lf-2', 'found', 'Campus Smart ID Card & Brass Key', 'Blue university lanyard with a smart access card and single brass room key found on the concrete bench outside the Science Quad.', 'Documents', 'Science Quad Courtyard Bench', '2026-11-12', 'Campus Security Desk · +91 98765 11000', idCardUrl, idCardUrl ? 'jpg' : null, 'open', 'adm-1', 'Dr. Meera Nair', '2026-11-12T09:15:00Z'],
    ['lf-3', 'lost', 'Matte Black Wireless Over-Ear Headphones', 'Left behind after the morning Fluid Mechanics lecture in Hall 301. Headphones were resting on top of a blue spiral engineering notebook.', 'Electronics', 'Lecture Hall 301, Engineering Block', '2026-11-10', 'Aarav Sharma · student@campusconnect.edu', headphonesUrl, headphonesUrl ? 'jpg' : null, 'open', 'stu-1', 'Aarav Sharma', '2026-11-10T16:40:00Z'],
    ['lf-4', 'lost', 'Introduction to Algorithms (CLRS) Hardcover', '4th Edition textbook with sticky tabs on Chapters 15 and 22 and initials "A.S." written on the inner cover.', 'Books', 'Computer Lab 4, Block C', '2026-11-09', 'Aarav Sharma · +91 98765 43210', null, null, 'open', 'stu-1', 'Aarav Sharma', '2026-11-09T11:10:00Z'],
    ['lf-5', 'found', 'Stainless Steel Insulated Water Bottle', 'Matte slate insulated flask with a university hackathon sticker. Kept safely at the Student Union Reception.', 'Accessories', 'Student Union Cafeteria', '2026-11-07', 'Student Union Desk · union@campusconnect.edu', null, null, 'resolved', 'stu-3', 'Rohan Deshmukh', '2026-11-07T13:05:00Z'],
  ];

  for (const item of seedLf) {
    insertLf.run(...item);
  }

  const insertComplaint = db.prepare(`
    INSERT INTO complaints (id, title, description, category, location, image_url, image_ext, status, submitted_date, student_id, student_name, student_roll, admin_note, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedComplaints = [
    ['cmp-1', 'Intermittent Wi-Fi Dropouts in Block C Labs', 'Campus EduNet wireless network disconnects every 10 minutes in Computer Labs 3 and 4 during afternoon practical sessions, interrupting cloud lab submissions.', 'Internet', 'Academic Block C · Labs 3 & 4', null, null, 'In Progress', '2026-11-10', 'stu-1', 'Aarav Sharma', 'CS2024-042', 'IT Networking team is replacing the access point controller on Floor 2.', '2026-11-11'],
    ['cmp-2', 'Flickering Overhead LED Panels in Room 204', 'Two ceiling light fixtures near the whiteboard flicker continuously, causing eye strain during morning lectures.', 'Electricity', 'Lecture Block A · Room 204', null, null, 'Pending', '2026-11-12', 'stu-1', 'Aarav Sharma', 'CS2024-042', null, '2026-11-12'],
    ['cmp-3', 'Drinking Water Cooler Not Cooling on 3rd Floor', 'The purified water dispenser outside the Electronics corridor dispenses warm water and has low flow pressure.', 'Water Supply', 'Electronics Wing · 3rd Floor Corridor', null, null, 'Pending', '2026-11-11', 'stu-2', 'Priya Menon', 'EC2024-019', null, '2026-11-11'],
    ['cmp-4', 'Broken HDMI Input on Auditorium Projector', 'The primary lectern HDMI cable fails to detect laptops, requiring faculty to use adapters before seminars.', 'Classroom', 'Main Seminar Hall · Ground Floor', null, null, 'Resolved', '2026-11-05', 'stu-3', 'Rohan Deshmukh', 'ME2023-088', 'Replaced HDMI matrix cable and tested with USB-C and HDMI laptops.', '2026-11-08'],
    ['cmp-5', 'Washroom Exhaust Fan & Tap Leak', 'The second basin tap in the Ground Floor Boys Washroom drips continuously and the exhaust fan is non-functional.', 'Washroom', 'Mechanical Block · Ground Floor', null, null, 'In Progress', '2026-11-09', 'stu-3', 'Rohan Deshmukh', 'ME2023-088', 'Plumbing valve replacement scheduled for today at 4:00 PM.', '2026-11-11'],
  ];

  for (const c of seedComplaints) {
    insertComplaint.run(...c);
  }

  const insertNotice = db.prepare(`
    INSERT INTO notices (id, title, description, category, published_date, is_important, author_name)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const seedNotices = [
    ['not-1', 'End-Semester Examination Timetable & Hall Ticket Release', 'The final timetable for Odd Semester theory and practical examinations (December 2 – December 18, 2026) has been finalized. Students must verify their registered course codes and download digital hall tickets from the Examination Cell portal before November 24. Carry your physical University ID card to every exam session.', 'Examination', '2026-11-12', 1, 'Controller of Examinations'],
    ['not-2', 'Annual Inter-University Coding & Innovation Hackathon 2026', 'Registrations are open for InnovateU 2026, our 24-hour campus software and hardware buildathon hosted at the Innovation Commons on November 28–29. Teams of 2 to 4 students across all departments may submit problem statements in Smart Campus, FinTech, HealthTech, and Sustainability.', 'Events', '2026-11-11', 1, 'Student Innovation Council'],
    ['not-3', 'Central Library Extended Study Hours During Exam Prep', 'From November 18 through December 18, the Central Library Reading Wing (Floors 1 & 2) will remain open until 11:30 PM on weekdays and 9:00 PM on weekends. Overnight quiet pods can be reserved at the ground-floor circulation desk.', 'Academic', '2026-11-10', 0, 'Chief University Librarian'],
    ['not-4', 'Campus Holiday Notice: Founder’s Commemoration Day', 'All academic classes, laboratory sessions, and administrative offices will remain closed on Friday, November 20, 2026 in observance of Founder’s Commemoration Day. Essential campus security and medical clinic services will continue to operate 24/7.', 'Holidays', '2026-11-08', 0, 'Office of the Registrar'],
    ['not-5', 'Scholarship Renewal & Fee Waiver Verification Window', 'Merit-cum-Means and State Scholarship recipients for Academic Year 2026–27 are requested to submit their attendance certificates at Student Accounts Counter 2 by November 25 to ensure timely disbursement.', 'General', '2026-11-06', 0, 'Student Welfare Office'],
  ];

  for (const n of seedNotices) {
    insertNotice.run(...n);
  }

  const insertMaterial = db.prepare(`
    INSERT INTO study_materials (id, title, subject, semester, department, material_type, description, file_name, file_ext, file_size_label, file_disk_path, uploader_id, uploader_name, upload_date, downloads)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedMaterials = [
    ['mat-1', 'Data Structures & Graph Algorithms Complete Notes', 'Data Structures & Algorithms', 'Semester 3', 'Computer Science & Engineering', 'PDF Notes', 'Comprehensive lecture notes covering AVL Trees, Heaps, Dijkstra’s Shortest Path, Minimum Spanning Trees, and Dynamic Programming patterns with complexity proofs.', 'CS301_Data_Structures_Notes.pdf', 'pdf', '2.4 MB', null, 'stu-1', 'Aarav Sharma', '2026-11-08', 128],
    ['mat-2', 'Operating Systems End-Semester Question Papers (2022–2025)', 'Operating Systems', 'Semester 5', 'Computer Science & Engineering', 'Question Paper', 'Compiled archive of past 4 years of university end-semester examination papers including CPU scheduling, deadlocks, virtual memory paging, and file systems.', 'CS502_OS_Past_Papers_2022_2025.pdf', 'pdf', '1.8 MB', null, 'adm-1', 'Dr. Meera Nair', '2026-11-10', 214],
    ['mat-3', 'Digital Signal Processing Formula Sheet & Solved Examples', 'Digital Signal Processing', 'Semester 5', 'Electronics & Communication', 'PDF Notes', 'Concise Z-Transform properties, DFT/FFT butterfly diagrams, FIR window design equations, and 15 solved numerical problems for exam revision.', 'EC504_DSP_Revision_Guide.pdf', 'pdf', '1.3 MB', null, 'stu-2', 'Priya Menon', '2026-11-09', 89],
    ['mat-4', 'Engineering Thermodynamics Mid-Term Question Bank', 'Thermodynamics', 'Semester 3', 'Mechanical Engineering', 'Question Paper', 'Topic-wise mid-term and sessional question bank covering First & Second Laws, Entropy, Carnot/Rankine cycles, and steam table problems.', 'ME301_Thermodynamics_QBank.pdf', 'pdf', '960 KB', null, 'stu-3', 'Rohan Deshmukh', '2026-11-04', 67],
    ['mat-5', 'Database Management Systems SQL & Normalization Lab Manual', 'Database Management Systems', 'Semester 4', 'Computer Science & Engineering', 'PDF Notes', 'Step-by-step relational algebra, BCNF/3NF decomposition walkthroughs, indexing with B+ Trees, and ACID transaction isolation exercises.', 'CS403_DBMS_Lab_Manual.pdf', 'pdf', '2.1 MB', null, 'stu-1', 'Aarav Sharma', '2026-11-02', 152],
  ];

  for (const m of seedMaterials) {
    insertMaterial.run(...m);
  }

  const insertEmergency = db.prepare(`
    INSERT INTO emergency_contacts (id, category, office_name, contact_person, phone, alternate_phone, location, availability, is_sample_data)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const seedEmergency = [
    ['emg-1', 'College Administration', 'Registrar & Central Admin Office', 'Mr. Rajesh Kulkarni (Administrative Officer)', '+91 11 2659 1010', '+91 11 2659 1011', 'Main Administration Building, Ground Floor', 'Mon–Sat · 8:30 AM – 6:00 PM', 1],
    ['emg-2', "Principal's Office", 'Office of the Principal & Dean', 'Prof. (Dr.) Arvind Krishnan', '+91 11 2659 1001', null, 'Main Administration Building, 1st Floor', 'Mon–Fri · 9:00 AM – 5:30 PM', 1],
    ['emg-3', 'College Security', '24/7 Campus Security Control Room', 'Chief Security Officer Vikram Singh', '+91 11 2659 1999', '+91 98100 11999', 'Main Gate Security Post & Hostel Patrol', '24/7 Emergency Response', 1],
    ['emg-4', 'Medical Assistance', 'University Health & Wellness Center', 'Dr. Kavita Rao (Campus Medical Officer)', '+91 11 2659 1222', null, 'Beside Hostel Block A, Health Wing', '24/7 On-Call Duty Doctor & Nurse', 1],
    ['emg-5', 'Ambulance', 'Campus Rapid Ambulance Dispatch', 'Emergency Paramedic Team', '108', '+91 98100 10800', 'Health Center Bay · 3-Minute Campus Dispatch', '24/7 Emergency Dispatch', 1],
    ['emg-6', 'Nearby Hospital', 'Metro City Multi-Specialty Hospital', '24-Hour Trauma & Emergency Desk', '+91 11 4050 9000', null, '1.8 km from North Campus Gate (University Ring Road)', '24/7 Trauma & ICU Care', 1],
    ['emg-7', 'Fire & Emergency Services', 'Fire Rescue & Disaster Response', 'Municipal Fire Station & Campus Safety Marshal', '101', '112', 'Sector 4 Fire Station · Campus Safety Grid', '24/7 Rapid Fire & Rescue', 1],
  ];

  for (const e of seedEmergency) {
    insertEmergency.run(...e);
  }

  const insertActivity = db.prepare(`
    INSERT INTO activities (id, title, detail, module, timestamp, created_order)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const seedActivities = [
    ['act-1', 'End-Semester Examination Timetable Published', 'Marked as Important by Controller of Examinations', 'notices', '2026-11-12 · 09:30 AM', 4],
    ['act-2', 'Campus Smart ID Card Reported Found', 'Science Quad Courtyard Bench · Reported by Dr. Meera Nair', 'lost-found', '2026-11-12 · 09:15 AM', 3],
    ['act-3', 'Wi-Fi Dropouts Complaint Updated to In Progress', 'Academic Block C · IT Networking team assigned', 'complaints', '2026-11-11 · 04:45 PM', 2],
    ['act-4', 'Operating Systems Past Papers (2022–2025) Uploaded', 'Computer Science & Engineering · Semester 5', 'materials', '2026-11-10 · 02:10 PM', 1],
  ];

  for (const a of seedActivities) {
    insertActivity.run(...a);
  }
}

seedDatabaseIfEmpty();
