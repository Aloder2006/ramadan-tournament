import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';
import { recordVisit } from './services/api';

function ProtectedAdminRoute() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('adminToken') === 'ramadan-admin-ok'
  );
  if (!authenticated) {
    return <AdminLogin onSuccess={() => setAuthenticated(true)} />;
  }
  return <AdminPage onLogout={() => { sessionStorage.removeItem('adminToken'); setAuthenticated(false); }} />;
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
        <Route path="/knockout" element={<Navigate to="/" replace />} />
        <Route path="/admin" element={<ProtectedAdminRoute />} />
      </Routes>
    </BrowserRouter>
  );
}
