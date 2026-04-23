import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const SuperAdminMainpanel = () => {
  const [users, setUsers] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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

        if (response.ok) {
          const data = await response.json();
          setUsers(data.users || []);
          setStores(data.stores || []);
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
                  </tr>
                ))}
                {stores.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No stores created yet.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SuperAdminMainpanel;