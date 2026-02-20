import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import AdminLogin from './pages/AdminLogin';

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
