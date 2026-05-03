import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, CreditCard, Users, Store, LogOut, Menu, X, FileText, Link as LinkIcon, Trash2, Settings } from 'lucide-react';

const SuperAdminMainpanel = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: 'Starter',
    price: 0,
    maxProducts: 50,
    storeLimit: 1,
    storageLimit: 500,
    customDomain: false,
    freeSsl: false,
    securityHeaders: false,
    basicAnalytics: false,
    advanceAnalytics: false,
    whatsappOrderButton: false,
    sevenDaysTrial: true,
    themes: false,
    prioritySupport: false
  });
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Policy States
  const [policies, setPolicies] = useState([]);
  const [isPolicyFormOpen, setIsPolicyFormOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    type: 'privacy', title: '', content: '', version: '1.0', isActive: true
  });
  
  // Social Media States
  const [platformSocials, setPlatformSocials] = useState([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState('Facebook');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [socialStatus, setSocialStatus] = useState('');

  // Platform Settings States
  const [platformSettings, setPlatformSettings] = useState({ mainLogoUrl: '', loginImageGrid: [] });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingGrid, setUploadingGrid] = useState(false);
  const [settingsStatus, setSettingsStatus] = useState('');


  const menuItems = [
    { id: 'overview', name: 'Overview', icon: <LayoutDashboard size={20} /> },
    { id: 'plans', name: 'Subscription Plans', icon: <CreditCard size={20} /> },
    { id: 'users', name: 'Platform Users', icon: <Users size={20} /> },
    { id: 'stores', name: 'Active Stores', icon: <Store size={20} /> },
    { id: 'policies', name: 'Platform Policies', icon: <FileText size={20} /> },
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
        
        const responsePolicies = await fetch(`${API_BASE_URL}/policies`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const responseSocials = await fetch(`${API_BASE_URL}/social-media`, {
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
          if (responsePolicies.ok) {
            setPolicies(await responsePolicies.json());
          }
          if (responseSocials.ok) {
            setPlatformSocials(await responseSocials.json());
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

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/superadmin`;
      
      const response = await fetch(`${API_BASE_URL}/plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: planForm.name,
          price: Number(planForm.price),
          features: {
            maxProducts: Number(planForm.maxProducts),
            storeLimit: Number(planForm.storeLimit),
            storageLimit: Number(planForm.storageLimit),
            customDomain: planForm.customDomain,
            freeSsl: planForm.freeSsl,
            securityHeaders: planForm.securityHeaders,
            basicAnalytics: planForm.basicAnalytics,
            advanceAnalytics: planForm.advanceAnalytics,
            whatsappOrderButton: planForm.whatsappOrderButton,
            sevenDaysTrial: planForm.sevenDaysTrial,
            themes: planForm.themes,
            prioritySupport: planForm.prioritySupport
          }
        })
      });

      if (response.ok) {
        const savedPlan = await response.json();
        setPlans(prev => {
          const exists = prev.find(p => p.name === savedPlan.name);
          if (exists) return prev.map(p => p.name === savedPlan.name ? savedPlan : p);
          return [...prev, savedPlan];
        });
        setIsPlanFormOpen(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save plan');
      }
    } catch (err) {
      setError('Network error while saving plan');
    }
  };

  const editPlan = (plan) => {
    setPlanForm({
      name: plan.name,
      price: plan.price,
      maxProducts: plan.features.maxProducts,
      storeLimit: plan.features.storeLimit || 1,
      storageLimit: plan.features.storageLimit || 500,
      customDomain: plan.features.customDomain,
      freeSsl: plan.features.freeSsl || false,
      securityHeaders: plan.features.securityHeaders || false,
      basicAnalytics: plan.features.basicAnalytics || false,
      advanceAnalytics: plan.features.advanceAnalytics || false,
      whatsappOrderButton: plan.features.whatsappOrderButton || false,
      sevenDaysTrial: plan.features.sevenDaysTrial ?? true,
      themes: plan.features.themes,
      prioritySupport: plan.features.prioritySupport
    });
    setIsPlanFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditUser = (user) => {
    // Placeholder for future edit user modal
    alert(`Edit functionality for ${user.name} (${user.email}) coming soon!`);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/superadmin`;
      
      const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        setUsers(users.filter(u => u._id !== userId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete user');
      }
    } catch (err) {
      setError('Network error while deleting user');
    }
  };

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/superadmin`;
      
      const response = await fetch(`${API_BASE_URL}/policies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(policyForm)
      });

      if (response.ok) {
        const savedPolicy = await response.json();
        setPolicies(prev => {
          const exists = prev.find(p => p.type === savedPolicy.type);
          if (exists) return prev.map(p => p.type === savedPolicy.type ? savedPolicy : p);
          return [...prev, savedPolicy];
        });
        setIsPolicyFormOpen(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save policy');
      }
    } catch (err) {
      setError('Network error while saving policy');
    }
  };

  const editPolicy = (policy) => {
    setPolicyForm({ type: policy.type, title: policy.title, content: policy.content, version: policy.version, isActive: policy.isActive });
    setIsPolicyFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePolicy = async (policyId) => {
    if (!window.confirm("Are you sure you want to delete this platform policy?")) return;
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/superadmin`;
      const response = await fetch(`${API_BASE_URL}/policies/${policyId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setPolicies(policies.filter(p => p._id !== policyId));
    } catch (err) {
      setError('Network error while deleting policy');
    }
  };

  const handleAddSocial = async (e) => {
    e.preventDefault();
    if (!newSocialUrl) return;
    setSocialStatus('Adding...');
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/superadmin`;
      const res = await fetch(`${API_BASE_URL}/social-media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ platform: newSocialPlatform, url: newSocialUrl })
      });
      if (res.ok) {
        setNewSocialUrl('');
        setSocialStatus('');
        const newSocial = await res.json();
        setPlatformSocials([...platformSocials, newSocial]);
      } else {
        setSocialStatus('Failed to add link');
      }
    } catch (err) {
      setSocialStatus('Error occurred');
    }
  };

  const handleDeleteSocial = async (id) => {
    if (!window.confirm("Delete this social link?")) return;
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/superadmin`;
      const res = await fetch(`${API_BASE_URL}/social-media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setPlatformSocials(platformSocials.filter(s => s._id !== id));
    } catch (err) {
      setError('Network error while deleting social link');
    }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    setSettingsStatus('Uploading logo...');

    const uploadData = new FormData();
    uploadData.append('storeId', '000000000000000000000000'); // 24-char valid hex to prevent MongoDB CastError
    uploadData.append('images', file); // Use a generic folder or a dedicated one

    try {
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = envUrl;
      const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}` },
        body: uploadData
      });

      if (uploadRes.ok) {
        const data = await uploadRes.json();
        const newLogoUrl = data.urls[0];
        setPlatformSettings(prev => ({ ...prev, mainLogoUrl: newLogoUrl }));
        await handleSaveSettings({ mainLogoUrl: newLogoUrl });
      } else {
        setSettingsStatus('Logo upload failed.');
      }
    } catch (err) {
      setSettingsStatus('Error during logo upload.');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleGridImagesUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    setUploadingGrid(true);
    setSettingsStatus('Uploading grid images...');

    const uploadData = new FormData();
    uploadData.append('storeId', '000000000000000000000000'); // 24-char valid hex to prevent MongoDB CastError
    files.forEach(file => uploadData.append('images', file));

    try {
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = envUrl;
      const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}` }, body: uploadData });

      if (uploadRes.ok) {
        const data = await uploadRes.json();
        setPlatformSettings(prev => ({ ...prev, loginImageGrid: data.urls }));
        await handleSaveSettings({ loginImageGrid: data.urls });
      } else {
        setSettingsStatus('Grid image upload failed.');
      }
    } catch (err) {
      setSettingsStatus('Error during grid image upload.');
    } finally {
      setUploadingGrid(false);
    }
  };

  const handleSaveSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/superadmin`;
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newSettings)
      });
      if (response.ok) {
        setSettingsStatus('Settings saved successfully!');
      } else {
        setSettingsStatus('Failed to save settings.');
      }
    } catch (err) {
      setSettingsStatus('Network error while saving settings.');
    }
  };

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
          <span className="text-xl font-black tracking-wide text-white">GB <span className="text-blue-500">SYSADMIN</span></span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden p-1 text-slate-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }}
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

        {/* Statistics Cards */}
        {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Platform Users</h3>
            <p className="text-5xl font-extrabold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Active Stores</h3>
            <p className="text-5xl font-extrabold text-green-600">{stores.length}</p>
          </div>
        </div>
        )}

        {/* Subscription Plans Management */}
        {activeTab === 'plans' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Subscription Plans</h2>
            <button 
              onClick={() => {
                setPlanForm({ name: 'Starter', price: 0, maxProducts: 50, storeLimit: 1, storageLimit: 500, customDomain: false, freeSsl: false, securityHeaders: false, basicAnalytics: false, advanceAnalytics: false, whatsappOrderButton: false, sevenDaysTrial: true, themes: false, prioritySupport: false });
                setIsPlanFormOpen(!isPlanFormOpen);
              }} 
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              {isPlanFormOpen ? 'Cancel' : '+ Add / Edit Plan'}
            </button>
          </div>

          {isPlanFormOpen && (
            <form onSubmit={handleSavePlan} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Plan Name</label>
                  <select value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="Starter">Starter</option>
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Monthly Price (₹)</label>
                  <input type="number" value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Max Products Allowed</label>
                  <input type="number" value={planForm.maxProducts} onChange={e => setPlanForm({...planForm, maxProducts: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Max Stores Allowed</label>
                  <input type="number" value={planForm.storeLimit} onChange={e => setPlanForm({...planForm, storeLimit: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required min="1" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Storage Limit (in MB)</label>
                  <input type="number" value={planForm.storageLimit} onChange={e => setPlanForm({...planForm, storageLimit: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="500 = 500MB, 2000 = 2GB" min="1" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={planForm.customDomain} onChange={e => setPlanForm({...planForm, customDomain: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  Custom Domain
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={planForm.freeSsl} onChange={e => setPlanForm({...planForm, freeSsl: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  Free SSL/TLS HTTPS
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={planForm.securityHeaders} onChange={e => setPlanForm({...planForm, securityHeaders: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  Free Security Headers
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={planForm.basicAnalytics} onChange={e => setPlanForm({...planForm, basicAnalytics: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  Basic Analytics
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={planForm.advanceAnalytics} onChange={e => setPlanForm({...planForm, advanceAnalytics: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  Advance Analytics
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={planForm.whatsappOrderButton} onChange={e => setPlanForm({...planForm, whatsappOrderButton: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  WhatsApp Order Button
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={planForm.sevenDaysTrial} onChange={e => setPlanForm({...planForm, sevenDaysTrial: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  7-Days Trial
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={planForm.themes} onChange={e => setPlanForm({...planForm, themes: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  Premium Themes
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700">
                  <input type="checkbox" checked={planForm.prioritySupport} onChange={e => setPlanForm({...planForm, prioritySupport: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />
                  Priority Support
                </label>
              </div>
              <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                Save Plan Configuration
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                  <button onClick={() => editPlan(plan)} className="text-sm text-blue-600 font-bold hover:underline">Edit</button>
                </div>
                <p className="text-3xl font-extrabold text-slate-900 mb-4">₹{plan.price}<span className="text-sm font-medium text-slate-500">/mo</span></p>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-center gap-2">✓ Up to {plan.features.maxProducts} Products</li>
                  <li className="flex items-center gap-2">✓ Up to {plan.features.storeLimit || 1} Store(s)</li>
                  <li className="flex items-center gap-2">✓ {plan.features.storageLimit ? (plan.features.storageLimit >= 1000 ? `${plan.features.storageLimit / 1000}GB` : `${plan.features.storageLimit}MB`) : '500MB'} Storage</li>
                  <li className="flex items-center gap-2">{plan.features.customDomain ? '✓' : '✕'} Custom Domain</li>
                  <li className="flex items-center gap-2">{plan.features.freeSsl ? '✓' : '✕'} Free SSL/TLS HTTPS</li>
                  <li className="flex items-center gap-2">{plan.features.securityHeaders ? '✓' : '✕'} Free Security Headers</li>
                  <li className="flex items-center gap-2">{plan.features.basicAnalytics ? '✓' : '✕'} Basic Analytics</li>
                  <li className="flex items-center gap-2">{plan.features.advanceAnalytics ? '✓' : '✕'} Advance Analytics</li>
                  <li className="flex items-center gap-2">{plan.features.whatsappOrderButton ? '✓' : '✕'} WhatsApp Order Button</li>
                  <li className="flex items-center gap-2">{plan.features.sevenDaysTrial ? '✓' : '✕'} 7-Days Trial</li>
                  <li className="flex items-center gap-2">{plan.features.themes ? '✓' : '✕'} Premium Themes</li>
                  <li className="flex items-center gap-2">{plan.features.prioritySupport ? '✓' : '✕'} Priority Support</li>
                </ul>
              </div>
            ))}
            {plans.length === 0 && !isPlanFormOpen && (
              <div className="col-span-3 text-center py-8 text-slate-500">No plans configured yet. Click "Add / Edit Plan" to set them up.</div>
            )}
          </div>
        </div>
        )}

        {/* Users Table */}
        {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Registered Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 font-bold">User ID</th>
                  <th className="p-4 font-bold">Name</th>
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Joined Date</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-slate-500">{user.userId}</td>
                    <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                    <td className="p-4 text-slate-600">{user.email}</td>
                    <td className="p-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditUser(user)} className="text-blue-500 hover:text-blue-700 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg transition">Edit</button>
                        <button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg transition">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No users registered yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Stores Table */}
        {activeTab === 'stores' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-bold text-slate-800">Active Stores</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                  <th className="p-4 font-bold">Store ID</th>
                  <th className="p-4 font-bold">Store Name</th>
                  <th className="p-4 font-bold">URL</th>
                  <th className="p-4 font-bold">Owner ID</th>
                  <th className="p-4 font-bold">Status</th>
                  <th className="p-4 font-bold">Plan</th>
                </tr>
              </thead>
              <tbody>
                {stores.map(store => (
                  <tr key={store._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-slate-500">{store.storeId}</td>
                    <td className="p-4 font-semibold text-slate-800">{store.storeName}</td>
                    <td className="p-4">
                      <a href={`http://${store.subdomain}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">
                        {store.subdomain}
                      </a>
                    </td>
                    <td className="p-4 text-sm font-mono text-slate-500">{store.ownerId}</td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {store.status || 'active'}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="block font-semibold text-slate-800">
                        {plans.find(p => p._id === store.planId)?.name || 'Free'}
                      </span>
                      <span className={`text-xs font-medium capitalize ${store.subscriptionStatus === 'active' ? 'text-green-600' : store.subscriptionStatus === 'expired' ? 'text-red-500' : 'text-orange-500'}`}>
                        {store.subscriptionStatus || 'trial'}
                      </span>
                    </td>
                  </tr>
                ))}
                {stores.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No stores created yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* Platform Policies Management */}
        {activeTab === 'policies' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Platform Policies</h2>
            <button 
              onClick={() => {
                setPolicyForm({ type: 'privacy', title: '', content: '', version: '1.0', isActive: true });
                setIsPolicyFormOpen(!isPolicyFormOpen);
              }} 
              className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition"
            >
              {isPolicyFormOpen ? 'Cancel' : '+ Add / Edit Policy'}
            </button>
          </div>

          {isPolicyFormOpen && (
            <form onSubmit={handleSavePolicy} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 space-y-4 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Policy Type</label>
                  <select value={policyForm.type} onChange={e => setPolicyForm({...policyForm, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="privacy">Privacy Policy</option>
                    <option value="terms">Terms of Service</option>
                    <option value="refund">Refund Policy</option>
                    <option value="cookies">Cookies Policy</option>
                    <option value="acceptable_use">Acceptable Use</option>
                    <option value="disclaimer">Disclaimer</option>
                  </select>
                </div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-1">Title</label><input type="text" value={policyForm.title} onChange={e => setPolicyForm({...policyForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="e.g. Platform Privacy Policy" /></div>
                <div><label className="block text-sm font-semibold text-slate-700 mb-1">Version</label><input type="text" value={policyForm.version} onChange={e => setPolicyForm({...policyForm, version: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="e.g. 1.0" /></div>
              </div>
              <div><label className="block text-sm font-semibold text-slate-700 mb-1">Content</label><textarea value={policyForm.content} onChange={e => setPolicyForm({...policyForm, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-64 resize-none" required placeholder="Enter policy text or HTML..."></textarea></div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={policyForm.isActive} onChange={e => setPolicyForm({...policyForm, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />Active (Visible on Site)</label>
              </div>
              <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition mt-2 shadow-lg shadow-blue-200">Save Platform Policy</button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {policies.map(policy => (
              <div key={policy._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition bg-white flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div><span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">{policy.type.replace('_', ' ')}</span><h3 className="text-xl font-bold text-slate-800 mt-2">{policy.title}</h3></div>
                  <span className={`px-2 py-1 rounded-md text-xs font-bold ${policy.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{policy.isActive ? 'Active' : 'Draft'}</span>
                </div>
                <div className="text-sm text-slate-500 mb-6 line-clamp-4 flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">{policy.content}</div>
                <div className="flex justify-between items-center text-sm font-medium text-slate-500 border-t border-slate-100 pt-4">
                  <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-bold text-slate-500">v{policy.version}</span>
                  <div className="flex gap-2">
                    <button onClick={() => editPolicy(policy)} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition">Edit</button>
                    <button onClick={() => handleDeletePolicy(policy._id)} className="text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 font-bold transition">Delete</button>
                  </div>
                </div>
              </div>
            ))}
            {policies.length === 0 && !isPolicyFormOpen && <div className="col-span-2 text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-medium">No platform policies created yet.</div>}
          </div>
        </div>
        )}

        {/* Global Social Links */}
        {activeTab === 'socials' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Global Social Media Links</h2>
          <p className="text-sm text-slate-500 mb-6">Manage the social media links that appear on the public platform footer (e.g., the Login and Registration pages).</p>
          
          <form onSubmit={handleAddSocial} className="flex flex-col sm:flex-row gap-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <select 
              value={newSocialPlatform} 
              onChange={(e) => setNewSocialPlatform(e.target.value)}
              className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-700"
            >
              <option value="Facebook">Facebook</option>
              <option value="Instagram">Instagram</option>
              <option value="Twitter">Twitter</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="YouTube">YouTube</option>
              <option value="Other">Other Link</option>
            </select>
            <input 
              type="url" 
              required
              placeholder="https://..."
              value={newSocialUrl}
              onChange={(e) => setNewSocialUrl(e.target.value)}
              className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
              + Add Link
            </button>
          </form>
          {socialStatus && <p className="text-sm text-red-500 mb-4 font-medium">{socialStatus}</p>}

          <div className="space-y-3">
            {platformSocials.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-xl">No social links added yet</div>
            ) : platformSocials.map(link => (
              <div key={link._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:shadow-md transition bg-white group">
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="p-2 bg-slate-50 rounded-lg border border-slate-100"><LinkIcon size={20} className="text-blue-600" /></div>
                  <div className="truncate">
                    <p className="font-bold text-slate-800 text-sm">{link.platform}</p>
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-[200px] sm:max-w-xs">{link.url}</a>
                  </div>
                </div>
                <button onClick={() => handleDeleteSocial(link._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* Platform Settings */}
        {activeTab === 'settings' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Dashboard & Login Page Settings</h2>
          {settingsStatus && <p className="text-sm text-blue-600 mb-4 font-medium">{settingsStatus}</p>}

          <div className="space-y-8">
            {/* Main Logo */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Main Platform Logo</h3>
              <p className="text-sm text-slate-500 mb-4">This logo appears on the login page and tenant dashboards.</p>
              <div className="flex items-center gap-6">
                <div className="w-48 h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-2">
                  <img src={platformSettings.mainLogoUrl} alt="Main Logo Preview" className="max-w-full max-h-full object-contain" />
                </div>
                <label className={`cursor-pointer px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition ${uploadingLogo ? 'opacity-50' : ''}`}>
                  {uploadingLogo ? 'Uploading...' : 'Change Logo'}
                  <input type="file" accept="image/png, image/jpeg, image/svg+xml" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
              </div>
            </div>

            {/* Login Page Image Grid */}
            <div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Login Page Image Grid</h3>
              <p className="text-sm text-slate-500 mb-4">Upload exactly 9 images to populate the animated grid on the login page.</p>
              <div className="grid grid-cols-3 gap-4 mb-4 max-w-md">
                {(platformSettings.loginImageGrid.length > 0 ? platformSettings.loginImageGrid : Array(9).fill('')).slice(0, 9).map((img, idx) => (
                  <div key={idx} className="aspect-square bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center">
                    {img ? <img src={img} className="w-full h-full object-cover rounded-xl" /> : <span className="text-slate-400 text-xs">Image {idx + 1}</span>}
                  </div>
                ))}
              </div>
              <label className={`cursor-pointer px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition ${uploadingGrid ? 'opacity-50' : ''}`}>
                {uploadingGrid ? 'Uploading...' : 'Upload 9 Images'}
                <input type="file" accept="image/*" multiple className="hidden" onChange={handleGridImagesUpload} disabled={uploadingGrid} />
              </label>
            </div>
          </div>
        </div>
        )}
      </main>
      </div>
    </div>
  );
};

export default SuperAdminMainpanel;