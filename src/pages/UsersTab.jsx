import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const UsersTab = () => {
  const [error, setError] = useState('');
  const { users, setUsers } = useOutletContext();

  const handleEditUser = (user) => {
    alert(`Edit functionality for ${user.name} (${user.email}) coming soon!`);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;
    
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      
      const response = await fetch(`${envUrl}/api/superadmin/users/${userId}`, {
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200"><h2 className="text-xl font-bold text-slate-800">Registered Users</h2></div>
      {error && <div className="m-4 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200"><th className="p-4 font-bold">User ID</th><th className="p-4 font-bold">Name</th><th className="p-4 font-bold">Email</th><th className="p-4 font-bold">Joined Date</th><th className="p-4 font-bold text-right">Actions</th></tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-sm font-mono text-slate-500">{user.userId}</td><td className="p-4 font-semibold text-slate-800">{user.name}</td><td className="p-4 text-slate-600">{user.email}</td><td className="p-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2"><button onClick={() => handleEditUser(user)} className="text-blue-500 hover:text-blue-700 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg transition">Edit</button><button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg transition">Delete</button></div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="5" className="p-8 text-center text-slate-500 font-medium">No users registered yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default UsersTab;