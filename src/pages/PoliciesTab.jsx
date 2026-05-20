import React, { useState, useEffect } from 'react';

const PoliciesTab = () => {
  const [policies, setPolicies] = useState([]);
  const [isPolicyFormOpen, setIsPolicyFormOpen] = useState(false);
  const [policyForm, setPolicyForm] = useState({ type: 'privacy', title: '', content: '', version: '1.0', isActive: true });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const token = localStorage.getItem('superadmin_token');
        const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
        const response = await fetch(`${envUrl}/api/superadmin/policies`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) setPolicies(await response.json());
      } catch (err) {
        setError('Failed to load policies');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const handleSavePolicy = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/superadmin/policies`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(policyForm) });
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
    } catch (err) { setError('Network error while saving policy'); }
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
      const response = await fetch(`${envUrl}/api/superadmin/policies/${policyId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setPolicies(policies.filter(p => p._id !== policyId));
    } catch (err) { setError('Network error while deleting policy'); }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Policies...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Platform Policies</h2>
        <button onClick={() => { setPolicyForm({ type: 'privacy', title: '', content: '', version: '1.0', isActive: true }); setIsPolicyFormOpen(!isPolicyFormOpen); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">{isPolicyFormOpen ? 'Cancel' : '+ Add / Edit Policy'}</button>
      </div>
      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}
      {isPolicyFormOpen && (
        <form onSubmit={handleSavePolicy} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Policy Type</label><select value={policyForm.type} onChange={e => setPolicyForm({...policyForm, type: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"><option value="privacy">Privacy Policy</option><option value="terms">Terms of Service</option><option value="refund">Refund Policy</option><option value="cookies">Cookies Policy</option><option value="acceptable_use">Acceptable Use</option><option value="disclaimer">Disclaimer</option></select></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Title</label><input type="text" value={policyForm.title} onChange={e => setPolicyForm({...policyForm, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="e.g. Platform Privacy Policy" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Version</label><input type="text" value={policyForm.version} onChange={e => setPolicyForm({...policyForm, version: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="e.g. 1.0" /></div>
          </div>
          <div><label className="block text-sm font-semibold text-slate-700 mb-1">Content</label><textarea value={policyForm.content} onChange={e => setPolicyForm({...policyForm, content: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none h-64 resize-none" required placeholder="Enter policy text or HTML..."></textarea></div>
          <div className="flex items-center gap-4"><label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={policyForm.isActive} onChange={e => setPolicyForm({...policyForm, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />Active (Visible on Site)</label></div>
          <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition mt-2 shadow-lg shadow-blue-200">Save Platform Policy</button>
        </form>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {policies.map(policy => (
          <div key={policy._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition bg-white flex flex-col"><div className="flex justify-between items-start mb-4"><div><span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-1 rounded-md">{policy.type.replace('_', ' ')}</span><h3 className="text-xl font-bold text-slate-800 mt-2">{policy.title}</h3></div><span className={`px-2 py-1 rounded-md text-xs font-bold ${policy.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{policy.isActive ? 'Active' : 'Draft'}</span></div><div className="text-sm text-slate-500 mb-6 line-clamp-4 flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100 whitespace-pre-wrap">{policy.content}</div><div className="flex justify-between items-center text-sm font-medium text-slate-500 border-t border-slate-100 pt-4"><span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-bold text-slate-500">v{policy.version}</span><div className="flex gap-2"><button onClick={() => editPolicy(policy)} className="text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-bold transition">Edit</button><button onClick={() => handleDeletePolicy(policy._id)} className="text-red-500 bg-red-50 px-3 py-1.5 rounded-lg hover:bg-red-100 font-bold transition">Delete</button></div></div></div>
        ))}
        {policies.length === 0 && !isPolicyFormOpen && <div className="col-span-2 text-center py-12 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-medium">No platform policies created yet.</div>}
      </div>
    </div>
  );
};
export default PoliciesTab;