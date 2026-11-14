import { ThemeProvider } from './context/ThemeContext';
import { CampusProvider, useCampus } from './context/CampusContext';
import { LandingPage } from './components/landing/LandingPage';
import { AuthPages } from './components/auth/AuthPages';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { LostAndFound } from './components/modules/LostAndFound';
import { ComplaintsModule } from './components/modules/ComplaintsModule';
import { NoticeBoard } from './components/modules/NoticeBoard';
import { StudyMaterials } from './components/modules/StudyMaterials';
import { EmergencyContacts } from './components/modules/EmergencyContacts';
import { ProfileSection } from './components/modules/ProfileSection';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ToastContainer } from './components/ui/ToastContainer';

function CampusRouter() {
  const { route, currentUser } = useCampus();

  if (route === 'landing') {
    return <LandingPage />;
  }

  if (route === 'student-login' || route === 'student-register' || route === 'admin-login') {
    return <AuthPages />;
  }

  if (!currentUser) {
    return <AuthPages />;
  }

  return (
    <DashboardLayout>
      {route === 'dashboard' && <StudentDashboard />}
      {route === 'lost-found' && <LostAndFound />}
      {route === 'complaints' && <ComplaintsModule />}
      {route === 'notices' && <NoticeBoard />}
      {route === 'materials' && <StudyMaterials />}
      {route === 'emergency' && <EmergencyContacts />}
      {route === 'profile' && <ProfileSection />}
      {route === 'admin' && (currentUser.role === 'admin' ? <AdminDashboard /> : <StudentDashboard />)}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CampusProvider>
        <CampusRouter />
        <ToastContainer />
      </CampusProvider>
    </ThemeProvider>
  );
}
