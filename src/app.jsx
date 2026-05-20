import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/superAdminLogin';
import Mainpanel from './pages/superAdminMainpanel';
import SuperadminManageThemes from './pages/SuperadminManageThemes';

// Authentication Wrapper Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token'); // Check if user is logged in
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<Login />} 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Mainpanel />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/superadmin/themes" 
          element={
            <ProtectedRoute>
              <SuperadminManageThemes />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/" 
          element={<Navigate to="/dashboard" />} 
        />
        <Route 
          path="*" 
          element={<Navigate to="/dashboard" />} 
        />
      </Routes>
    </Router>
  );
}

export default App;