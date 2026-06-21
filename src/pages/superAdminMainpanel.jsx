import React, { useState, useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Users, Store, LogOut, Menu, X, FileText, Link as LinkIcon, Settings, Package, Palette, UserPlus, Layers } from 'lucide-react';

const SuperAdminMainpanel = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [myPerformanceStores, setMyPerformanceStores] = useState([]);
  const [myPerformanceDetails, setMyPerformanceDetails] = useState(null);

  // Platform Settings States
  const [platformSettings, setPlatformSettings] = useState({ mainLogoUrl: '', miniLogoUrl: '', loginImageGrid: [] });

  const superadminMenuItems = [
    { id: 'overview', name: 'Overview', path: '/dashboard/overview', icon: <LayoutDashboard size={20} /> },
    { id: 'plans', name: 'Subscription Plans', path: '/dashboard/plans', icon: <CreditCard size={20} /> },
    { id: 'users', name: 'Platform Users', path: '/dashboard/users', icon: <Users size={20} /> },
    { id: 'staff', name: 'Staff Management', path: '/dashboard/staff', icon: <UserPlus size={20} /> },
    { id: 'stores', name: 'Active Stores', path: '/dashboard/stores', icon: <Store size={20} /> },
    { id: 'policies', name: 'Platform Policies', path: '/dashboard/policies', icon: <FileText size={20} /> },
    { id: 'store-types', name: 'Store Types', icon: <Layers size={20} />, path: '/dashboard/store-types' },
    { id: 'default-products', name: 'Default Catalog', path: '/dashboard/default-products', icon: <Package size={20} /> },
    { id: 'themes', name: 'Manage Themes', path: '/dashboard/themes', icon: <Palette size={20} /> },
    { id: 'payments', name: 'Payment Gateway', path: '/dashboard/payments', icon: <CreditCard size={20} /> },
    { id: 'socials', name: 'Global Social Links', path: '/dashboard/socials', icon: <LinkIcon size={20} /> },
    { id: 'settings', name: 'Dashboard Settings', path: '/dashboard/settings', icon: <Settings size={20} /> },
  ];

  const employeeMenuItems = [
    { id: 'profile', name: 'My Profile', path: '/dashboard/profile', icon: <Users size={20} /> },
    { id: 'performance', name: 'Performance', path: '/dashboard/performance', icon: <LayoutDashboard size={20} /> },
    { id: 'my-store', name: 'My Stores', path: '/dashboard/my-store', icon: <Store size={20} /> },
    { id: 'earning', name: 'My Earnings', path: '/dashboard/earning', icon: <CreditCard size={20} /> },
  ];

  const menuItems = currentUser?.isStaff ? employeeMenuItems : superadminMenuItems;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
        
        // 1. Fetch current user profile first
        const meRes = await fetch(`${envUrl}/api/superadmin/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!meRes.ok) {
          localStorage.removeItem('superadmin_token');
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        const meData = await meRes.json();
        setCurrentUser(meData);

        // 2. Fetch employee performance details if user is staff
        if (meData.isStaff) {
          try {
            const perfRes = await fetch(`${envUrl}/api/staff-performance/details`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (perfRes.ok) {
              const data = await perfRes.json();
              setMyPerformanceDetails(data);
              setMyPerformanceStores(data.stores || []);
            }
          } catch (perfErr) {
            console.error("Failed to load staff performance details", perfErr);
          }
        }

        // 3. Fetch general platform admin data
        const API_BASE_URL = `${envUrl}/api/superadmin`;
        const response = await fetch(`${API_BASE_URL}/data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const responsePlans = await fetch(`${API_BASE_URL}/plans`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Fetch platform settings (public route)
        const responseSettings = await fetch(`${envUrl}/api/platform-settings`);

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
          setStores(data.stores || []);
          if (responsePlans.ok) {
            setPlans(await responsePlans.json());
          }
          if (responseSettings.ok) {
            setPlatformSettings(await responseSettings.json());
          }
        } else {
          // If staff, response might be 403, which is expected since they don't manage platform users/stores.
          if (!meData.isStaff) {
            setError('Failed to fetch platform data. Please relogin.');
          }
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Employee-specific routing redirect: if they land on overview, redirect to profile
  useEffect(() => {
    if (currentUser?.isStaff && (location.pathname === '/dashboard' || location.pathname === '/dashboard/overview' || location.pathname === '/dashboard/')) {
      navigate('/dashboard/profile', { replace: true });
    }
  }, [currentUser, location.pathname, navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-slate-500 bg-slate-50">Loading Platform Data...</div>;

  const activeTabId = location.pathname.split('/')[2] || 'overview';

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900 w-full overflow-hidden text-left">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed md:relative inset-y-0 left-0 z-50 w-64 min-h-screen bg-slate-900 text-white flex flex-col shrink-0 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 shrink-0">
          {platformSettings.mainLogoUrl ? (
            <img src={platformSettings.mainLogoUrl} alt="Platform Logo" className="h-14 w-full object-contain bg-white px-2 py-1 rounded" />
          ) : (
            <span className="text-xl font-black tracking-wide text-white">GB <span className="text-blue-500">SYSADMIN</span></span>
          )}
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                navigate(item.path);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTabId === item.id
                  ? 'bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              <span className="text-sm tracking-wide font-medium">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all duration-200 font-bold">
            <LogOut size={20} />
            <span className="text-sm">Secure Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-sm border-b border-slate-200 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-md md:hidden transition-colors">
              <Menu size={24} />
            </button>
            <span className="text-xl font-bold text-slate-800">
              {menuItems.find(m => m.id === activeTabId)?.name || 'Dashboard'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end hidden sm:block">
              <span className="text-sm font-bold text-slate-800">{currentUser?.name || 'Super Admin'}</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{currentUser?.role || 'System'}</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200 uppercase">
              {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'SA'}
            </div>
          </div>
        </nav>

        <main className="w-full flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}
          <Outlet context={{ users, setUsers, stores, plans, setPlans, platformSettings, setPlatformSettings, currentUser, setCurrentUser, myPerformanceStores, setMyPerformanceStores, myPerformanceDetails, setMyPerformanceDetails }} />
        </main>
      </div>
    </div>
  );
};

export default SuperAdminMainpanel;