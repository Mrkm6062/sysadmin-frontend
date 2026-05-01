import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    themes: false,
    prioritySupport: false
  });
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

        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3011/api/superadmin';
        const response = await fetch(`${API_BASE_URL}/data`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const responsePlans = await fetch(`${API_BASE_URL}/plans`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
          setStores(data.stores || []);
          if (responsePlans.ok) {
            setPlans(await responsePlans.json());
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
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3011/api/superadmin';
      
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
      themes: plan.features.themes,
      prioritySupport: plan.features.prioritySupport
    });
    setIsPlanFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold text-xl text-slate-500 bg-slate-50">Loading Platform Data...</div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Top Navigation */}
      <nav className="bg-slate-900 text-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <span className="text-2xl font-black tracking-wide text-white">GB <span className="text-blue-500">SYSADMIN</span></span>
        </div>
        <button onClick={handleLogout} className="px-5 py-2 text-sm font-bold text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition duration-200">
          Logout
        </button>
      </nav>

      <main className="max-w-7xl mx-auto w-full px-6 py-10">
        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Platform Users</h3>
            <p className="text-5xl font-extrabold text-blue-600">{users.length}</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Active Stores</h3>
            <p className="text-5xl font-extrabold text-green-600">{stores.length}</p>
          </div>
        </div>

        {/* Subscription Plans Management */}
        <div className="mb-10 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">Subscription Plans</h2>
            <button 
              onClick={() => {
                setPlanForm({ name: 'Starter', price: 0, maxProducts: 50, storeLimit: 1, storageLimit: 500, customDomain: false, freeSsl: false, securityHeaders: false, basicAnalytics: false, advanceAnalytics: false, whatsappOrderButton: false, themes: false, prioritySupport: false });
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

        {/* Users Table */}
        <div className="mb-10 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-sm font-mono text-slate-500">{user.userId}</td>
                    <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                    <td className="p-4 text-slate-600">{user.email}</td>
                    <td className="p-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
                {users.length === 0 && <tr><td colSpan="4" className="p-8 text-center text-slate-500 font-medium">No users registered yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stores Table */}
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
      </main>
    </div>
  );
};

export default SuperAdminMainpanel;