import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Mail, Clock, AlertTriangle, Send, RefreshCw, Eye, CheckCircle2, ShieldAlert } from 'lucide-react';

const SettingsTab = () => {
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingMiniLogo, setUploadingMiniLogo] = useState(false);
  const [uploadingGridIndex, setUploadingGridIndex] = useState(null);
  const [settingsStatus, setSettingsStatus] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSpeed, setUploadSpeed] = useState('');
  const [activeXhr, setActiveXhr] = useState(null);
  const { platformSettings, setPlatformSettings } = useOutletContext();
  const [previewModal, setPreviewModal] = useState(null); // 'invoice' | 'reminder' | 'expired' | null
  const [sendingExpiredAlerts, setSendingExpiredAlerts] = useState(false);
  const [expiredAlertsStatus, setExpiredAlertsStatus] = useState('');
  const [runningDailyJob, setRunningDailyJob] = useState(false);
  const [dailyJobStatus, setDailyJobStatus] = useState('');
  const navigate = useNavigate();

  const handleSaveSettings = async (newSettings) => {
    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/superadmin/settings`, { 
        method: 'PUT', 
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, 
        body: JSON.stringify(newSettings) 
      });
      if (response.ok) {
        setSettingsStatus('Settings saved successfully!');
      } else {
        setSettingsStatus('Failed to save settings.');
      }
    } catch (err) { 
      setSettingsStatus('Network error while saving settings.'); 
    }
  };

  const handleSendExpiredAlerts = async () => {
    if (!window.confirm("Are you sure you want to send subscription expiration reminder emails to all stores whose plan has expired?")) {
      return;
    }
    setSendingExpiredAlerts(true);
    setExpiredAlertsStatus('Sending expired store alerts...');
    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/superadmin/subscription-alerts/send-expired`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setExpiredAlertsStatus(`✅ ${data.message || `Processed ${data.totalExpired} expired stores.`}`);
      } else {
        setExpiredAlertsStatus(`❌ Error: ${data.message || 'Failed to send alerts'}`);
      }
    } catch (err) {
      setExpiredAlertsStatus(`❌ Network Error: ${err.message}`);
    } finally {
      setSendingExpiredAlerts(false);
    }
  };

  const handleRunDailyCronJob = async () => {
    if (!window.confirm("Run daily 10:00 AM subscription check right now? (Checks upcoming 3-day/2-day/1-day expiries and expired stores)")) {
      return;
    }
    setRunningDailyJob(true);
    setDailyJobStatus('Running daily subscription check...');
    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/superadmin/subscription-alerts/run-cron-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setDailyJobStatus(`✅ ${data.message || 'Daily check completed successfully!'}`);
      } else {
        setDailyJobStatus(`❌ Error: ${data.message || 'Failed to run job'}`);
      }
    } catch (err) {
      setDailyJobStatus(`❌ Network Error: ${err.message}`);
    } finally {
      setRunningDailyJob(false);
    }
  };

  const handleUpload = async (file, type, index = null) => {
    if (!file) return;
    if (type === 'logo') setUploadingLogo(true); else if (type === 'mini') setUploadingMiniLogo(true); else setUploadingGridIndex(index);
    setSettingsStatus(`Uploading...`);
    setUploadProgress(0);
    setUploadSpeed('Calculating...');

    const uploadData = new FormData(); 
    uploadData.append('storeId', '000000000000000000000000'); 
    uploadData.append('images', file);
    
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
          if (type === 'logo') { 
            setPlatformSettings(prev => ({ ...prev, mainLogoUrl: url })); 
            await handleSaveSettings({ mainLogoUrl: url }); 
          } else if (type === 'mini') { 
            setPlatformSettings(prev => ({ ...prev, miniLogoUrl: url })); 
            await handleSaveSettings({ miniLogoUrl: url }); 
          } else {
            const currentGrid = platformSettings.loginImageGrid || []; 
            const newGrid = [...(currentGrid.length > 0 ? currentGrid : Array(9).fill(''))]; 
            while (newGrid.length < 9) newGrid.push(''); 
            newGrid[index] = url;
            setPlatformSettings(prev => ({ ...prev, loginImageGrid: newGrid })); 
            await handleSaveSettings({ loginImageGrid: newGrid });
          }
        } else { 
          setSettingsStatus('Upload failed.'); 
        }
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

  const getReminderPreviewHtml = () => {
    let template = platformSettings.subscriptionReminderTemplate || '';
    const expiryDateFormatted = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return template
      .replace(/{{storeName}}/g, "Demo Super Store")
      .replace(/{{ownerName}}/g, "John Doe")
      .replace(/{{ownerEmail}}/g, "john@example.com")
      .replace(/{{expiryDate}}/g, expiryDateFormatted)
      .replace(/{{daysLeft}}/g, "3 days")
      .replace(/{{renewUrl}}/g, "https://dashboard.galibrand.cloud/store/GBS001/plan")
      .replace(/{{mainLogoUrl}}/g, platformSettings.mainLogoUrl || 'https://placehold.co/200x50?text=Logo')
      .replace(/{{companyAddress}}/g, platformSettings.companyAddress || "123 Platform Street, City")
      .replace(/{{companyPhone}}/g, platformSettings.companyPhone || "+91 9876543210")
      .replace(/{{platformName}}/g, "Galibrand Cloud");
  };

  const getExpiredPreviewHtml = () => {
    let template = platformSettings.subscriptionExpiredTemplate || '';
    const expiryDateFormatted = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    return template
      .replace(/{{storeName}}/g, "Demo Super Store")
      .replace(/{{ownerName}}/g, "John Doe")
      .replace(/{{ownerEmail}}/g, "john@example.com")
      .replace(/{{expiryDate}}/g, expiryDateFormatted)
      .replace(/{{renewUrl}}/g, "https://dashboard.galibrand.cloud/store/GBS001/plan")
      .replace(/{{mainLogoUrl}}/g, platformSettings.mainLogoUrl || 'https://placehold.co/200x50?text=Logo')
      .replace(/{{companyAddress}}/g, platformSettings.companyAddress || "123 Platform Street, City")
      .replace(/{{companyPhone}}/g, platformSettings.companyPhone || "+91 9876543210")
      .replace(/{{platformName}}/g, "Galibrand Cloud");
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6 text-slate-800">Dashboard & Platform Settings</h2>
      {settingsStatus && <p className="text-sm text-blue-600 mb-4 font-medium">{settingsStatus}</p>}

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

          <div className="grid grid-cols-3 gap-4 mb-4 max-w-md">
            {((platformSettings.loginImageGrid || []).length > 0 ? platformSettings.loginImageGrid : Array(9).fill('')).slice(0, 9).map((img, idx) => (
              <div key={idx} className="relative aspect-square bg-slate-100 rounded-xl border border-slate-200 flex flex-col items-center justify-center overflow-hidden group">
                {img ? <img src={img} className="absolute inset-0 w-full h-full object-cover" /> : <span className="text-slate-400 text-xs z-10">Image {idx + 1}</span>}
                <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity ${img ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                  <label className={`cursor-pointer px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition shadow-sm ${uploadingGridIndex === idx ? 'opacity-50 pointer-events-none' : ''}`}>
                    {uploadingGridIndex === idx ? '...' : img ? 'Change' : 'Upload'}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => { handleUpload(e.target.files[0], 'grid', idx); e.target.value = null; }} disabled={uploadingGridIndex !== null} />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Landing Page Contact Form & Email Alerts Section */}
        <div className="pt-8 border-t border-slate-200">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-600 text-white rounded-xl shadow-xs">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Landing Page Contact & Email Alerts</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xl">
                  Configure SMTP server, multiple receiver emails, and view all contact form leads submitted by visitors on the GaliBrand landing page.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => navigate('/dashboard/landing-contacts')}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition whitespace-nowrap"
            >
              Manage Contact & Alerts →
            </button>
          </div>
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

        {/* 🔔 STORE SUBSCRIPTION CRON & EXPIRY REMINDER ACTION CONTROLS */}
        <div className="pt-8 border-t border-slate-200">
          <div className="bg-gradient-to-br from-amber-50/70 via-orange-50/40 to-white border-2 border-orange-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="p-2 bg-orange-600 text-white rounded-lg shadow-sm">
                    <Clock size={20} />
                  </span>
                  <h3 className="text-xl font-bold text-slate-800">Subscription Expiry Reminders & Cron Job</h3>
                </div>
                <p className="text-sm text-slate-600 max-w-2xl">
                  Automated background cron runs daily at <strong className="text-orange-700">10:00 AM</strong> to send upcoming renewal reminders (3 days, 2 days, 1 day) and notices to stores whose plans have expired.
                </p>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-orange-200 rounded-full font-medium text-orange-800">
                    <Clock size={13} className="text-orange-600" /> Daily Schedule: 10:00 AM Server Time
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-full font-medium text-slate-700">
                    <Mail size={13} className="text-blue-600" /> Automated Delivery: SMTP Transporter
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                <button
                  type="button"
                  onClick={handleSendExpiredAlerts}
                  disabled={sendingExpiredAlerts}
                  className="px-5 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sendingExpiredAlerts ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Sending Alerts...</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert size={16} />
                      <span>Send Expired Store Alerts Now</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleRunDailyCronJob}
                  disabled={runningDailyJob}
                  className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {runningDailyJob ? (
                    <>
                      <RefreshCw size={15} className="animate-spin" />
                      <span>Running Job...</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={15} />
                      <span>Run Daily 10 AM Job Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Status alerts */}
            {expiredAlertsStatus && (
              <div className="mt-4 p-3 bg-white border border-red-200 rounded-xl text-xs font-semibold text-slate-700 animate-fadeIn">
                {expiredAlertsStatus}
              </div>
            )}
            {dailyJobStatus && (
              <div className="mt-4 p-3 bg-white border border-blue-200 rounded-xl text-xs font-semibold text-slate-700 animate-fadeIn">
                {dailyJobStatus}
              </div>
            )}
          </div>
        </div>

        {/* 📧 SUBSCRIPTION INVOICE TEMPLATE */}
        <div className="pt-8 border-t border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-2">Subscription Invoice Template</h3>
          <p className="text-sm text-slate-500 mb-4">Edit the HTML template for tax invoices sent to store owners upon purchasing or renewing a subscription plan.</p>
          <div className="mb-4">
            <textarea 
              value={platformSettings.subscriptionInvoiceTemplate || ''} 
              onChange={(e) => setPlatformSettings({...platformSettings, subscriptionInvoiceTemplate: e.target.value})} 
              rows="12" 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none font-mono text-xs resize-y bg-slate-50" 
              placeholder="<div..."
            />
            <p className="text-xs text-slate-500 mt-2 font-mono">Available Variables: {'{{storeName}}, {{ownerName}}, {{ownerEmail}}, {{invoiceId}}, {{purchaseDate}}, {{planName}}, {{amount}}, {{mainLogoUrl}}, {{companyAddress}}, {{companyPhone}}, {{gstHtml}}, {{cinHtml}}'}</p>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => setPreviewModal('invoice')} className="px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-lg hover:bg-blue-100 transition shadow-sm text-sm flex items-center gap-2">
              <Eye size={16} /> Preview Invoice
            </button>
            <button type="button" onClick={() => handleSaveSettings({ subscriptionInvoiceTemplate: platformSettings.subscriptionInvoiceTemplate })} className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition shadow-sm text-sm">
              Save Invoice Template
            </button>
          </div>
        </div>

        {/* 📧 SUBSCRIPTION REMINDER TEMPLATE (EXPIRING SOON) */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-green-100 text-green-700 rounded-lg">
              <Clock size={18} />
            </span>
            <h3 className="text-xl font-bold text-slate-800">Subscription Reminder Email Template (Expiring Soon)</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Sent automatically at 10:00 AM when a store subscription is expiring in 3 days, 2 days, or 1 day.
          </p>
          <div className="mb-4">
            <textarea 
              value={platformSettings.subscriptionReminderTemplate || ''} 
              onChange={(e) => setPlatformSettings({...platformSettings, subscriptionReminderTemplate: e.target.value})} 
              rows="14" 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-green-600 outline-none font-mono text-xs resize-y bg-slate-50" 
              placeholder="<div..."
            />
            <p className="text-xs text-slate-500 mt-2 font-mono">
              Available Variables: {'{{storeName}}, {{ownerName}}, {{expiryDate}}, {{daysLeft}}, {{renewUrl}}, {{mainLogoUrl}}, {{companyAddress}}, {{companyPhone}}, {{platformName}}'}
            </p>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => setPreviewModal('reminder')} className="px-6 py-2.5 bg-green-50 text-green-700 font-bold rounded-lg hover:bg-green-100 transition shadow-sm text-sm flex items-center gap-2">
              <Eye size={16} /> Preview Reminder Email
            </button>
            <button type="button" onClick={() => handleSaveSettings({ subscriptionReminderTemplate: platformSettings.subscriptionReminderTemplate })} className="px-6 py-2.5 bg-[#15803d] text-white font-bold rounded-lg hover:bg-[#166534] transition shadow-sm text-sm">
              Save Reminder Template
            </button>
          </div>
        </div>

        {/* 📧 SUBSCRIPTION EXPIRED ALERT TEMPLATE */}
        <div className="pt-8 border-t border-slate-200">
          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 bg-red-100 text-red-700 rounded-lg">
              <AlertTriangle size={18} />
            </span>
            <h3 className="text-xl font-bold text-slate-800">Subscription Expired Alert Template</h3>
          </div>
          <p className="text-sm text-slate-500 mb-4">
            Sent automatically at 10:00 AM or manually via "Send Expired Store Alerts Now" when a store subscription plan has expired.
          </p>
          <div className="mb-4">
            <textarea 
              value={platformSettings.subscriptionExpiredTemplate || ''} 
              onChange={(e) => setPlatformSettings({...platformSettings, subscriptionExpiredTemplate: e.target.value})} 
              rows="14" 
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 outline-none font-mono text-xs resize-y bg-slate-50" 
              placeholder="<div..."
            />
            <p className="text-xs text-slate-500 mt-2 font-mono">
              Available Variables: {'{{storeName}}, {{ownerName}}, {{expiryDate}}, {{renewUrl}}, {{mainLogoUrl}}, {{companyAddress}}, {{companyPhone}}, {{platformName}}'}
            </p>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={() => setPreviewModal('expired')} className="px-6 py-2.5 bg-red-50 text-red-700 font-bold rounded-lg hover:bg-red-100 transition shadow-sm text-sm flex items-center gap-2">
              <Eye size={16} /> Preview Expired Alert Email
            </button>
            <button type="button" onClick={() => handleSaveSettings({ subscriptionExpiredTemplate: platformSettings.subscriptionExpiredTemplate })} className="px-6 py-2.5 bg-red-700 text-white font-bold rounded-lg hover:bg-red-800 transition shadow-sm text-sm">
              Save Expired Alert Template
            </button>
          </div>
        </div>

      </div>

      {/* HTML Preview Modal for Invoices, Reminders, and Expired Alerts */}
      {previewModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Eye size={18} className="text-blue-600" />
                {previewModal === 'invoice' && 'Subscription Tax Invoice HTML Preview'}
                {previewModal === 'reminder' && 'Expiring Soon Reminder HTML Preview'}
                {previewModal === 'expired' && 'Expired Subscription Alert HTML Preview'}
              </h3>
              <button onClick={() => setPreviewModal(null)} className="text-slate-400 hover:text-red-500 transition-colors text-2xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-100 flex justify-center">
              <div className="bg-white shadow-sm w-full max-w-3xl rounded-xl overflow-hidden" dangerouslySetInnerHTML={{ 
                __html: previewModal === 'invoice' 
                  ? getInvoicePreviewHtml() 
                  : (previewModal === 'reminder' ? getReminderPreviewHtml() : getExpiredPreviewHtml()) 
              }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
