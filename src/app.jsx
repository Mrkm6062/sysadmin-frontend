import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/superAdminLogin';
import Mainpanel from './pages/superAdminMainpanel';

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
          element={<Mainpanel />} 
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