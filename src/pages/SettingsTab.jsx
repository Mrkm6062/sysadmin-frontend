import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const SettingsTab = () => {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingMiniLogo, setUploadingMiniLogo] = useState(false);
  const [uploadingGridIndex, setUploadingGridIndex] = useState(null);
  const [settingsStatus, setSettingsStatus] = useState('');
  const { platformSettings, setPlatformSettings } = useOutletContext();

  const handleSaveSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/superadmin/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(newSettings) });
      if (response.ok) setSettingsStatus('Settings saved successfully!'); else setSettingsStatus('Failed to save settings.');
    } catch (err) { setSettingsStatus('Network error while saving settings.'); }
  };

  const handleUpload = async (file, type, index = null) => {
    if (!file) return;
    if (type === 'logo') setUploadingLogo(true); else if (type === 'mini') setUploadingMiniLogo(true); else setUploadingGridIndex(index);
    setSettingsStatus(`Uploading...`);
    const uploadData = new FormData(); uploadData.append('storeId', '000000000000000000000000'); uploadData.append('images', file);
    try {
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const res = await fetch(`${envUrl}/api/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}` }, body: uploadData });
      if (res.ok) {
        const data = await res.json();
        const url = data.urls[0];
        if (type === 'logo') { setPlatformSettings(prev => ({ ...prev, mainLogoUrl: url })); await handleSaveSettings({ mainLogoUrl: url }); }
        else if (type === 'mini') { setPlatformSettings(prev => ({ ...prev, miniLogoUrl: url })); await handleSaveSettings({ miniLogoUrl: url }); }
        else {
          const currentGrid = platformSettings.loginImageGrid || []; const newGrid = [...(currentGrid.length > 0 ? currentGrid : Array(9).fill(''))]; while (newGrid.length < 9) newGrid.push(''); newGrid[index] = url;
          setPlatformSettings(prev => ({ ...prev, loginImageGrid: newGrid })); await handleSaveSettings({ loginImageGrid: newGrid });
        }
      } else { setSettingsStatus('Upload failed.'); }
    } catch (err) { setSettingsStatus('Error during upload.'); } finally {
      if (type === 'logo') setUploadingLogo(false); else if (type === 'mini') setUploadingMiniLogo(false); else setUploadingGridIndex(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8"><h2 className="text-2xl font-bold mb-6 text-slate-800">Dashboard & Login Page Settings</h2>{settingsStatus && <p className="text-sm text-blue-600 mb-4 font-medium">{settingsStatus}</p>}
      <div className="space-y-8">
        <div><h3 className="text-lg font-bold text-slate-800 mb-2">Main Platform Logo</h3><p className="text-sm text-slate-500 mb-4">This logo appears on the login page and tenant dashboards.</p><div className="flex items-center gap-6"><div className="w-48 h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-2"><img src={platformSettings.mainLogoUrl} alt="Main Logo Preview" className="max-w-full max-h-full object-contain" /></div><label className={`cursor-pointer px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition ${uploadingLogo ? 'opacity-50' : ''}`}>{uploadingLogo ? 'Uploading...' : 'Change Logo'}<input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0], 'logo')} disabled={uploadingLogo} /></label></div></div>
        <div><h3 className="text-lg font-bold text-slate-800 mb-2">Mini Logo (Collapsed Sidebar)</h3><p className="text-sm text-slate-500 mb-4">This logo appears when the sidebar is collapsed (e.g., G & B icon).</p><div className="flex items-center gap-6"><div className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-2">{platformSettings.miniLogoUrl ? <img src={platformSettings.miniLogoUrl} alt="Mini Logo Preview" className="max-w-full max-h-full object-contain" /> : <span className="text-slate-400 font-bold text-2xl">GB</span>}</div><label className={`cursor-pointer px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition ${uploadingMiniLogo ? 'opacity-50' : ''}`}>{uploadingMiniLogo ? 'Uploading...' : 'Change Mini Logo'}<input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files[0], 'mini')} disabled={uploadingMiniLogo} /></label></div></div>
        <div><h3 className="text-lg font-bold text-slate-800 mb-2">Login Page Image Grid</h3><p className="text-sm text-slate-500 mb-4">Upload exactly 9 images to populate the animated grid on the login page.</p><div className="grid grid-cols-3 gap-4 mb-4 max-w-md">{((platformSettings.loginImageGrid || []).length > 0 ? platformSettings.loginImageGrid : Array(9).fill('')).slice(0, 9).map((img, idx) => (<div key={idx} className="relative aspect-square bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden group">{img ? <img src={img} className="absolute inset-0 w-full h-full object-cover" /> : <span className="text-slate-400 text-xs z-10">Image {idx + 1}</span>}<div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${img ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}><label className={`cursor-pointer px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-sm ${uploadingGridIndex === idx ? 'opacity-50 pointer-events-none' : ''}`}>{uploadingGridIndex === idx ? '...' : img ? 'Change' : 'Upload'}<input type="file" accept="image/*" className="hidden" onChange={(e) => { handleUpload(e.target.files[0], 'grid', idx); e.target.value = null; }} disabled={uploadingGridIndex !== null} /></label></div></div>))}</div></div>
      </div>
    </div>
  );
};
export default SettingsTab;