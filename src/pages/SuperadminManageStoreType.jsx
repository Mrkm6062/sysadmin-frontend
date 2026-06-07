import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, X } from 'lucide-react';

const SuperadminManageStoreType = () => {
  const [storeTypes, setStoreTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [features, setFeatures] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const token = localStorage.getItem('superadmin_token');

  const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStoreTypes = async () => {
    try {
      const res = await fetch(`${envUrl}/api/store-types`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStoreTypes(await res.json());
      }
    } catch (err) {
      showToast('Failed to fetch store types', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStoreTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const method = editingId ? 'PUT' : 'POST';
    const endpoint = editingId ? `/api/store-types/${editingId}` : `/api/store-types`;
    
    const payload = {
      name,
      features: features.split(',').map(f => f.trim()).filter(f => f),
      isActive
    };

    try {
      const res = await fetch(`${envUrl}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        showToast(editingId ? 'Store Type updated!' : 'Store Type created!');
        closeModal();
        fetchStoreTypes();
      } else {
        const data = await res.json();
        showToast(data.message || 'Error saving store type', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this Store Type?')) return;
    
    try {
      const res = await fetch(`${envUrl}/api/store-types/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        showToast('Store Type deleted!');
        fetchStoreTypes();
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    }
  };

  const openModal = (type = null) => {
    if (type) {
      setEditingId(type._id);
      setName(type.name);
      setFeatures(type.features.join(', '));
      setIsActive(type.isActive);
    } else {
      setEditingId(null);
      setName('');
      setFeatures('');
      setIsActive(true);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Store Types</h2>
            <p className="text-slate-500 text-sm mt-1">Manage categories of stores and their allowed features.</p>
          </div>
          <button onClick={() => openModal()} className="bg-[#76b900] text-white px-5 py-2.5 rounded-xl font-bold hover:bg-[#659e00] transition flex items-center gap-2 shadow-md">
            <Plus size={18} /> Add Store Type
          </button>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-500 font-bold animate-pulse">Loading...</div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 text-sm">
                <tr>
                  <th className="py-4 px-6 font-bold border-b border-slate-100">ID</th>
                  <th className="py-4 px-6 font-bold border-b border-slate-100">Name</th>
                  <th className="py-4 px-6 font-bold border-b border-slate-100">Features</th>
                  <th className="py-4 px-6 font-bold border-b border-slate-100">Status</th>
                  <th className="py-4 px-6 font-bold border-b border-slate-100 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {storeTypes.length === 0 ? (
                  <tr><td colSpan="5" className="py-8 text-center text-slate-500">No store types found.</td></tr>
                ) : storeTypes.map(type => (
                  <tr key={type._id} className="hover:bg-slate-50 transition border-b border-slate-100">
                    <td className="py-4 px-6 text-sm font-mono text-slate-500">{type.storetypeId}</td>
                    <td className="py-4 px-6 font-bold text-slate-800">{type.name}</td>
                    <td className="py-4 px-6 text-sm text-slate-600">
                      <div className="flex flex-wrap gap-1">
                        {type.features.map((f, i) => (
                          <span key={i} className="bg-slate-100 px-2 py-0.5 rounded text-xs border border-slate-200">{f}</span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-2.5 py-1 text-xs font-bold rounded-full ${type.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {type.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button onClick={() => openModal(type)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition mr-2"><Edit2 size={18} /></button>
                      <button onClick={() => handleDelete(type._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-lg text-slate-800">{editingId ? 'Edit Store Type' : 'Add Store Type'}</h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-red-500 transition"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Name <span className="text-red-500">*</span></label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Kirana Stores" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#76b900] outline-none transition" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Features (Comma separated)</label>
                <input type="text" value={features} onChange={e => setFeatures(e.target.value)} placeholder="e.g. POS, Online Delivery, Dine-in" className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-[#76b900] outline-none transition" />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <input type="checkbox" id="isActive" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="w-5 h-5 text-[#76b900] rounded focus:ring-[#76b900]" />
                <label htmlFor="isActive" className="font-semibold text-slate-700 cursor-pointer">Active</label>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3 mt-6">
                <button type="button" onClick={closeModal} className="px-5 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-[#76b900] text-white font-bold rounded-xl hover:bg-[#659e00] transition shadow-md disabled:opacity-50">{isSubmitting ? 'Saving...' : 'Save Store Type'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed top-10 left-1/2 transform -translate-x-1/2 z-[200] px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-3 transition-all animate-fadeIn ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#76b900]'} text-white`}>
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default SuperadminManageStoreType;