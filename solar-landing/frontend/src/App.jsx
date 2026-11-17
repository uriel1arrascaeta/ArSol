import React, { useState } from 'react';
import Landing from './Landing';
import Dashboard from './Dashboard';
import AdminLogin from './AdminLogin';

const App = () => {
  // Persistir la sesión usando localStorage
  const [currentView, setCurrentView] = useState(() =>
    localStorage.getItem('isAuthenticated') === 'true' ? 'dashboard' : 'landing'
  );

  const handleLogin = () => {
    localStorage.setItem('isAuthenticated', 'true');
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('token');
    setCurrentView('landing');
  };

  if (currentView === 'login') {
    return <AdminLogin onLogin={handleLogin} onBack={() => setCurrentView('landing')} />;
  }

  if (currentView === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  return <Landing onAdminClick={() => setCurrentView('login')} />;
};

export default App;
