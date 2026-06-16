import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const SettingsTab = () => {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingMiniLogo, setUploadingMiniLogo] = useState(false);
  const [uploadingGridIndex, setUploadingGridIndex] = useState(null);
  const [settingsStatus, setSettingsStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [activeXhr, setActiveXhr] = useState(null);
  const { platformSettings, setPlatformSettings } = useOutletContext();
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
    setUploadProgress(0);
    setUploadSpeed('Calculating...');

    const uploadData = new FormData(); uploadData.append('storeId', '000000000000000000000000'); uploadData.append('images', file);
    
    const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
    const startTime = Date.now();
    let lastLoaded = 0;
    let lastTime = startTime;

    const xhr = new XMLHttpRequest();
    setActiveXhr(xhr);
    xhr.open('POST', `${envUrl}/api/upload`);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('superadmin_token')}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);

        const currentTime = Date.now();
        const timeDiff = (currentTime - lastTime) / 1000;
        
        if (timeDiff > 0.5) {
          const bytesDiff = event.loaded - lastLoaded;
          const speedBps = bytesDiff / timeDiff;
          let speedText = '';
          if (speedBps > 1024 * 1024) speedText = (speedBps / (1024 * 1024)).toFixed(2) + ' MB/s';
          else if (speedBps > 1024) speedText = (speedBps / 1024).toFixed(2) + ' KB/s';
          else speedText = Math.round(speedBps) + ' B/s';
          
          setUploadSpeed(speedText);
          lastLoaded = event.loaded;
          lastTime = currentTime;
        }
      }
    };

    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const data = JSON.parse(xhr.responseText);
        if (data.urls && data.urls.length > 0) {
          const url = data.urls[0];
          if (type === 'logo') { setPlatformSettings(prev => ({ ...prev, mainLogoUrl: url })); await handleSaveSettings({ mainLogoUrl: url }); }
          else if (type === 'mini') { setPlatformSettings(prev => ({ ...prev, miniLogoUrl: url })); await handleSaveSettings({ miniLogoUrl: url }); }
          else {
            const currentGrid = platformSettings.loginImageGrid || []; const newGrid = [...(currentGrid.length > 0 ? currentGrid : Array(9).fill(''))]; while (newGrid.length < 9) newGrid.push(''); newGrid[index] = url;
            setPlatformSettings(prev => ({ ...prev, loginImageGrid: newGrid })); await handleSaveSettings({ loginImageGrid: newGrid });
          }
        } else { setSettingsStatus('Upload failed.'); }
      } else {
        let data;
        try { data = JSON.parse(xhr.responseText); } catch (e) { data = { message: 'Upload Failed' }; }
        setSettingsStatus(`Upload Error: ${data.message || 'Failed to upload'}`);
      }
      if (type === 'logo') setUploadingLogo(false); else if (type === 'mini') setUploadingMiniLogo(false); else setUploadingGridIndex(null);
      setActiveXhr(null);
    };

    xhr.onerror = () => {
      setSettingsStatus('Upload Error: Network failure');
      if (type === 'logo') setUploadingLogo(false); else if (type === 'mini') setUploadingMiniLogo(false); else setUploadingGridIndex(null);
      setActiveXhr(null);
    };

    xhr.onabort = () => {
      setSettingsStatus('Upload canceled.');
      if (type === 'logo') setUploadingLogo(false); else if (type === 'mini') setUploadingMiniLogo(false); else setUploadingGridIndex(null);
      setActiveXhr(null);
    };

    xhr.send(uploadData);
  };

  const cancelUpload = () => {
    if (activeXhr) {
      activeXhr.abort();
    }
  };

  const getInvoicePreviewHtml = () => {
    let template = platformSettings.subscriptionInvoiceTemplate || '';
    
    const gstHtml = platformSettings.isGstEnabled && platformSettings.gstNumber 
      ? `<p style="margin: 2px 0; font-size: 12px; color: #666;">GSTIN: ${platformSettings.gstNumber}</p>` 
      : '';
      
    const cinHtml = platformSettings.isCinEnabled && platformSettings.cinNumber 
      ? `<p style="margin: 2px 0; font-size: 12px; color: #666;">CIN: ${platformSettings.cinNumber}</p>` 
      : '';

    return template
      .replace(/{{storeName}}/g, "Demo Super Store")
      .replace(/{{ownerName}}/g, "John Doe")
      .replace(/{{ownerEmail}}/g, "john@example.com")
      .replace(/{{invoiceId}}/g, "INV-1000123")
      .replace(/{{purchaseDate}}/g, new Date().toLocaleDateString())
      .replace(/{{planName}}/g, "Premium")
      .replace(/{{amount}}/g, "999")
      .replace(/{{mainLogoUrl}}/g, platformSettings.mainLogoUrl || 'https://placehold.co/200x50?text=Logo')
      .replace(/{{companyAddress}}/g, platformSettings.companyAddress || "123 Platform Street, City")
      .replace(/{{companyPhone}}/g, platformSettings.companyPhone || "+91 9876543210")
      .replace(/{{gstHtml}}/g, gstHtml)
      .replace(/{{cinHtml}}/g, cinHtml);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8"><h2 className="text-2xl font-bold mb-6 text-slate-800">Dashboard & Login Page Settings</h2>{settingsStatus && <p className="text-sm text-blue-600 mb-4 font-medium">{settingsStatus}</p>}
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Main Platform Logo</h3>
          <p className="text-sm text-slate-500 mb-4">This logo appears on the login page and tenant dashboards.</p>
          <div className="flex items-center gap-6">
            <div className="w-48 h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-2">
              <img src={platformSettings.mainLogoUrl} alt="Main Logo Preview" className="max-w-full max-h-full object-contain" />
            </div>
            <label className={`cursor-pointer px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition ${uploadingLogo ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadingLogo ? 'Uploading...' : 'Change Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleUpload(e.target.files[0], 'logo'); e.target.value = null; }} disabled={uploadingLogo} />
            </label>
          </div>
          {uploadingLogo && (
            <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fadeIn max-w-md">
              <div className="flex justify-between items-center text-sm font-bold text-blue-800 mb-2">
                <span>Uploading Logo... {uploadProgress}%</span>
                <div className="flex items-center gap-3">
                  <span>{uploadSpeed}</span>
                  <button type="button" onClick={cancelUpload} className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-xs font-bold transition-colors">Cancel</button>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden"><div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div></div>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Mini Logo (Collapsed Sidebar)</h3>
          <p className="text-sm text-slate-500 mb-4">This logo appears when the sidebar is collapsed (e.g., G & B icon).</p>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center p-2">
              {platformSettings.miniLogoUrl ? <img src={platformSettings.miniLogoUrl} alt="Mini Logo Preview" className="max-w-full max-h-full object-contain" /> : <span className="text-slate-400 font-bold text-2xl">GB</span>}
            </div>
            <label className={`cursor-pointer px-6 py-3 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition ${uploadingMiniLogo ? 'opacity-50 pointer-events-none' : ''}`}>
              {uploadingMiniLogo ? 'Uploading...' : 'Change Mini Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleUpload(e.target.files[0], 'mini'); e.target.value = null; }} disabled={uploadingMiniLogo} />
            </label>
          </div>
          {uploadingMiniLogo && (
            <div className="mt-4 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fadeIn max-w-md">
              <div className="flex justify-between items-center text-sm font-bold text-blue-800 mb-2">
                <span>Uploading Mini Logo... {uploadProgress}%</span>
                <div className="flex items-center gap-3">
                  <span>{uploadSpeed}</span>
                  <button type="button" onClick={cancelUpload} className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-xs font-bold transition-colors">Cancel</button>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden"><div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div></div>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">Login Page Image Grid</h3>
          <p className="text-sm text-slate-500 mb-4">Upload exactly 9 images to populate the animated grid on the login page.</p>
          
          {uploadingGridIndex !== null && (
            <div className="mb-4 bg-blue-50 p-4 rounded-xl border border-blue-100 animate-fadeIn max-w-md">
              <div className="flex justify-between items-center text-sm font-bold text-blue-800 mb-2">
                <span>Uploading Image {uploadingGridIndex + 1}... {uploadProgress}%</span>
                <div className="flex items-center gap-3">
                  <span>{uploadSpeed}</span>
                  <button type="button" onClick={cancelUpload} className="px-2 py-1 bg-red-100 text-red-600 hover:bg-red-200 rounded text-xs font-bold transition-colors">Cancel</button>
                </div>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2.5 overflow-hidden"><div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" style={{ width: `${uploadProgress}%` }}></div></div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4 mb-4 max-w-md">{((platformSettings.loginImageGrid || []).length > 0 ? platformSettings.loginImageGrid : Array(9).fill('')).slice(0, 9).map((img, idx) => (<div key={idx} className="relative aspect-square bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden group">{img ? <img src={img} className="absolute inset-0 w-full h-full object-cover" /> : <span className="text-slate-400 text-xs z-10">Image {idx + 1}</span>}<div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${img ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}><label className={`cursor-pointer px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-sm ${uploadingGridIndex === idx ? 'opacity-50 pointer-events-none' : ''}`}>{uploadingGridIndex === idx ? '...' : img ? 'Change' : 'Upload'}<input type="file" accept="image/*" className="hidden" onChange={(e) => { handleUpload(e.target.files[0], 'grid', idx); e.target.value = null; }} disabled={uploadingGridIndex !== null} /></label></div></div>))}</div>
        </div>

        {/* Company Details */}
        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Company Details</h3>
          <p className="text-sm text-slate-500 mb-6">These details will be used in invoices and platform contact information.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 max-w-3xl">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">Company Address</label>
              <textarea 
                value={platformSettings.companyAddress || ''} 
                onChange={(e) => setPlatformSettings({...platformSettings, companyAddress: e.target.value})} 
                rows="2" 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none text-sm" 
                placeholder="123 Platform Street, City, State..."
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Company Phone</label>
              <input 
                type="text" 
                value={platformSettings.companyPhone || ''} 
                onChange={(e) => setPlatformSettings({...platformSettings, companyPhone: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm" 
                placeholder="+91 9876543210"
              />
            </div>
            <div className="hidden md:block"></div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex justify-between">
                <span>GST Number</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={platformSettings.isGstEnabled || false} onChange={e => setPlatformSettings({...platformSettings, isGstEnabled: e.target.checked})} className="w-3.5 h-3.5 text-blue-600 rounded" />
                  <span className="text-xs font-normal">Enabled on Invoices</span>
                </label>
              </label>
              <input 
                type="text" 
                value={platformSettings.gstNumber || ''} 
                onChange={(e) => setPlatformSettings({...platformSettings, gstNumber: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm uppercase" 
                placeholder="22AAAAA0000A1Z5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex justify-between">
                <span>CIN Number</span>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={platformSettings.isCinEnabled || false} onChange={e => setPlatformSettings({...platformSettings, isCinEnabled: e.target.checked})} className="w-3.5 h-3.5 text-blue-600 rounded" />
                  <span className="text-xs font-normal">Enabled on Invoices</span>
                </label>
              </label>
              <input 
                type="text" 
                value={platformSettings.cinNumber || ''} 
                onChange={(e) => setPlatformSettings({...platformSettings, cinNumber: e.target.value})} 
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none text-sm uppercase" 
                placeholder="U12345MH2023PTC123456"
              />
            </div>
          </div>
          <button type="button" onClick={() => handleSaveSettings({ companyAddress: platformSettings.companyAddress, companyPhone: platformSettings.companyPhone, gstNumber: platformSettings.gstNumber, isGstEnabled: platformSettings.isGstEnabled, cinNumber: platformSettings.cinNumber, isCinEnabled: platformSettings.isCinEnabled })} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition shadow-sm text-sm">
            Save Company Details
          </button>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Subscription Invoice Template</h3>
          <p className="text-sm text-slate-500 mb-4">Edit the HTML template for invoices sent to store owners when they purchase a subscription plan.</p>
          <div className="mb-4">
            <textarea 
              value={platformSettings.subscriptionInvoiceTemplate || ''} 
              onChange={(e) => setPlatformSettings({...platformSettings, subscriptionInvoiceTemplate: e.target.value})} 
              rows="15" 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono text-xs resize-y bg-slate-50" 
              placeholder="<div..."
            />
            <p className="text-xs text-slate-500 mt-2 font-mono">Available Variables: {'{{storeName}}, {{ownerName}}, {{ownerEmail}}, {{invoiceId}}, {{purchaseDate}}, {{planName}}, {{amount}}, {{mainLogoUrl}}, {{companyAddress}}, {{companyPhone}}, {{gstHtml}}, {{cinHtml}}'}</p>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => setIsPreviewOpen(true)} className="px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition shadow-sm text-sm">
              Preview Invoice
            </button>
            <button type="button" onClick={() => handleSaveSettings({ subscriptionInvoiceTemplate: platformSettings.subscriptionInvoiceTemplate })} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition shadow-sm text-sm">
              Save Invoice Template
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Preview Modal */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Invoice HTML Preview</h3>
              <button onClick={() => setIsPreviewOpen(false)} className="text-slate-400 hover:text-red-500 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
              <div className="bg-white shadow-sm w-full max-w-3xl" dangerouslySetInnerHTML={{ __html: getInvoicePreviewHtml() }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default SettingsTab;