import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import RiskMatrix from './pages/RiskMatrix';
import Controls from './pages/Controls';
import Calendar from './pages/Calendar';
import ActionPlans from './pages/ActionPlans';
import ReportsLogs from './pages/ReportsLogs';
import UsersConfig from './pages/UsersConfig';
import Login from './pages/Login';
import './index.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('controlvivo_auth') === 'true'
  );

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setIsAuthenticated(true)} />} />
        
        {/* Rutas protegidas (Guardian) */}
        <Route path="/" element={isAuthenticated ? <MainLayout onLogout={() => setIsAuthenticated(false)} /> : <Navigate to="/login" replace />}>
          <Route index element={<Dashboard />} />
          <Route path="matriz-riesgos" element={<RiskMatrix />} />
          <Route path="controles" element={<Controls />} />
          <Route path="calendario" element={<Calendar />} />
          <Route path="planes" element={<ActionPlans />} />
          <Route path="reportes" element={<ReportsLogs />} />
          <Route path="configuracion" element={<UsersConfig />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
