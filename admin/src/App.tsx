import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import CarsPage from './pages/CarsPage';
import SmsPage from './pages/SmsPage';
import GroupsPage from './pages/GroupsPage';
import UsersPage from './pages/UsersPage';
import StatisticsPage from './pages/StatisticsPage';
import CallbacksPage from './pages/CallbacksPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout>
                <Routes>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/leads" element={<LeadsPage />} />
                  <Route path="/leads/:id" element={<LeadDetailPage />} />
                  <Route path="/cars" element={<CarsPage />} />
                  <Route path="/sms" element={<SmsPage />} />
                  <Route path="/groups" element={<GroupsPage />} />
                  <Route path="/users" element={<UsersPage />} />
                  <Route path="/statistics" element={<StatisticsPage />} />
                  <Route path="/callbacks" element={<CallbacksPage />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </AuthProvider>
  );
}
