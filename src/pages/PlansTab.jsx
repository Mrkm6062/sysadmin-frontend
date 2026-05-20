import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const PlansTab = () => {
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [error, setError] = useState('');
  const { plans, setPlans } = useOutletContext();
  const [planForm, setPlanForm] = useState({
    name: 'Starter', price: 0, maxProducts: 50, storeLimit: 1, storageLimit: 500, customDomain: false, freeSsl: false, securityHeaders: false, basicAnalytics: false, advanceAnalytics: false, whatsappOrderButton: false, sevenDaysTrial: true, themes: false, prioritySupport: false
  });

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      
      const response = await fetch(`${envUrl}/api/superadmin/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: planForm.name, price: Number(planForm.price),
          features: {
            maxProducts: Number(planForm.maxProducts), storeLimit: Number(planForm.storeLimit), storageLimit: Number(planForm.storageLimit), customDomain: planForm.customDomain, freeSsl: planForm.freeSsl, securityHeaders: planForm.securityHeaders, basicAnalytics: planForm.basicAnalytics, advanceAnalytics: planForm.advanceAnalytics, whatsappOrderButton: planForm.whatsappOrderButton, sevenDaysTrial: planForm.sevenDaysTrial, themes: planForm.themes, prioritySupport: planForm.prioritySupport
          }
        })
      });

      if (response.ok) {
        const savedPlan = await response.json();
        setPlans(prev => {
          const exists = prev.find(p => p.name === savedPlan.name);
          if (exists) return prev.map(p => p.name === savedPlan.name ? savedPlan : p);
          return [...prev, savedPlan];
        });
        setIsPlanFormOpen(false);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save plan');
      }
    } catch (err) {
      setError('Network error while saving plan');
    }
  };

  const editPlan = (plan) => {
    setPlanForm({
      name: plan.name, price: plan.price, maxProducts: plan.features.maxProducts, storeLimit: plan.features.storeLimit || 1, storageLimit: plan.features.storageLimit || 500, customDomain: plan.features.customDomain, freeSsl: plan.features.freeSsl || false, securityHeaders: plan.features.securityHeaders || false, basicAnalytics: plan.features.basicAnalytics || false, advanceAnalytics: plan.features.advanceAnalytics || false, whatsappOrderButton: plan.features.whatsappOrderButton || false, sevenDaysTrial: plan.features.sevenDaysTrial ?? true, themes: plan.features.themes, prioritySupport: plan.features.prioritySupport
    });
    setIsPlanFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Subscription Plans</h2>
        <button onClick={() => { setPlanForm({ name: 'Starter', price: 0, maxProducts: 50, storeLimit: 1, storageLimit: 500, customDomain: false, freeSsl: false, securityHeaders: false, basicAnalytics: false, advanceAnalytics: false, whatsappOrderButton: false, sevenDaysTrial: true, themes: false, prioritySupport: false }); setIsPlanFormOpen(!isPlanFormOpen); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
          {isPlanFormOpen ? 'Cancel' : '+ Add / Edit Plan'}
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

      {isPlanFormOpen && (
        <form onSubmit={handleSavePlan} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Plan Name</label><select value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"><option value="Starter">Starter</option><option value="Basic">Basic</option><option value="Pro">Pro</option><option value="Premium">Premium</option></select></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Monthly Price (₹)</label><input type="number" value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Max Products Allowed</label><input type="number" value={planForm.maxProducts} onChange={e => setPlanForm({...planForm, maxProducts: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required /></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Max Stores Allowed</label><input type="number" value={planForm.storeLimit} onChange={e => setPlanForm({...planForm, storeLimit: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required min="1" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Storage Limit (in MB)</label><input type="number" value={planForm.storageLimit} onChange={e => setPlanForm({...planForm, storageLimit: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" required placeholder="500 = 500MB, 2000 = 2GB" min="1" /></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={planForm.customDomain} onChange={e => setPlanForm({...planForm, customDomain: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />Custom Domain</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={planForm.freeSsl} onChange={e => setPlanForm({...planForm, freeSsl: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />Free SSL/TLS HTTPS</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={planForm.securityHeaders} onChange={e => setPlanForm({...planForm, securityHeaders: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />Free Security Headers</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={planForm.basicAnalytics} onChange={e => setPlanForm({...planForm, basicAnalytics: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />Basic Analytics</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={planForm.advanceAnalytics} onChange={e => setPlanForm({...planForm, advanceAnalytics: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />Advance Analytics</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={planForm.whatsappOrderButton} onChange={e => setPlanForm({...planForm, whatsappOrderButton: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />WhatsApp Order Button</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={planForm.sevenDaysTrial} onChange={e => setPlanForm({...planForm, sevenDaysTrial: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />7-Days Trial</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={planForm.themes} onChange={e => setPlanForm({...planForm, themes: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />Premium Themes</label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={planForm.prioritySupport} onChange={e => setPlanForm({...planForm, prioritySupport: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />Priority Support</label>
          </div>
          <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">Save Plan Configuration</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map(plan => (
          <div key={plan._id} className="border border-slate-200 rounded-xl p-6 hover:shadow-md transition">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
              <button onClick={() => editPlan(plan)} className="text-sm text-blue-600 font-bold hover:underline">Edit</button>
            </div>
            <p className="text-3xl font-extrabold text-slate-900 mb-4">₹{plan.price}<span className="text-sm font-medium text-slate-500">/mo</span></p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">✓ Up to {plan.features.maxProducts} Products</li>
              <li className="flex items-center gap-2">✓ {plan.features.storageLimit ? (plan.features.storageLimit >= 1000 ? `${plan.features.storageLimit / 1000}GB` : `${plan.features.storageLimit}MB`) : '500MB'} Storage</li>
              <li className="flex items-center gap-2">{plan.features.customDomain ? '✓' : '✕'} Custom Domain</li>
              <li className="flex items-center gap-2">{plan.features.freeSsl ? '✓' : '✕'} Free SSL/TLS HTTPS</li>
              <li className="flex items-center gap-2">{plan.features.securityHeaders ? '✓' : '✕'} Free Security Headers</li>
              <li className="flex items-center gap-2">{plan.features.basicAnalytics ? '✓' : '✕'} Basic Analytics</li>
              <li className="flex items-center gap-2">{plan.features.advanceAnalytics ? '✓' : '✕'} Advance Analytics</li>
              <li className="flex items-center gap-2">{plan.features.whatsappOrderButton ? '✓' : '✕'} WhatsApp Order Button</li>
              <li className="flex items-center gap-2">{plan.features.sevenDaysTrial ? '✓' : '✕'} 7-Days Trial</li>
              <li className="flex items-center gap-2">{plan.features.themes ? '✓' : '✕'} Premium Themes</li>
              <li className="flex items-center gap-2">{plan.features.prioritySupport ? '✓' : '✕'} Priority Support</li>
            </ul>
          </div>
        ))}
        {plans.length === 0 && !isPlanFormOpen && (
          <div className="col-span-3 text-center py-8 text-slate-500">No plans configured yet. Click "Add / Edit Plan" to set them up.</div>
        )}
      </div>
    </div>
  );
};

export default PlansTab;