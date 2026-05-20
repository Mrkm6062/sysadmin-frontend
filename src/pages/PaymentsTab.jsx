import React, { useState, useEffect } from 'react';

const PaymentsTab = () => {
  const [paymentSettings, setPaymentSettings] = useState({ razorpayEnabled: false, razorpayKeyId: '', razorpayKeySecret: '' });
  const [paymentStatus, setPaymentStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const token = localStorage.getItem('superadmin_token');
        const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
        const response = await fetch(`${envUrl}/api/platform-payments/settings`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) {
          const data = await response.json();
          setPaymentSettings({ razorpayEnabled: data.razorpayEnabled || false, razorpayKeyId: data.razorpayKeyId || '', razorpayKeySecret: '' });
        }
      } catch (err) { setPaymentStatus('Failed to load payment settings'); } finally { setLoading(false); }
    };
    fetchPayments();
  }, []);

  const handleSavePaymentSettings = async (e) => {
    e.preventDefault();
    setPaymentStatus('Saving...');
    const payload = { razorpayEnabled: paymentSettings.razorpayEnabled, razorpayKeyId: paymentSettings.razorpayKeyId };
    if (paymentSettings.razorpayKeySecret) payload.razorpayKeySecret = paymentSettings.razorpayKeySecret;
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/platform-payments/settings`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (response.ok) {
        setPaymentStatus('Payment settings saved successfully!');
        setPaymentSettings(prev => ({ ...prev, razorpayKeySecret: '' }));
      } else { const data = await response.json(); setPaymentStatus(`Error: ${data.message || 'Failed to save settings'}`); }
    } catch (err) { setPaymentStatus(`Error: ${err.message}`); }
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Payments...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8 animate-fadeIn">
      <h2 className="text-2xl font-bold mb-2 text-slate-800">Payment Gateway Settings</h2>
      <p className="text-sm text-slate-500 mb-8">Configure Razorpay for platform-wide subscription payments.</p>
      {paymentStatus && <div className={`p-4 mb-6 rounded-xl font-medium text-sm border ${paymentStatus.includes('Error') ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>{paymentStatus}</div>}
      <form onSubmit={handleSavePaymentSettings} className="space-y-6 max-w-2xl">
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
          <label className="flex items-center justify-between cursor-pointer"><span className="font-bold text-slate-800">Enable Razorpay</span><div className="relative"><input type="checkbox" className="sr-only" checked={paymentSettings.razorpayEnabled} onChange={e => setPaymentSettings({...paymentSettings, razorpayEnabled: e.target.checked})} /><div className={`block w-14 h-8 rounded-full ${paymentSettings.razorpayEnabled ? 'bg-blue-600' : 'bg-slate-300'}`}></div><div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${paymentSettings.razorpayEnabled ? 'translate-x-6' : ''}`}></div></div></label>
        </div>
        {paymentSettings.razorpayEnabled && (
          <div className="space-y-6 animate-fadeIn">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Razorpay Key ID</label><input type="text" value={paymentSettings.razorpayKeyId} onChange={e => setPaymentSettings({...paymentSettings, razorpayKeyId: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="rzp_live_..." /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Razorpay Key Secret</label><input type="password" value={paymentSettings.razorpayKeySecret} onChange={e => setPaymentSettings({...paymentSettings, razorpayKeySecret: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Enter new secret to update" /><p className="text-xs text-slate-400 mt-1">Your secret key is encrypted. Leave blank to keep the current secret.</p></div>
          </div>
        )}
        <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-200">Save Payment Settings</button>
      </form>
    </div>
  );
};
export default PaymentsTab;