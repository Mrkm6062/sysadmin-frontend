import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';

const ManageStore = ({ token, stores, onLogout }) => {
  const { storeId } = useParams(); // Gets the store ID from the URL

  // Find the current store to initialize the form state
  const currentStore = stores.find(s => s.storeId === storeId) || {};

  // Form states
  const [storeName, setStoreName] = useState(currentStore.storeName || '');
  const [websiteTitle, setWebsiteTitle] = useState(currentStore.websiteTitle || '');
  const [logo, setLogo] = useState(currentStore.logo || '');
  const [favicon, setFavicon] = useState(currentStore.favicon || '');
  const [status, setStatus] = useState('');
  const [storeStatus, setStoreStatus] = useState(currentStore.status || 'active');
  
  // Expiry Date Extension States
  const [isExtending, setIsExtending] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState(() => {
    if (currentStore.planExpiryDate) {
      return new Date(currentStore.planExpiryDate).toISOString().split('T')[0];
    }
    return '';
  });

  // Calculate remaining days for the plan
  const getRemainingDays = () => {
    if (!currentStore.planExpiryDate) return null;
    const expiry = new Date(currentStore.planExpiryDate);
    const diffTime = expiry - new Date();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  const remainingDays = getRemainingDays();

  const handleExtendExpiry = async () => {
    setStatus('Updating expiry date...');
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3011';
      
      const response = await fetch(`${API_BASE_URL}/api/superadmin/stores/${currentStore._id}/expiry`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        },
        body: JSON.stringify({ planExpiryDate: newExpiryDate })
      });

      if (response.ok) {
        setStatus('Expiry date updated successfully! Please reload to see changes.');
        setIsExtending(false);
      } else {
        const data = await response.json();
        setStatus(`Error: ${data.message || 'Failed to update expiry date'}`);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleToggleStatus = async () => {
    if (!window.confirm(`Are you sure you want to ${storeStatus === 'active' ? 'suspend' : 'activate'} this store?`)) return;
    
    const newStatus = storeStatus === 'active' ? 'suspended' : 'active';
    setStatus(`Updating store status...`);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3011';
      
      const response = await fetch(`${API_BASE_URL}/api/superadmin/stores/${currentStore._id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setStoreStatus(newStatus);
        setStatus(`Store successfully marked as ${newStatus}!`);
      } else {
        const data = await response.json();
        setStatus(`Error: ${data.message || 'Failed to update status'}`);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    setStatus('Updating...');

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3011';
      
      const response = await fetch(`${API_BASE_URL}/api/store/${storeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          storeName,
          websiteTitle,
          logo,
          favicon
        })
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Store updated successfully!');
        // Optional: Update your local App.jsx stores state here if passed down as a prop
      } else {
        setStatus(`Error: ${data.message || 'Failed to update store'}`);
      }
    } catch (err) {
      setStatus(`Error: ${err.message}`);
    }
  };

  return (
    <AdminLayout stores={stores} onLogout={onLogout} headerTitle="Manage Store">
    <div className="p-6 bg-white rounded-xl shadow-sm max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Store Settings</h2>
      
      <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center shadow-sm">
        <div>
          <p className="text-sm font-bold text-slate-800">Store Operating Status</p>
          <p className="text-xs text-slate-500 mt-1">
            Currently: <span className={`font-bold uppercase tracking-wider ${storeStatus === 'active' ? 'text-green-600' : 'text-red-600'}`}>{storeStatus}</span>
          </p>
        </div>
        <button
          type="button"
          onClick={handleToggleStatus}
          className={`px-4 py-2 font-bold rounded-lg transition text-sm ${
            storeStatus === 'active'
              ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
              : 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
          }`}
        >
          {storeStatus === 'active' ? 'Suspend Store' : 'Activate Store'}
        </button>
      </div>

      {currentStore.planExpiryDate && (
        <div className={`mb-6 p-4 rounded-xl border flex justify-between items-center ${remainingDays > 5 ? 'bg-blue-50 border-blue-200' : 'bg-red-50 border-red-200'}`}>
          <div>
            <p className={`text-sm font-bold ${remainingDays > 5 ? 'text-blue-800' : 'text-red-800'}`}>Subscription Status: <span className="uppercase">{currentStore.subscriptionStatus || 'Active'}</span></p>
            <p className={`text-xs mt-1 ${remainingDays > 5 ? 'text-blue-600' : 'text-red-600'}`}>Expires on: {new Date(currentStore.planExpiryDate).toLocaleDateString()}</p>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <span className={`text-xl font-black ${remainingDays > 5 ? 'text-blue-700' : 'text-red-600'}`}>
              {remainingDays > 0 ? `${remainingDays} Days Left` : 'Expired'}
            </span>
            <button type="button" onClick={() => setIsExtending(!isExtending)} className="text-xs font-bold px-3 py-1.5 rounded-lg bg-white border shadow-sm hover:bg-slate-50 transition text-slate-700">
              {isExtending ? 'Cancel' : 'Change Expiry'}
            </button>
          </div>
        </div>
      )}
      
      {isExtending && (
        <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row items-end gap-4 animate-fadeIn">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-slate-700 mb-1">New Expiry Date</label>
            <input 
              type="date" 
              value={newExpiryDate} 
              onChange={(e) => setNewExpiryDate(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <button type="button" onClick={handleExtendExpiry} className="w-full md:w-auto px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-sm">
            Update Date
          </button>
        </div>
      )}

      {status && (
        <div className={`p-4 mb-6 rounded-lg font-medium text-sm ${status.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {status}
        </div>
      )}

      <form onSubmit={handleUpdateStore} className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Store Name</label>
          <input 
            type="text" 
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#76b900] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Website Title (SEO)</label>
          <input 
            type="text" 
            value={websiteTitle}
            onChange={(e) => setWebsiteTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#76b900] outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Logo URL</label>
          <input 
            type="text" 
            value={logo}
            onChange={(e) => setLogo(e.target.value)}
            placeholder="https://example.com/logo.png"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#76b900] outline-none"
          />
          {logo && <img src={logo} alt="Logo Preview" className="mt-3 h-12 object-contain" />}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Favicon URL</label>
          <input 
            type="text" 
            value={favicon}
            onChange={(e) => setFavicon(e.target.value)}
            placeholder="https://example.com/favicon.ico"
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#76b900] outline-none"
          />
        </div>

        <button 
          type="submit" 
          className="px-6 py-3 bg-[#76b900] text-white font-bold rounded-lg hover:bg-[#659e00] transition w-full mt-4"
        >
          Save Settings
        </button>
      </form>
    </div>
    </AdminLayout>
  );
};

export default ManageStore;
