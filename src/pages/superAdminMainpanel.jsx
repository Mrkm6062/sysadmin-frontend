import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Users, Store, LogOut, Menu, X, FileText, Link as LinkIcon, Trash2, Settings, Package, Palette } from 'lucide-react';

import OverviewTab from './tabs/OverviewTab';
import PlansTab from './tabs/PlansTab';
import UsersTab from './tabs/UsersTab';
import StoresTab from './tabs/StoresTab';
import PoliciesTab from './tabs/PoliciesTab';
import DefaultProductsTab from './tabs/DefaultProductsTab';
import PaymentsTab from './tabs/PaymentsTab';
import SocialsTab from './tabs/SocialsTab';
import SettingsTab from './tabs/SettingsTab';

const SuperAdminMainpanel = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  

  // Platform Settings States
  const [platformSettings, setPlatformSettings] = useState({ mainLogoUrl: '', miniLogoUrl: '', loginImageGrid: [] });

  const menuItems = [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'plans', name: 'Subscription Plans', icon: <CreditCard size={20} /> },
    { id: 'users', name: 'Platform Users', icon: <Users size={20} /> },
    { id: 'stores', name: 'Active Stores', icon: <Store size={20} /> },
    { id: 'policies', name: 'Platform Policies', icon: <FileText size={20} /> },
    { id: 'default-products', name: 'Default Catalog', icon: <Package size={20} /> },
    { id: 'themes', name: 'Manage Themes', icon: <Palette size={20} />, path: '/superadmin/themes' },
    { id: 'payments', name: 'Payment Gateway', icon: <CreditCard size={20} /> },
    { id: 'socials', name: 'Global Social Links', icon: <LinkIcon size={20} /> },
    { id: 'settings', name: 'Dashboard Settings', icon: <Settings size={20} /> },
  ];
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('superadmin_token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('superadmin_token');
        if (!token) {
          navigate('/login');
          return;
        }

        const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
        const API_BASE_URL = `${envUrl}/api/superadmin`;
        const response = await fetch(`${API_BASE_URL}/data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const responsePlans = await fetch(`${API_BASE_URL}/plans`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Fetch platform settings (this is a public route, but we can call it)
        const envPublicUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
        const API_PUBLIC_URL = envPublicUrl;
        const responseSettings = await fetch(`${API_PUBLIC_URL}/api/platform-settings`);

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
          setError('Failed to fetch platform data. Please relogin.');
        }
      } catch (err) {
        setError('Network error: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-slate-500 bg-slate-50">Loading Platform Data...</div>;

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
            <img src={platformSettings.mainLogoUrl} alt="Platform Logo" className="h-14 w-50 rounded-full object-contain bg-white px-2 py-1 rounded" />
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
                if (item.path) {
                  navigate(item.path);
                } else {
                  setActiveTab(item.id); 
                  setIsMobileMenuOpen(false); 
                }
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
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
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-slate-50">
        {/* Top Navigation Bar */}
        <nav className="bg-white shadow-sm border-b border-slate-200 px-4 sm:px-6 py-4 flex justify-between items-center sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-3 sm:gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-1 -ml-1 text-slate-600 hover:bg-slate-100 rounded-md md:hidden transition-colors">
              <Menu size={24} />
            </button>
            <span className="text-xl font-bold text-slate-800">
              {menuItems.find(m => m.id === activeTab)?.name || 'Dashboard'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm border border-blue-200">
              SA
            </div>
          </div>
        </nav>

        <main className="w-full p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

        {activeTab === 'overview' && <OverviewTab users={users} stores={stores} />}
        {activeTab === 'plans' && <PlansTab plans={plans} setPlans={setPlans} />}
        {activeTab === 'users' && <UsersTab users={users} setUsers={setUsers} />}
        {activeTab === 'stores' && <StoresTab stores={stores} plans={plans} />}
        {activeTab === 'policies' && <PoliciesTab />}
        {activeTab === 'default-products' && <DefaultProductsTab />}
        {activeTab === 'payments' && <PaymentsTab />}
        {activeTab === 'socials' && <SocialsTab />}
        {activeTab === 'settings' && <SettingsTab platformSettings={platformSettings} setPlatformSettings={setPlatformSettings} />}
      </main>
      </div>
    </div>
  );
};

export default SuperAdminMainpanel;