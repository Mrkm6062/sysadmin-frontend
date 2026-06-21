import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/superAdminLogin';
import Mainpanel from './pages/superAdminMainpanel';
import SuperadminManageThemes from './pages/SuperadminManageThemes';

// Import tab components for routing
import OverviewTab from './pages/OverviewTab';
import PlansTab from './pages/PlansTab';
import UsersTab from './pages/UsersTab';
import StoresTab from './pages/StoresTab';
import PoliciesTab from './pages/PoliciesTab';
import DefaultProductsTab from './pages/DefaultProductsTab';
import PaymentsTab from './pages/PaymentsTab';
import SocialsTab from './pages/SocialsTab';
import SettingsTab from './pages/SettingsTab';
import StaffTab from './pages/StaffTab';
import SuperadminManageStoreType from './pages/SuperadminManageStoreType';

// Employee-specific tabs
import ProfileTab from './pages/ProfileTab';
import PerformanceTab from './pages/PerformanceTab';
import MyStoreTab from './pages/MyStoreTab';
import EarningTab from './pages/EarningTab';

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
          <Route path="staff" element={<StaffTab />} />
          <Route path="stores" element={<StoresTab />} />
          <Route path="policies" element={<PoliciesTab />} />
          <Route path="default-products" element={<DefaultProductsTab />} />
          <Route path="themes" element={<SuperadminManageThemes />} />
          <Route path="payments" element={<PaymentsTab />} />
          <Route path="socials" element={<SocialsTab />} />
          <Route path="settings" element={<SettingsTab />} />
          <Route path="store-types" element={<SuperadminManageStoreType />} />
          
          {/* Employee Routes */}
          <Route path="profile" element={<ProfileTab />} />
          <Route path="performance" element={<PerformanceTab />} />
          <Route path="my-store" element={<MyStoreTab />} />
          <Route path="earning" element={<EarningTab />} />
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