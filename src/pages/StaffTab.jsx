import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, Ban, CheckCircle, Award, Globe, Save, IndianRupee, FileText } from 'lucide-react';

const StaffTab = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Performance & Payout Modal State
  const [selectedStaffForPerformance, setSelectedStaffForPerformance] = useState(null);
  const [performanceDetails, setPerformanceDetails] = useState(null);
  const [loadingPerformance, setLoadingPerformance] = useState(false);

  // Performance Settings form state
  const [monthlyTarget, setMonthlyTarget] = useState(10);
  const [performanceRating, setPerformanceRating] = useState(5.0);
  const [keyPerformanceSettings, setKeyPerformanceSettings] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState(10);

  // Payout Generation form state
  const [payoutType, setPayoutType] = useState('salary');
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMonth, setPayoutMonth] = useState('');
  const [payoutInvoiceId, setPayoutInvoiceId] = useState('');

  const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');

  const handleToggleSuspend = async (staff) => {
    if (!window.confirm(`Are you sure you want to ${staff.Suspended ? 'reactivate' : 'suspend'} ${staff.name}?`)) return;
    
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`${envUrl}/api/staff/${staff._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ Suspended: !staff.Suspended })
      });
      
      if (response.ok) {
        fetchStaff();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to update status');
      }
    } catch (err) {
      setError('Network error while updating status');
    }
  };

  const initialForm = {
    name: '', email: '', phone: '', role: 'Officestaff', password: '',
    DOB: '', DOJ: '', Designation: '', Department: '', Location: ''
  };
  const [formData, setFormData] = useState(initialForm);

  const roles = [
    'superadmin', 'Officestaff', 'Sales Associate', 'Sales Executive', 'Sales Manager', 
    'Marketing Associate', 'Marketing Executive', 'Marketing Manager', 'Finance Associate', 
    'Finance Executive', 'Finance Manager', 'HR Associate', 'HR Executive', 'HR Manager', 
    'Operations Associate', 'Operations Executive', 'Operations Manager', 'Customer Service Associate', 
    'Customer Service Executive', 'Customer Service Manager', 'IT Associate', 'IT Executive', 'IT Manager'
  ];

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`${envUrl}/api/staff`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setStaffList(await response.json());
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to load staff');
      }
    } catch (err) {
      setError('Network error while fetching staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('superadmin_token');
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${envUrl}/api/staff/${editingId}` : `${envUrl}/api/staff`;
      
      const payload = { ...formData };
      if (editingId && !payload.password) delete payload.password; // Don't send empty password on update

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        setIsFormOpen(false);
        setEditingId(null);
        setFormData(initialForm);
        fetchStaff();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save staff');
      }
    } catch (err) {
      setError('Network error while saving');
    }
  };

  const handleEdit = (staff) => {
    setFormData({
      name: staff.name || '',
      email: staff.email || '',
      phone: staff.phone || '',
      role: staff.role || 'Officestaff',
      password: '',
      DOB: staff.DOB ? new Date(staff.DOB).toISOString().split('T')[0] : '',
      DOJ: staff.DOJ ? new Date(staff.DOJ).toISOString().split('T')[0] : '',
      Designation: staff.Designation || '',
      Department: staff.Department || '',
      Location: staff.Location || ''
    });
    setEditingId(staff._id);
    setIsFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Performance Modal Actions
  const handleOpenPerformanceModal = async (staff) => {
    setSelectedStaffForPerformance(staff);
    setLoadingPerformance(true);
    
    // Preset automatic invoice ID & Default billing period
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setPayoutInvoiceId(`INV-${payoutType === 'salary' ? 'SAL' : 'COM'}-${randomNum}`);
    
    const dateObj = new Date();
    const monthYearStr = dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
    setPayoutMonth(monthYearStr);
    setPayoutAmount('');

    try {
      const token = localStorage.getItem('superadmin_token');
      const res = await fetch(`${envUrl}/api/staff-performance/${staff._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPerformanceDetails(data);
        
        // Load performance settings into form
        const settings = data.performanceSettings || {};
        setMonthlyTarget(settings.monthlyTarget || 10);
        setPerformanceRating(settings.performanceRating || 5.0);
        setKeyPerformanceSettings(settings.keyPerformanceSettings || '');
        setCommissionPercentage(settings.commissionPercentage || 10);
      } else {
        alert("Failed to load staff performance details.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error while loading staff performance.");
    } finally {
      setLoadingPerformance(false);
    }
  };

  // Update Invoice ID Prefix when type changes
  useEffect(() => {
    if (selectedStaffForPerformance) {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setPayoutInvoiceId(`INV-${payoutType === 'salary' ? 'SAL' : 'COM'}-${randomNum}`);
    }
  }, [payoutType, selectedStaffForPerformance]);

  const handleUpdatePerformanceSettings = async (e) => {
    e.preventDefault();
    if (!selectedStaffForPerformance) return;
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`${envUrl}/api/staff-performance/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          employeeId: selectedStaffForPerformance._id,
          monthlyTarget,
          performanceRating,
          keyPerformanceSettings,
          commissionPercentage
        })
      });
      if (response.ok) {
        alert("Performance goals and commission settings saved successfully!");
        handleOpenPerformanceModal(selectedStaffForPerformance);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update performance settings.");
      }
    } catch (err) {
      alert("Network error updating performance settings.");
    }
  };

  const handleGeneratePayout = async (e) => {
    e.preventDefault();
    if (!selectedStaffForPerformance || !payoutAmount || !payoutMonth || !payoutInvoiceId) {
      alert("Please fill in all payout details.");
      return;
    }
    try {
      const token = localStorage.getItem('superadmin_token');
      const response = await fetch(`${envUrl}/api/staff-performance/payout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          employeeId: selectedStaffForPerformance.EmployeeId,
          type: payoutType,
          amount: payoutAmount,
          month: payoutMonth,
          invoiceId: payoutInvoiceId
        })
      });
      if (response.ok) {
        alert("Payout invoice generated and stored successfully!");
        setPayoutAmount('');
        // Re-generate next invoice id
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        setPayoutInvoiceId(`INV-${payoutType === 'salary' ? 'SAL' : 'COM'}-${randomNum}`);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to generate payout.");
      }
    } catch (err) {
      alert("Network error generating payout invoice.");
    }
  };

  if (loading && staffList.length === 0) return <div className="p-8 text-center text-slate-500 font-bold">Loading Staff...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
          <p className="text-sm text-slate-500">Manage internal platform employees, set goals, commission rules, and payouts.</p>
        </div>
        <button onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData(initialForm); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          {isFormOpen ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Employee</>}
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-fadeIn space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label><input type="email" name="email" required disabled={editingId} value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-200 disabled:text-slate-500 bg-white" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Role *</label><select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">{editingId ? 'New Password (Optional)' : 'Password *'}</label><input type="password" name="password" required={!editingId} value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" placeholder={editingId ? 'Leave blank to keep current' : ''} /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Department</label><input type="text" name="Department" value={formData.Department} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Designation</label><input type="text" name="Designation" value={formData.Designation} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Location</label><input type="text" name="Location" value={formData.Location} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Date of Joining</label><input type="date" name="DOJ" value={formData.DOJ} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
          </div>
          <button type="submit" className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg">{editingId ? 'Update Employee' : 'Create Employee'}</button>
        </form>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4 font-bold">Emp ID</th>
              <th className="p-4 font-bold">Name & Email</th>
              <th className="p-4 font-bold">Role & Dept</th>
              <th className="p-4 font-bold">Location</th>
              <th className="p-4 font-bold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">No staff members found.</td></tr>
            ) : (
              staffList.map(staff => (
                <tr key={staff._id} className={`hover:bg-slate-50 transition ${staff.Suspended ? 'bg-red-50/30' : ''}`}>
                  <td className="p-4 font-mono text-sm text-slate-600 font-bold">{staff.EmployeeId}</td>
                  <td className="p-4">
                    <div>
                      <span className={`font-bold ${staff.Suspended ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{staff.name}</span>
                      {staff.Suspended && (
                        <span className="ml-2 text-[10px] uppercase font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">Suspended</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500">{staff.email}</div>
                  </td>
                  <td className="p-4">
                    <div className={`text-sm font-semibold inline-block px-2 py-0.5 rounded border mb-1 ${staff.Suspended ? 'text-slate-500 bg-slate-100 border-slate-200' : 'text-blue-700 bg-blue-50 border-blue-100'}`}>
                      {staff.role}
                    </div>
                    <div className="text-xs text-slate-500">{staff.Department || 'N/A'} {staff.Designation ? `• ${staff.Designation}` : ''}</div>
                  </td>
                  <td className="p-4 text-sm text-slate-600">{staff.Location || 'N/A'}</td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleOpenPerformanceModal(staff)} 
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-100 rounded-lg text-sm font-bold transition inline-flex items-center gap-1"
                    >
                      <Award size={14} /> KPI & Payout
                    </button>
                    <button onClick={() => handleEdit(staff)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition inline-flex items-center gap-1">
                      <Edit size={14} /> Edit
                    </button>
                    <button 
                      onClick={() => handleToggleSuspend(staff)} 
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold transition inline-flex items-center gap-1 ${staff.Suspended ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
                    >
                      {staff.Suspended ? <><CheckCircle size={14} /> Reactivate</> : <><Ban size={14} /> Suspend</>}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* KPI & Payout Modal */}
      {selectedStaffForPerformance && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-150 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Award className="text-blue-600" /> Goal, KPI & Payout: {selectedStaffForPerformance.name}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-1">ID: {selectedStaffForPerformance.EmployeeId} • Role: {selectedStaffForPerformance.role}</p>
              </div>
              <button 
                onClick={() => setSelectedStaffForPerformance(null)} 
                className="text-slate-400 hover:text-red-500 transition-colors text-3xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            {loadingPerformance ? (
              <div className="p-12 text-center text-slate-500 font-bold">Loading performance details...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-slate-200 overflow-y-auto p-6 gap-6">
                
                {/* Left Column: KPI Goal and Commission Configuration Settings */}
                <form onSubmit={handleUpdatePerformanceSettings} className="lg:col-span-5 space-y-5 pr-2">
                  <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                    KPI & Commission Settings
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Monthly Onboarding Goal *</label>
                    <input 
                      type="number" 
                      required 
                      value={monthlyTarget} 
                      onChange={(e) => setMonthlyTarget(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold" 
                      placeholder="e.g. 10 stores"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Performance Rating *</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="1" 
                      max="5" 
                      required 
                      value={performanceRating} 
                      onChange={(e) => setPerformanceRating(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold" 
                      placeholder="e.g. 4.8"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Commission Rate (%) *</label>
                    <input 
                      type="number" 
                      required 
                      value={commissionPercentage} 
                      onChange={(e) => setCommissionPercentage(e.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold" 
                      placeholder="e.g. 10%"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">Calculates 10% of plans chosen by client stores they onboarded.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Main Goals & KPI settings</label>
                    <textarea 
                      value={keyPerformanceSettings} 
                      onChange={(e) => setKeyPerformanceSettings(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm" 
                      placeholder="Describe employee responsibilities or key targets..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2"
                  >
                    <Save size={16} /> Save Performance Settings
                  </button>
                </form>

                {/* Right Column: Performance Stats and Payout Generation */}
                <div className="lg:col-span-7 space-y-6 lg:pl-6 pt-6 lg:pt-0">
                  {/* Onboarding Stats */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Onboarding & Commission Metrics</h4>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-white p-3 rounded-lg border border-slate-100">
                        <span className="block text-xs text-slate-400 font-bold uppercase">Onboarded</span>
                        <span className="text-xl font-black text-slate-800">{performanceDetails?.onboardedCount || 0} Stores</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100">
                        <span className="block text-xs text-slate-400 font-bold uppercase">Monthly Goal</span>
                        <span className="text-xl font-black text-slate-800">{performanceDetails?.performanceSettings?.monthlyTarget || 10} Stores</span>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-slate-100">
                        <span className="block text-xs text-slate-400 font-bold uppercase">Total Comm.</span>
                        <span className="text-xl font-black text-emerald-600">₹{(performanceDetails?.totalCommission || 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    {/* Stores breakdown list */}
                    {performanceDetails?.stores?.length > 0 && (
                      <div className="mt-4 border border-slate-200 rounded-lg overflow-hidden bg-white max-h-40 overflow-y-auto">
                        <table className="w-full text-xs text-left">
                          <thead className="bg-slate-100 font-bold uppercase text-slate-500 sticky top-0">
                            <tr>
                              <th className="p-2">Store Name</th>
                              <th className="p-2 text-center">Selected Plan</th>
                              <th className="p-2 text-right">Comm. Earned</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {performanceDetails.stores.map((s, i) => (
                              <tr key={i} className="hover:bg-slate-50">
                                <td className="p-2 font-bold text-slate-700">{s.storeName}</td>
                                <td className="p-2 text-center">
                                  {s.hasSelectedPlan ? (
                                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 font-bold rounded">
                                      {s.firstPaymentPlan} (₹{s.planPaidAmount})
                                    </span>
                                  ) : (
                                    <span className="text-slate-400 italic">No plan selected</span>
                                  )}
                                </td>
                                <td className="p-2 text-right font-extrabold text-blue-600">₹{s.commissionEarned}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Payout Generation Form */}
                  <form onSubmit={handleGeneratePayout} className="space-y-4">
                    <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                      Generate Salary / Commission Payout
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payout Type *</label>
                        <select 
                          value={payoutType} 
                          onChange={(e) => setPayoutType(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold"
                        >
                          <option value="salary">Salary Payment</option>
                          <option value="commission">Commission Payout</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Payout Amount (₹) *</label>
                        <input 
                          type="number" 
                          required 
                          value={payoutAmount} 
                          onChange={(e) => setPayoutAmount(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-bold" 
                          placeholder="e.g. 15000"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Billing Period / Month *</label>
                        <input 
                          type="text" 
                          required 
                          value={payoutMonth} 
                          onChange={(e) => setPayoutMonth(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-semibold" 
                          placeholder="e.g. June 2026"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Invoice ID *</label>
                        <input 
                          type="text" 
                          required 
                          value={payoutInvoiceId} 
                          onChange={(e) => setPayoutInvoiceId(e.target.value)}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-mono" 
                          placeholder="e.g. INV-SAL-1002"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit" 
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition shadow-md flex items-center justify-center gap-2"
                    >
                      <IndianRupee size={16} /> Generate & Pay Payout Invoice
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTab;