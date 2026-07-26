import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

const PlansTab = () => {
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'features'
  const [isPlanFormOpen, setIsPlanFormOpen] = useState(false);
  const [isFeatureFormOpen, setIsFeatureFormOpen] = useState(false);
  const [featuresList, setFeaturesList] = useState([]);
  const [error, setError] = useState('');
  const { plans, setPlans } = useOutletContext();

  const initialPlanFormState = {
    _id: '',
    name: 'Starter',
    description: '',
    active: true,
    popular: false,
    limits: {
      maxProducts: 20,
      storageLimit: 500
    },
    billing: [
      { durationMonths: 1, price: 0, discountEnabled: false, discountValue: 0 },
      { durationMonths: 6, price: 0, discountEnabled: false, discountValue: 0 },
      { durationMonths: 12, price: 0, discountEnabled: false, discountValue: 0 }
    ],
    features: []
  };

  const initialFeatureFormState = {
    _id: '',
    name: '',
    slug: '',
    description: '',
    active: true
  };

  const [planForm, setPlanForm] = useState(initialPlanFormState);
  const [featureForm, setFeatureForm] = useState(initialFeatureFormState);

  // Fetch all features from superadmin features endpoint
  const fetchFeatures = async () => {
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const res = await fetch(`${envUrl}/api/superadmin/features`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setFeaturesList(await res.json());
      }
    } catch (err) {
      console.error('Failed to load platform features:', err);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleSavePlan = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      
      const payload = {
        _id: planForm._id || undefined,
        name: planForm.name,
        description: planForm.description,
        active: planForm.active,
        popular: planForm.popular,
        limits: {
          maxProducts: Number(planForm.limits.maxProducts),
          storageLimit: Number(planForm.limits.storageLimit)
        },
        billing: planForm.billing.map(b => ({
          durationMonths: Number(b.durationMonths),
          price: Number(b.price),
          discountEnabled: !!b.discountEnabled,
          discountType: 'percentage',
          discountValue: Number(b.discountValue)
        })),
        features: planForm.features.map(f => ({
          feature: f.feature,
          name: f.name
        }))
      };

      const response = await fetch(`${envUrl}/api/superadmin/plans`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const savedPlan = await response.json();
        setPlans(prev => {
          const exists = prev.find(p => p._id === savedPlan._id);
          if (exists) return prev.map(p => p._id === savedPlan._id ? savedPlan : p);
          return [...prev, savedPlan];
        });
        setIsPlanFormOpen(false);
        setPlanForm(initialPlanFormState);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save plan');
      }
    } catch (err) {
      setError('Network error while saving plan');
    }
  };

  const handleSaveFeature = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      
      const method = featureForm._id ? 'PUT' : 'POST';
      const urlPath = featureForm._id ? `/api/superadmin/features/${featureForm._id}` : '/api/superadmin/features';

      const response = await fetch(`${envUrl}${urlPath}`, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          name: featureForm.name,
          slug: featureForm.slug || undefined,
          description: featureForm.description,
          active: featureForm.active
        })
      });

      if (response.ok) {
        const savedFeature = await response.json();
        setFeaturesList(prev => {
          const exists = prev.find(f => f._id === savedFeature._id);
          if (exists) return prev.map(f => f._id === savedFeature._id ? savedFeature : f);
          return [...prev, savedFeature];
        });
        setIsFeatureFormOpen(false);
        setFeatureForm(initialFeatureFormState);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save feature');
      }
    } catch (err) {
      setError('Network error while saving feature');
    }
  };

  const editPlan = (plan) => {
    const getDurationObj = (months) => {
      const found = plan.billing?.find(b => b.durationMonths === months);
      return found ? {
        durationMonths: found.durationMonths,
        price: found.price,
        discountEnabled: found.discountEnabled || false,
        discountValue: found.discountValue || 0
      } : {
        durationMonths: months,
        price: 0,
        discountEnabled: false,
        discountValue: 0
      };
    };

    setPlanForm({
      _id: plan._id,
      name: plan.name,
      description: plan.description || '',
      active: plan.active !== undefined ? plan.active : true,
      popular: plan.popular || false,
      limits: {
        maxProducts: plan.limits?.maxProducts || 20,
        storageLimit: plan.limits?.storageLimit || 500
      },
      billing: [
        getDurationObj(1),
        getDurationObj(6),
        getDurationObj(12)
      ],
      features: plan.features?.map(f => ({
        feature: f.feature?._id || f.feature,
        name: f.name
      })) || []
    });
    setIsPlanFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const editFeature = (feature) => {
    setFeatureForm({
      _id: feature._id,
      name: feature.name,
      slug: feature.slug,
      description: feature.description || '',
      active: feature.active
    });
    setIsFeatureFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm("Are you sure you want to delete this subscription plan?")) return;
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      
      const response = await fetch(`${envUrl}/api/superadmin/plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setPlans(prev => prev.filter(p => p._id !== planId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete plan');
      }
    } catch (err) {
      setError('Network error while deleting plan');
    }
  };

  const handleDeleteFeature = async (featureId) => {
    if (!window.confirm("Are you sure you want to delete this feature? Plans referencing this feature will lose its association.")) return;
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      
      const response = await fetch(`${envUrl}/api/superadmin/features/${featureId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        setFeaturesList(prev => prev.filter(f => f._id !== featureId));
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete feature');
      }
    } catch (err) {
      setError('Network error while deleting feature');
    }
  };

  const handleFeatureToggle = (featureItem) => {
    setPlanForm(prev => {
      const exists = prev.features.some(f => f.feature === featureItem._id);
      let updatedFeatures;
      if (exists) {
        updatedFeatures = prev.features.filter(f => f.feature !== featureItem._id);
      } else {
        updatedFeatures = [...prev.features, { feature: featureItem._id, name: featureItem.name }];
      }
      return { ...prev, features: updatedFeatures };
    });
  };

  const handleBillingChange = (index, field, value) => {
    setPlanForm(prev => {
      const updatedBilling = prev.billing.map((b, idx) => {
        if (idx === index) {
          return { ...b, [field]: value };
        }
        return b;
      });
      return { ...prev, billing: updatedBilling };
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
      
      {/* Sub-tab Navigation */}
      <div className="flex border-b border-slate-200 mb-6">
        <button 
          onClick={() => { setActiveTab('plans'); setError(''); }} 
          className={`pb-3 px-6 font-bold text-sm border-b-2 transition-all duration-200 ${activeTab === 'plans' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Plans Management
        </button>
        <button 
          onClick={() => { setActiveTab('features'); setError(''); }} 
          className={`pb-3 px-6 font-bold text-sm border-b-2 transition-all duration-200 ${activeTab === 'features' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          Features Directory
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

      {/* PLAN TAB CONTENT */}
      {activeTab === 'plans' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Subscription Plans List</h2>
            <button onClick={() => { setPlanForm(initialPlanFormState); setIsPlanFormOpen(!isPlanFormOpen); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-xs">
              {isPlanFormOpen ? 'Cancel' : '+ Add / Edit Plan'}
            </button>
          </div>

          {isPlanFormOpen && (
            <form onSubmit={handleSavePlan} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-fadeIn">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Plan Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Plan Name</label>
                  <input 
                    type="text" 
                    value={planForm.name} 
                    onChange={e => setPlanForm({...planForm, name: e.target.value})} 
                    placeholder="Starter, Basic, Pro, etc." 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                  <input 
                    type="text" 
                    value={planForm.description} 
                    onChange={e => setPlanForm({...planForm, description: e.target.value})} 
                    placeholder="Summarize the plan tier values" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>

              <div className="flex gap-6 mb-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={planForm.active} 
                    onChange={e => setPlanForm({...planForm, active: e.target.checked})} 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                  />
                  Active Plan (Visible to Customers)
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={planForm.popular} 
                    onChange={e => setPlanForm({...planForm, popular: e.target.checked})} 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                  />
                  Mark as Popular / Recommended
                </label>
              </div>

          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-t pt-4">Usage Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Max Products Allowed</label>
              <input 
                type="number" 
                value={planForm.limits.maxProducts} 
                onChange={e => setPlanForm({...planForm, limits: { ...planForm.limits, maxProducts: e.target.value }})} 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                required 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Storage Limit (in MB)</label>
              <input 
                type="number" 
                value={planForm.limits.storageLimit} 
                onChange={e => setPlanForm({...planForm, limits: { ...planForm.limits, storageLimit: e.target.value }})} 
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                required 
                placeholder="500 = 500MB, 2000 = 2GB" 
                min="1" 
              />
            </div>
          </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-t pt-4">Pricing & Billing Cycles</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {planForm.billing.map((bill, index) => (
                  <div key={bill.durationMonths} className="bg-white p-4 rounded-lg border border-slate-200">
                    <h4 className="font-bold text-slate-700 text-sm mb-3">
                      {bill.durationMonths} Month{bill.durationMonths > 1 ? 's' : ''} Cycle
                    </h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">Price (₹)</label>
                        <input 
                          type="number" 
                          value={bill.price} 
                          onChange={e => handleBillingChange(index, 'price', e.target.value)} 
                          className="w-full px-3 py-1.5 border text-sm rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                          required 
                          min="0" 
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-600 mt-1">
                          <input 
                            type="checkbox" 
                            checked={bill.discountEnabled} 
                            onChange={e => handleBillingChange(index, 'discountEnabled', e.target.checked)} 
                            className="w-3.5 h-3.5 text-blue-600 rounded" 
                          />
                          Enable Discount
                        </label>
                      </div>
                      {bill.discountEnabled && (
                        <div>
                          <label className="block text-xs font-semibold text-slate-500 mb-1">Discount %</label>
                          <input 
                            type="number" 
                            value={bill.discountValue} 
                            onChange={e => handleBillingChange(index, 'discountValue', e.target.value)} 
                            className="w-full px-3 py-1.5 border text-sm rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
                            required 
                            min="0" 
                            max="100" 
                          />
                          {bill.discountValue > 0 && (
                            <div className="mt-1 text-xs font-bold text-green-600 bg-green-50 p-1.5 rounded border border-green-100">
                              After Discount: ₹{Math.round(bill.price - (bill.price * bill.discountValue / 100))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3 border-t pt-4">Select Included Features</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {featuresList.map(featureItem => {
                  const isChecked = planForm.features.some(f => f.feature === featureItem._id);
                  return (
                    <label key={featureItem._id} className="flex items-start gap-2 cursor-pointer text-sm font-medium text-slate-700 p-2 bg-white border border-slate-100 rounded-lg hover:border-blue-200 transition">
                      <input 
                        type="checkbox" 
                        checked={isChecked} 
                        onChange={() => handleFeatureToggle(featureItem)} 
                        className="w-4 h-4 text-blue-600 rounded mt-0.5" 
                      />
                      <div>
                        <span className="font-semibold block leading-tight text-slate-800">{featureItem.name}</span>
                        <span className="text-[10px] text-slate-400 font-normal leading-tight block mt-0.5">{featureItem.description}</span>
                      </div>
                    </label>
                  );
                })}
                {featuresList.length === 0 && (
                  <div className="col-span-4 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
                    No active features found. Switch to the Features tab to create them.
                  </div>
                )}
              </div>

              <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                Save Plan Configuration
              </button>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map(plan => (
              <div key={plan._id} className={`border rounded-xl p-6 hover:shadow-md transition relative ${plan.popular ? 'border-blue-500 shadow-sm' : 'border-slate-200'}`}>
                {plan.popular && (
                  <span className="absolute -top-3 left-6 bg-blue-600 text-white font-bold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Popular
                  </span>
                )}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800">{plan.name}</h3>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded mt-1 inline-block ${plan.active ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                      {plan.active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex gap-2.5">
                    <button onClick={() => editPlan(plan)} className="text-xs text-blue-600 font-bold hover:underline">Edit</button>
                    <button onClick={() => handleDeletePlan(plan._id)} className="text-xs text-red-600 font-bold hover:underline">Delete</button>
                  </div>
                </div>

                {plan.description && <p className="text-xs text-slate-400 mt-1 mb-4 italic">"{plan.description}"</p>}

                <div className="border-t border-slate-100 pt-4 mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pricing Rates</h4>
                  <div className="space-y-1.5">
                    {plan.billing?.map(b => {
                      const finalPrice = b.discountEnabled ? Math.round(b.price - (b.price * b.discountValue / 100)) : b.price;
                      return (
                        <div key={b.durationMonths} className="flex justify-between text-sm">
                          <span className="text-slate-600 font-medium">{b.durationMonths} Mo. Cycle:</span>
                          <span className="font-bold text-slate-800">
                            {b.discountEnabled ? (
                              <>
                                <span className="line-through text-slate-400 mr-1.5 font-normal">₹{b.price}</span>
                                <span className="text-green-600 font-extrabold">₹{finalPrice}</span>
                              </>
                            ) : `₹${b.price}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 mb-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Limits</h4>
                  <ul className="space-y-1 text-sm text-slate-600 font-medium">
                    <li>• Max Products: <span className="font-bold text-slate-800">{plan.limits?.maxProducts || 0}</span></li>
                    <li>• Storage Capacity: <span className="font-bold text-slate-800">
                      {plan.limits?.storageLimit ? (plan.limits.storageLimit >= 1000 ? `${plan.limits.storageLimit / 1000}GB` : `${plan.limits.storageLimit}MB`) : '500MB'}
                    </span></li>
                  </ul>
                </div>

                <div className="border-t border-slate-100 pt-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Included Features</h4>
                  <ul className="space-y-1.5 text-xs text-slate-600 font-medium">
                    {plan.features?.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-blue-500 font-bold">✓</span>
                        <span className="font-semibold text-slate-700">{f.name}</span>
                      </li>
                    ))}
                    {(!plan.features || plan.features.length === 0) && (
                      <li className="text-slate-400 italic">No special features bundled.</li>
                    )}
                  </ul>
                </div>
              </div>
            ))}
            {plans.length === 0 && !isPlanFormOpen && (
              <div className="col-span-3 text-center py-8 text-slate-500">No plans configured yet. Click "Add Plan" to set them up.</div>
            )}
          </div>
        </>
      )}

      {/* FEATURES TAB CONTENT */}
      {activeTab === 'features' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-slate-800">Platform Features Directory</h2>
            <button onClick={() => { setFeatureForm(initialFeatureFormState); setIsFeatureFormOpen(!isFeatureFormOpen); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-xs">
              {isFeatureFormOpen ? 'Cancel' : '+ Create Feature'}
            </button>
          </div>

          {isFeatureFormOpen && (
            <form onSubmit={handleSaveFeature} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-fadeIn">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">Feature Form</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Feature Name</label>
                  <input 
                    type="text" 
                    value={featureForm.name} 
                    onChange={e => setFeatureForm({...featureForm, name: e.target.value})} 
                    placeholder="e.g. Dynamic PWA, Custom Domain" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Slug (System ID - Optional)</label>
                  <input 
                    type="text" 
                    value={featureForm.slug} 
                    onChange={e => setFeatureForm({...featureForm, slug: e.target.value})} 
                    placeholder="e.g. pwa-module (auto-generated if empty)" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Short Description</label>
                  <input 
                    type="text" 
                    value={featureForm.description} 
                    onChange={e => setFeatureForm({...featureForm, description: e.target.value})} 
                    placeholder="Explain what value this feature unlocks" 
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                  <input 
                    type="checkbox" 
                    checked={featureForm.active} 
                    onChange={e => setFeatureForm({...featureForm, active: e.target.checked})} 
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" 
                  />
                  Active (Makes the feature selectable inside Plan Configurations)
                </label>
              </div>

              <button type="submit" className="w-full md:w-auto px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition">
                Save Feature
              </button>
            </form>
          )}

          {/* Features Table View */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 border-b font-bold text-xs uppercase">
                <tr>
                  <th className="px-6 py-3">Feature Name</th>
                  <th className="px-6 py-3">Slug</th>
                  <th className="px-6 py-3">Description</th>
                  <th className="px-6 py-3 text-center">Status</th>
                  <th className="px-6 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {featuresList.map(feature => (
                  <tr key={feature._id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-bold text-slate-800">{feature.name}</td>
                    <td className="px-6 py-4"><span className="bg-slate-100 text-slate-700 text-xs px-2 py-0.5 rounded font-mono font-semibold">{feature.slug}</span></td>
                    <td className="px-6 py-4 text-slate-500 text-xs">{feature.description || 'No description provided.'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold inline-block border ${feature.active ? 'bg-green-50 text-green-700 border-green-100' : 'bg-red-50 text-red-700 border-red-100'}`}>
                        {feature.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-3.5">
                        <button onClick={() => editFeature(feature)} className="text-blue-600 hover:underline font-semibold text-xs">Edit</button>
                        <button onClick={() => handleDeleteFeature(feature._id)} className="text-red-600 hover:underline font-semibold text-xs">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {featuresList.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-slate-400 italic">No features registered on GaliBrand platform yet. Click "+ Create Feature" to add your first one.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};

export default PlansTab;