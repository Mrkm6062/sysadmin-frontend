import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/superAdminLogin';
import Mainpanel from './pages/superAdminMainpanel';
import SuperadminManageThemes from './pages/SuperadminManageThemes';

// Import tab components for routing
import OverviewTab from './pages/tabs/OverviewTab';
import PlansTab from './pages/tabs/PlansTab';
import UsersTab from './pages/tabs/UsersTab';
import StoresTab from './pages/tabs/StoresTab';
import PoliciesTab from './pages/tabs/PoliciesTab';
import DefaultProductsTab from './pages/tabs/DefaultProductsTab';
import PaymentsTab from './pages/tabs/PaymentsTab';
import SocialsTab from './pages/tabs/SocialsTab';
import SettingsTab from './pages/tabs/SettingsTab';

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
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Mainpanel /></ProtectedRoute>}>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<OverviewTab />} />
          <Route path="plans" element={<PlansTab />} />
          <Route path="users" element={<UsersTab />} />
          <Route path="stores" element={<StoresTab />} />
          <Route path="policies" element={<PoliciesTab />} />
          <Route path="default-products" element={<DefaultProductsTab />} />
          <Route path="themes" element={<SuperadminManageThemes />} />
          <Route path="payments" element={<PaymentsTab />} />
          <Route path="socials" element={<SocialsTab />} />
          <Route path="settings" element={<SettingsTab />} />
        </Route>
        
        {/* Redirect root and old dashboard URL to the new default */}
        <Route path="/" element={<Navigate to="/dashboard/overview" />} />
        
        {/* Fallback for any other unknown routes */}
        <Route path="*" element={<Navigate to="/dashboard/overview" />} />
      </Routes>
    </Router>
  );
}

export default App;