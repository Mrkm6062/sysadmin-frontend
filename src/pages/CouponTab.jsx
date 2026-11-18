import React, { useState, useEffect, useMemo } from 'react';
import {
  Ticket,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Percent,
  Search,
  Calendar,
  X,
  Tag
} from 'lucide-react';

const CouponTab = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'active' | 'inactive' | 'percentage' | 'fixed'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    maxDiscountAmount: '',
    minOrderAmount: '0',
    validFrom: new Date().toISOString().split('T')[0],
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    usageLimit: '',
    perUserLimit: '1',
    firstOrderOnly: false,
    isActive: true,
  });

  const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');

  // Fetch all coupons
  const fetchCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const response = await fetch(`${envUrl}/api/galicoupons`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setCoupons(data.coupons || []);
      } else {
        setError(data.message || 'Failed to load coupons');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Compute summary stats
  const stats = useMemo(() => {
    const total = coupons.length;
    const active = coupons.filter(c => c.isActive && new Date(c.expiresAt) > new Date()).length;
    const expired = coupons.filter(c => new Date(c.expiresAt) <= new Date()).length;
    const totalUses = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);
    return { total, active, expired, totalUses };
  }, [coupons]);

  // Filter and search
  const filteredCoupons = useMemo(() => {
    return coupons.filter(c => {
      const isExpired = new Date(c.expiresAt) <= new Date();

      if (filterType === 'active' && (!c.isActive || isExpired)) return false;
      if (filterType === 'inactive' && c.isActive && !isExpired) return false;
      if (filterType === 'percentage' && c.discountType !== 'PERCENTAGE') return false;
      if (filterType === 'fixed' && c.discountType !== 'FIXED') return false;

      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase();
      const code = (c.code || '').toLowerCase();
      const desc = (c.description || '').toLowerCase();
      return code.includes(term) || desc.includes(term);
    });
  }, [coupons, filterType, searchTerm]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingCoupon(null);
    setModalError('');
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      maxDiscountAmount: '',
      minOrderAmount: '0',
      validFrom: new Date().toISOString().split('T')[0],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      usageLimit: '',
      perUserLimit: '1',
      firstOrderOnly: false,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setModalError('');
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue !== undefined ? String(coupon.discountValue) : '',
      maxDiscountAmount: coupon.maxDiscountAmount ? String(coupon.maxDiscountAmount) : '',
      minOrderAmount: coupon.minOrderAmount ? String(coupon.minOrderAmount) : '0',
      validFrom: coupon.validFrom ? new Date(coupon.validFrom).toISOString().split('T')[0] : '',
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split('T')[0] : '',
      usageLimit: coupon.usageLimit !== null && coupon.usageLimit !== undefined ? String(coupon.usageLimit) : '',
      perUserLimit: coupon.perUserLimit ? String(coupon.perUserLimit) : '1',
      firstOrderOnly: Boolean(coupon.firstOrderOnly),
      isActive: Boolean(coupon.isActive),
    });
    setIsModalOpen(true);
  };

  // Submit Create or Edit
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    setModalError('');
    setFormSubmitting(true);

    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const isEdit = Boolean(editingCoupon);
      const url = isEdit ? `${envUrl}/api/galicoupons/${editingCoupon._id}` : `${envUrl}/api/galicoupons`;
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        code: formData.code.trim().toUpperCase(),
        description: formData.description.trim(),
        discountType: formData.discountType,
        discountValue: Number(formData.discountValue),
        maxDiscountAmount: formData.maxDiscountAmount ? Number(formData.maxDiscountAmount) : null,
        minOrderAmount: formData.minOrderAmount ? Number(formData.minOrderAmount) : 0,
        validFrom: formData.validFrom ? new Date(formData.validFrom).toISOString() : new Date().toISOString(),
        expiresAt: new Date(formData.expiresAt).toISOString(),
        usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
        perUserLimit: formData.perUserLimit ? Number(formData.perUserLimit) : 1,
        firstOrderOnly: formData.firstOrderOnly,
        isActive: formData.isActive,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`✅ Coupon "${payload.code}" ${isEdit ? 'updated' : 'created'} successfully!`);
        setIsModalOpen(false);
        fetchCoupons();
      } else {
        setModalError(data.message || 'Failed to save coupon.');
      }
    } catch (err) {
      setModalError(`Network error: ${err.message}`);
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle active/inactive
  const handleToggleStatus = async (coupon) => {
    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const res = await fetch(`${envUrl}/api/galicoupons/${coupon._id}/toggle`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: data.isActive } : c));
        setSuccessMsg(`✅ Coupon "${coupon.code}" is now ${data.isActive ? 'Active' : 'Inactive'}.`);
      } else {
        setError(data.message || 'Failed to toggle coupon status.');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon code "${coupon.code}"?`)) return;

    try {
      const token = localStorage.getItem('superadmin_token') || localStorage.getItem('token');
      const res = await fetch(`${envUrl}/api/galicoupons/${coupon._id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c._id !== coupon._id));
        setSuccessMsg(`✅ Coupon "${coupon.code}" deleted successfully.`);
      } else {
        setError(data.message || 'Failed to delete coupon.');
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800">Platform Coupons (GaliCoupons)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Create and manage promotional discount coupons applicable during store creation and subscription purchases.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-sm transition flex items-center gap-2 self-start lg:self-auto"
        >
          <Plus size={16} />
          <span>Create New Coupon</span>
        </button>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600"><X size={16} /></button>
        </div>
      )}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-sm font-semibold flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-emerald-600"><X size={16} /></button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Ticket size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Coupons</p>
            <p className="text-2xl font-black text-slate-800">{stats.total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active & Valid</p>
            <p className="text-2xl font-black text-emerald-700">{stats.active}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Expired</p>
            <p className="text-2xl font-black text-amber-700">{stats.expired}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Tag size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Redemptions</p>
            <p className="text-2xl font-black text-purple-700">{stats.totalUses}</p>
          </div>
        </div>

      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Controls Bar: Search & Filter Tabs */}
        <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/60">
          
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${filterType === 'all' ? 'bg-slate-900 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              All ({stats.total})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('active')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${filterType === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Active ({stats.active})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('percentage')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${filterType === 'percentage' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Percentage %
            </button>
            <button
              type="button"
              onClick={() => setFilterType('fixed')}
              className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${filterType === 'fixed' ? 'bg-purple-600 text-white shadow-xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Flat ₹ OFF
            </button>
          </div>

          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by code or description..."
              className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs bg-white focus:outline-none focus:border-blue-600"
            />
          </div>

        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">Coupon Code</th>
                <th className="p-4 font-bold">Discount Value</th>
                <th className="p-4 font-bold">Cart Criteria</th>
                <th className="p-4 font-bold">Usage Stats</th>
                <th className="p-4 font-bold">Validity</th>
                <th className="p-4 font-bold text-center">Status</th>
                <th className="p-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredCoupons.map(coupon => {
                const now = new Date();
                const isExpired = new Date(coupon.expiresAt) <= now;
                const isUpcoming = coupon.validFrom && new Date(coupon.validFrom) > now;
                const isMaxedOut = coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit;

                return (
                  <tr key={coupon._id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Code & Description */}
                    <td className="p-4">
                      <div>
                        <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 tracking-wider">
                          {coupon.code}
                        </span>
                        {coupon.description && (
                          <p className="text-xs text-slate-500 mt-1 max-w-xs truncate">{coupon.description}</p>
                        )}
                        {coupon.firstOrderOnly && (
                          <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                            First-Time Store Only
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Discount Value */}
                    <td className="p-4">
                      <div>
                        <span className="font-extrabold text-slate-800 text-sm">
                          {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} FLAT OFF`}
                        </span>
                        {coupon.discountType === 'PERCENTAGE' && coupon.maxDiscountAmount && (
                          <p className="text-[11px] text-slate-500 font-medium">Max cap: ₹{coupon.maxDiscountAmount}</p>
                        )}
                      </div>
                    </td>

                    {/* Criteria */}
                    <td className="p-4 text-xs">
                      <div>
                        <p className="font-bold text-slate-700">
                          {coupon.minOrderAmount > 0 ? `Min Cart: ₹${coupon.minOrderAmount}` : 'No Minimum'}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Per User: {coupon.perUserLimit || 1}x max
                        </p>
                      </div>
                    </td>

                    {/* Usage Stats */}
                    <td className="p-4 text-xs">
                      <div>
                        <span className="font-bold text-slate-800">
                          {coupon.usedCount || 0} / {coupon.usageLimit !== null ? coupon.usageLimit : '∞'}
                        </span>
                        <div className="w-24 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1">
                          <div 
                            className={`h-full ${isMaxedOut ? 'bg-red-500' : 'bg-emerald-500'}`} 
                            style={{ 
                              width: coupon.usageLimit ? `${Math.min(100, Math.round(((coupon.usedCount || 0) / coupon.usageLimit) * 100))}%` : '100%' 
                            }} 
                          />
                        </div>
                      </div>
                    </td>

                    {/* Validity Dates */}
                    <td className="p-4 text-xs">
                      <div className="space-y-0.5">
                        <p className="text-slate-600 font-medium">
                          Till {new Date(coupon.expiresAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <div>
                          {isExpired ? (
                            <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Expired</span>
                          ) : isUpcoming ? (
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Upcoming</span>
                          ) : isMaxedOut ? (
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">Exhausted</span>
                          ) : (
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Valid</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Active Status Switch */}
                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStatus(coupon)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition shadow-2xs ${coupon.isActive ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                        title="Click to toggle active state"
                      >
                        <span className={`w-2 h-2 rounded-full ${coupon.isActive ? 'bg-emerald-600' : 'bg-slate-400'}`} />
                        <span>{coupon.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-right">
                      <div className="flex justify-end items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(coupon)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit Coupon"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(coupon)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete Coupon"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredCoupons.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-slate-400">
                    <Ticket size={40} className="mx-auto mb-3 opacity-40" />
                    <p className="font-bold text-base text-slate-600">No coupons found</p>
                    <p className="text-xs text-slate-400 mt-1">
                      {searchTerm ? 'Try adjusting your search criteria' : 'Click "+ Create New Coupon" to add your first platform coupon.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* CREATE / EDIT COUPON MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <Ticket size={20} />
                </span>
                <h3 className="text-lg font-bold text-slate-800">
                  {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : 'Create Platform Coupon'}
                </h3>
              </div>
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-red-500 transition-colors text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitForm} className="p-6 overflow-y-auto space-y-4">
              
              {modalError && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-bold border border-red-200">
                  {modalError}
                </div>
              )}

              {/* Code & Discount Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Coupon Code <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, '') })}
                    placeholder="e.g. LAUNCH50"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl font-mono font-bold text-sm uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Auto-converted to uppercase (A-Z, 0-9, -)</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Discount Type <span className="text-red-500">*</span></label>
                  <select
                    value={formData.discountType}
                    onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="PERCENTAGE">Percentage (%) Discount</option>
                    <option value="FIXED">Flat (₹) Fixed Discount</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. 50% discount on initial store launch subscription"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Discount Value & Max Discount */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Discount Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '(₹)'} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={formData.discountType === 'PERCENTAGE' ? '100' : '100000'}
                    value={formData.discountValue}
                    onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                    placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 200'}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Max Discount Cap (₹) {formData.discountType === 'FIXED' && <span className="text-slate-400 font-normal">(N/A for flat)</span>}
                  </label>
                  <input
                    type="number"
                    min="0"
                    disabled={formData.discountType === 'FIXED'}
                    value={formData.maxDiscountAmount}
                    onChange={e => setFormData({ ...formData, maxDiscountAmount: e.target.value })}
                    placeholder="e.g. 500 (optional)"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm disabled:opacity-50 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Min Order Amount & Per User Limit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Minimum Cart Amount (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minOrderAmount}
                    onChange={e => setFormData({ ...formData, minOrderAmount: e.target.value })}
                    placeholder="0"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Per User Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.perUserLimit}
                    onChange={e => setFormData({ ...formData, perUserLimit: e.target.value })}
                    placeholder="1"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Valid From & Expires At */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Valid From</label>
                  <input
                    type="date"
                    value={formData.validFrom}
                    onChange={e => setFormData({ ...formData, validFrom: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expires At <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    required
                    value={formData.expiresAt}
                    onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              {/* Global Usage Limit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Global Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  value={formData.usageLimit}
                  onChange={e => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="Leave empty for unlimited redemptions"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              {/* Checkboxes: First Order Only & Active */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.firstOrderOnly}
                    onChange={e => setFormData({ ...formData, firstOrderOnly: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">Valid for First Store Creation Only</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="text-xs font-bold text-slate-700">Activate Immediately</span>
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 text-slate-600 font-bold text-xs rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {formSubmitting ? 'Saving...' : editingCoupon ? 'Update Coupon' : 'Create Coupon'}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default CouponTab;
