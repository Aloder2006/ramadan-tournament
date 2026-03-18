import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, lazy, Suspense } from 'react';
import HomePage from './pages/HomePage';
import PredictPage from './pages/PredictPage';
import { recordVisit } from './services/api';

import { AdminProvider } from './admin/AdminContext';

// Lazy-load admin UI components
const AdminLayout = lazy(() => import('./admin/AdminLayout'));
const AdminLogin = lazy(() => import('./admin/AdminLogin'));

const LoadingScreen = () => (
  <div className="loading-screen"><div className="loader" /><p>جاري التحميل...</p></div>
);

function ProtectedAdminRoute() {
  const [authenticated, setAuthenticated] = useState(
    () => !!sessionStorage.getItem('adminToken')
  );
  if (!authenticated) {
    return (
      <Suspense fallback={<LoadingScreen />}>
        <AdminLogin onSuccess={() => setAuthenticated(true)} />
      </Suspense>
    );
  }
  return (
    <Suspense fallback={<LoadingScreen />}>
      <AdminProvider>
        <AdminLayout onLogout={() => { sessionStorage.removeItem('adminToken'); setAuthenticated(false); }} />
      </AdminProvider>
    </Suspense>
  );
}

export default function App() {
  useEffect(() => {
    const checkVisit = async () => {
      const lastVisitTime = localStorage.getItem('lastVisitTime');
      const ONE_HOUR = 60 * 60 * 1000;
      const now = Date.now();
      if (!lastVisitTime || now - parseInt(lastVisitTime, 10) > ONE_HOUR) {
        try {
          await recordVisit();
          localStorage.setItem('lastVisitTime', now.toString());
        } catch (error) {
          console.error("Error logging visit:", error);
        }
      }
    };
    checkVisit();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/predict" element={<PredictPage />} />
        <Route path="/knockout" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
