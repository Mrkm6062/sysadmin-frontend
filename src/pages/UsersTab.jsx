import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users,
  Store,
  Send,
  AlertCircle,
  CheckCircle2,
  Clock,
  Search,
  RefreshCw,
  Mail,
  Trash2,
  ExternalLink
} from 'lucide-react';

const UsersTab = () => {
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'no-store' | 'has-store'
  const [sendingUserId, setSendingUserId] = useState(null);
  const [sendingBulk, setSendingBulk] = useState(false);
  const [checking24h, setChecking24h] = useState(false);
  
  const { users = [], setUsers, stores = [] } = useOutletContext();

  const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');

  // Calculate statistics
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const withStore = users.filter(u => u.hasStore || (u.stores && u.stores.length > 0) || (u.storeCount > 0)).length;
    const withoutStore = totalUsers - withStore;
    const remindersSent = users.filter(u => u.storeReminderSentAt || (u.storeReminderCount > 0)).length;
    return { totalUsers, withStore, withoutStore, remindersSent };
  }, [users]);

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const hasStore = Boolean(user.hasStore || (user.stores && user.stores.length > 0) || (user.storeCount > 0));
      
      if (filterType === 'no-store' && hasStore) return false;
      if (filterType === 'has-store' && !hasStore) return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const name = (user.name || '').toLowerCase();
      const email = (user.email || '').toLowerCase();
      const uid = (user.userId || '').toLowerCase();
      return name.includes(term) || email.includes(term) || uid.includes(term);
    });
  }, [users, filterType, searchTerm]);

  // 1. Send Create Store Reminder to a Single User
  const handleSendReminder = async (user) => {
    setError('');
    setSuccessMsg('');
    setSendingUserId(user._id);

    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const response = await fetch(`${envUrl}/api/superadmin/users/${user._id}/send-store-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(`✅ Reminder sent successfully to ${user.name} (${user.email})!`);
        // Update user locally
        setUsers(prev => prev.map(u => {
          if (u._id === user._id) {
            return {
              ...u,
              storeReminderSentAt: data.sentAt || new Date().toISOString(),
              storeReminderCount: (u.storeReminderCount || 0) + 1
            };
          }
          return u;
        }));
      } else {
        setError(`❌ ${data.message || 'Failed to send reminder email.'}`);
      }
    } catch (err) {
      setError(`❌ Network error while sending reminder: ${err.message}`);
    } finally {
      setSendingUserId(null);
    }
  };

  // 2. Send Bulk Reminder to All Users Without a Store
  const handleSendBulkReminders = async () => {
    if (!window.confirm(`Are you sure you want to send store creation reminder emails to all ${stats.withoutStore} user(s) who haven't created a store yet?`)) {
      return;
    }

    setError('');
    setSuccessMsg('');
    setSendingBulk(true);

    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const response = await fetch(`${envUrl}/api/superadmin/users/send-store-reminder-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(`✅ ${data.message || `Reminders processed: ${data.successCount} sent.`}`);
        // Refresh local users list
        setUsers(prev => prev.map(u => {
          const hasStore = Boolean(u.hasStore || (u.stores && u.stores.length > 0) || (u.storeCount > 0));
          if (!hasStore) {
            return {
              ...u,
              storeReminderSentAt: new Date().toISOString(),
              storeReminderCount: (u.storeReminderCount || 0) + 1
            };
          }
          return u;
        }));
      } else {
        setError(`❌ ${data.message || 'Failed to send bulk reminders.'}`);
      }
    } catch (err) {
      setError(`❌ Network error: ${err.message}`);
    } finally {
      setSendingBulk(false);
    }
  };

  // 3. Trigger 24-Hour No-Store Check On Demand
  const handleCheck24HourNoStore = async () => {
    setChecking24h(true);
    setError('');
    setSuccessMsg('');

    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const response = await fetch(`${envUrl}/api/superadmin/users/check-no-store-24h`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setSuccessMsg(`✅ 24h Monitor Check complete! Scanned: ${data.checked || 0} user(s), Alerted support for: ${data.alerted || 0} user(s).`);
      } else {
        setError(`❌ ${data.message || 'Check failed.'}`);
      }
    } catch (err) {
      setError(`❌ Network error: ${err.message}`);
    } finally {
      setChecking24h(false);
    }
  };

  // 4. Delete User
  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This cannot be undone.`)) return;
    
    setError('');
    setSuccessMsg('');
    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const response = await fetch(`${envUrl}/api/superadmin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const data = await response.json();
      if (response.ok) {
        setUsers(prev => prev.filter(u => u._id !== userId));
        setSuccessMsg(`✅ User "${userName}" deleted successfully.`);
      } else {
        setError(`❌ ${data.message || 'Failed to delete user'}`);
      }
    } catch (err) {
      setError('❌ Network error while deleting user.');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Platform Users & Store Onboarding</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage registered store owners, monitor onboarding status, and send custom store creation reminders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCheck24HourNoStore}
            disabled={checking24h}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
            title="Checks all users registered >= 24h ago with 0 stores and sends notification to support@galibrand.cloud"
          >
            <Clock size={15} className={checking24h ? "animate-spin text-orange-600" : "text-orange-600"} />
            <span>{checking24h ? "Checking 24h Users..." : "Run 24h Inactivity Check"}</span>
          </button>

          <button
            type="button"
            onClick={handleSendBulkReminders}
            disabled={sendingBulk || stats.withoutStore === 0}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-2 disabled:opacity-50"
          >
            <Send size={14} className={sendingBulk ? "animate-spin" : ""} />
            <span>{sendingBulk ? "Sending Bulk Reminders..." : `Send Reminders to All Pending (${stats.withoutStore})`}</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <AlertCircle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registered</p>
            <p className="text-2xl font-black text-slate-800">{stats.totalUsers}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Store size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stores Created</p>
            <p className="text-2xl font-black text-emerald-700">{stats.withStore}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">No Store Yet</p>
            <p className="text-2xl font-black text-amber-700">{stats.withoutStore}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Send size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Reminders Sent</p>
            <p className="text-2xl font-black text-purple-700">{stats.remindersSent}</p>
          </div>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Controls Bar: Search & Filter Tabs */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
          
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${filterType === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              All Users ({stats.totalUsers})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('no-store')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${filterType === 'no-store' ? 'bg-amber-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              No Store Yet ({stats.withoutStore})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('has-store')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${filterType === 'has-store' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Store Created ({stats.withStore})
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">User</th>
                <th className="p-4 font-bold">User ID & Auth</th>
                <th className="p-4 font-bold">Store Status</th>
                <th className="p-4 font-bold">Reminder Status</th>
                <th className="p-4 font-bold">Registered On</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredUsers.map(user => {
                const hasStore = Boolean(user.hasStore || (user.stores && user.stores.length > 0) || (user.storeCount > 0));
                const userStores = user.stores || [];
                const isSending = sendingUserId === user._id;

                const registeredDaysAgo = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24));
                const registeredHoursAgo = Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60));

                return (
                  <tr key={user._id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* User Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-200 to-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                          {user.name ? user.name.slice(0, 2).toUpperCase() : 'GB'}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-sm truncate">{user.name || 'Store Owner'}</p>
                          <a href={`mailto:${user.email}`} className="text-xs text-blue-600 hover:underline truncate block">
                            {user.email}
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* User ID & Provider */}
                    <td className="p-4">
                      <div className="space-y-1">
                        <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {user.userId}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase px-1.5 py-0.5 bg-slate-100 rounded">
                            {user.provider || 'email'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Store Status */}
                    <td className="p-4">
                      {hasStore ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 size={13} />
                            <span>Store Created ({userStores.length || user.storeCount || 1})</span>
                          </span>
                          {userStores.length > 0 && (
                            <div className="mt-1 space-y-0.5">
                              {userStores.map((s, idx) => (
                                <a
                                  key={idx}
                                  href={`https://${s.subdomain}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-slate-500 hover:text-emerald-700 flex items-center gap-1"
                                >
                                  <span>{s.storeName} ({s.storeId})</span>
                                  <ExternalLink size={10} />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                            <AlertCircle size={13} />
                            <span>No Store Created</span>
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1">
                            {registeredHoursAgo < 24 
                              ? `Signed up ${registeredHoursAgo}h ago`
                              : `Inactive for ${registeredDaysAgo} day(s)`}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Reminder Status */}
                    <td className="p-4">
                      {user.storeReminderSentAt ? (
                        <div>
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                            <Send size={11} />
                            <span>Sent ({user.storeReminderCount || 1}x)</span>
                          </span>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {new Date(user.storeReminderSentAt).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400">
                          {hasStore ? '—' : 'Not Sent'}
                        </span>
                      )}
                    </td>

                    {/* Joined Date */}
                    <td className="p-4 text-xs font-medium text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        
                        {/* Send Store Reminder Button for users without a store */}
                        {!hasStore && (
                          <button
                            type="button"
                            onClick={() => handleSendReminder(user)}
                            disabled={isSending}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-lg transition active:scale-95 disabled:opacity-50 shadow-2xs"
                            title="Send email reminder to user with custom template from dashboard settings"
                          >
                            <Send size={13} className={isSending ? "animate-spin text-blue-600" : ""} />
                            <span>{isSending ? "Sending..." : "Send Reminder"}</span>
                          </button>
                        )}

                        {/* Delete User Button */}
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user._id, user.name || user.email)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-12 text-center text-slate-400">
                    <Users size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="font-bold text-base text-slate-600">No users found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm ? 'Try adjusting your search criteria' : 'No users match this filter'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
};

export default UsersTab;
