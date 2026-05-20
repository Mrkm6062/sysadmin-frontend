import React, { useState, useEffect } from 'react';
import { Link as LinkIcon, Trash2 } from 'lucide-react';

const SocialsTab = () => {
  const [platformSocials, setPlatformSocials] = useState([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState('Facebook');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [socialStatus, setSocialStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSocials = async () => {
      try {
        const token = localStorage.getItem('superadmin_token');
        const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
        const response = await fetch(`${envUrl}/api/superadmin/social-media`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) setPlatformSocials(await response.json());
      } catch (err) { setSocialStatus('Failed to load socials'); } finally { setLoading(false); }
    };
    fetchSocials();
  }, []);

  const handleAddSocial = async (e) => {
    e.preventDefault();
    if (!newSocialUrl) return;
    setSocialStatus('Adding...');
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const res = await fetch(`${envUrl}/api/superadmin/social-media`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ platform: newSocialPlatform, url: newSocialUrl }) });
      if (res.ok) { setNewSocialUrl(''); setSocialStatus(''); setPlatformSocials([...platformSocials, await res.json()]); } else { setSocialStatus('Failed to add link'); }
    } catch (err) { setSocialStatus('Error occurred'); }
  };

  const handleDeleteSocial = async (id) => {
    if (!window.confirm("Delete this social link?")) return;
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const res = await fetch(`${envUrl}/api/superadmin/social-media/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setPlatformSocials(platformSocials.filter(s => s._id !== id));
    } catch (err) { setSocialStatus('Network error while deleting social link'); }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Socials...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8"><h2 className="text-2xl font-bold mb-6 text-slate-800">Global Social Media Links</h2><p className="text-sm text-slate-500 mb-6">Manage the social media links that appear on the public platform footer (e.g., the Login and Registration pages).</p><form onSubmit={handleAddSocial} className="flex flex-col sm:flex-row gap-3 mb-8 bg-slate-50 p-4 rounded-xl border border-slate-200"><select value={newSocialPlatform} onChange={(e) => setNewSocialPlatform(e.target.value)} className="px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-slate-700"><option value="Facebook">Facebook</option><option value="Instagram">Instagram</option><option value="Twitter">Twitter</option><option value="LinkedIn">LinkedIn</option><option value="YouTube">YouTube</option><option value="Other">Other Link</option></select><input type="url" required placeholder="https://..." value={newSocialUrl} onChange={(e) => setNewSocialUrl(e.target.value)} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /><button type="submit" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition whitespace-nowrap">+ Add Link</button></form>{socialStatus && <p className="text-sm text-red-500 mb-4 font-medium">{socialStatus}</p>}
    <div className="space-y-3">{platformSocials.length === 0 ? <div className="text-center py-10 text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-xl">No social links added yet</div> : platformSocials.map(link => (<div key={link._id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl hover:shadow-md transition bg-white group"><div className="flex items-center gap-4 overflow-hidden"><div className="p-2 bg-slate-50 rounded-lg border border-slate-100"><LinkIcon size={20} className="text-blue-600" /></div><div className="truncate"><p className="font-bold text-slate-800 text-sm">{link.platform}</p><a href={link.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-[200px] sm:max-w-xs">{link.url}</a></div></div><button onClick={() => handleDeleteSocial(link._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition opacity-0 group-hover:opacity-100"><Trash2 size={18} /></button></div>))}</div></div>
  );
};
export default SocialsTab;