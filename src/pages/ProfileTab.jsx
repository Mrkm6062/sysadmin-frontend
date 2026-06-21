import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Phone, MapPin, CreditCard, ShieldCheck, Mail, Calendar, Briefcase, Key } from 'lucide-react';

const ProfileTab = () => {
  const { currentUser, setCurrentUser } = useOutletContext();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    Pofileimage: '',
    password: '',
    Address: {
      addressLine1: '',
      landmark: '',
      city: '',
      state: '',
      pincode: '',
      mobileNumber: '',
      alternateNumber: ''
    },
    BankDetails: {
      accountHolderName: '',
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      branch: ''
    },
    UPI: {
      upiId: '',
      upiHolderName: ''
    }
  });

  useEffect(() => {
    if (currentUser?.employeeDetails) {
      const details = currentUser.employeeDetails;
      setFormData({
        name: details.name || '',
        phone: details.phone || '',
        Pofileimage: details.Pofileimage || '',
        password: '', // Kept empty for security, only update if typed
        Address: {
          addressLine1: details.Address?.addressLine1 || '',
          landmark: details.Address?.landmark || '',
          city: details.Address?.city || '',
          state: details.Address?.state || '',
          pincode: details.Address?.pincode || '',
          mobileNumber: details.Address?.mobileNumber || '',
          alternateNumber: details.Address?.alternateNumber || ''
        },
        BankDetails: {
          accountHolderName: details.BankDetails?.accountHolderName || '',
          bankName: details.BankDetails?.bankName || '',
          accountNumber: details.BankDetails?.accountNumber || '',
          ifscCode: details.BankDetails?.ifscCode || '',
          branch: details.BankDetails?.branch || ''
        },
        UPI: {
          upiId: details.UPI?.upiId || '',
          upiHolderName: details.UPI?.upiHolderName || ''
        }
      });
    }
  }, [currentUser]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const API_BASE_URL = `${envUrl}/api/staff`;

      const payload = { ...formData };
      if (!payload.password) delete payload.password; // Do not update password if left blank

      const response = await fetch(`${API_BASE_URL}/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        // Update local context
        setCurrentUser(prev => ({
          ...prev,
          name: data.employee.name,
          employeeDetails: data.employee
        }));
      } else {
        setMessage({ text: data.message || 'Failed to update profile', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Network error: ' + error.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const employee = currentUser?.employeeDetails || {};

  return (
    <div className="space-y-8 animate-fadeIn">
      {message.text && (
        <div className={`p-4 rounded-xl font-bold text-sm border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Summary Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col items-center text-center h-fit">
          <div className="relative mb-4">
            {formData.Pofileimage ? (
              <img src={formData.Pofileimage} alt={formData.name} className="h-28 w-28 rounded-full object-cover border-4 border-blue-500 shadow-sm" />
            ) : (
              <div className="h-28 w-28 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-4xl border-4 border-blue-500 shadow-sm">
                {formData.name ? formData.name.charAt(0).toUpperCase() : 'E'}
              </div>
            )}
          </div>
          
          <h3 className="text-xl font-bold text-slate-800">{formData.name || 'Employee Name'}</h3>
          <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mt-2 uppercase tracking-wide">
            {employee.role || 'Staff'}
          </span>

          <div className="w-full border-t border-slate-100 my-6 pt-6 space-y-4 text-left">
            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <Briefcase size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Employee ID</p>
                <p className="font-semibold text-slate-800">{employee.EmployeeId || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <Mail size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Official Email</p>
                <p className="font-semibold text-slate-800 break-all">{employee.email || 'N/A'}</p>
              </div>
            </div>

            {employee.CompanyEmail && (
              <div className="flex items-center gap-3 text-slate-600 text-sm">
                <Mail size={16} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Company Email</p>
                  <p className="font-semibold text-slate-800 break-all">{employee.CompanyEmail}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <Calendar size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Date of Joining</p>
                <p className="font-semibold text-slate-800">
                  {employee.DOJ ? new Date(employee.DOJ).toLocaleDateString('en-IN', { dateStyle: 'medium' }) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-600 text-sm">
              <MapPin size={16} className="text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Location / Dept</p>
                <p className="font-semibold text-slate-800">
                  {employee.Location || 'N/A'} ({employee.Department || 'N/A'})
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Edit Forms */}
        <form onSubmit={handleSave} className="lg:col-span-2 space-y-6">
          {/* Personal Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User size={20} className="text-blue-500" /> Personal Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Full Name</label>
                <input type="text" value={formData.name} onChange={e => handleInputChange('name', e.target.value)} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Phone Number</label>
                <input type="text" value={formData.phone} onChange={e => handleInputChange('phone', e.target.value)} required className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Profile Image URL</label>
                <input type="text" value={formData.Pofileimage} onChange={e => handleInputChange('Pofileimage', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" placeholder="https://example.com/avatar.jpg" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Change Password</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"><Key size={16} /></span>
                  <input type="password" value={formData.password} onChange={e => handleInputChange('password', e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" placeholder="••••••••" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Leave blank to keep current password.</p>
              </div>
            </div>
          </div>

          {/* Address Details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin size={20} className="text-blue-500" /> Address Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Address Line 1</label>
                <input type="text" value={formData.Address.addressLine1} onChange={e => handleNestedInputChange('Address', 'addressLine1', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Landmark</label>
                <input type="text" value={formData.Address.landmark} onChange={e => handleNestedInputChange('Address', 'landmark', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">City</label>
                <input type="text" value={formData.Address.city} onChange={e => handleNestedInputChange('Address', 'city', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">State</label>
                <input type="text" value={formData.Address.state} onChange={e => handleNestedInputChange('Address', 'state', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Pincode</label>
                <input type="text" value={formData.Address.pincode} onChange={e => handleNestedInputChange('Address', 'pincode', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
            </div>
          </div>

          {/* Bank details */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
            <h4 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard size={20} className="text-blue-500" /> Bank & UPI Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Account Holder Name</label>
                <input type="text" value={formData.BankDetails.accountHolderName} onChange={e => handleNestedInputChange('BankDetails', 'accountHolderName', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Bank Name</label>
                <input type="text" value={formData.BankDetails.bankName} onChange={e => handleNestedInputChange('BankDetails', 'bankName', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Account Number</label>
                <input type="text" value={formData.BankDetails.accountNumber} onChange={e => handleNestedInputChange('BankDetails', 'accountNumber', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">IFSC Code</label>
                <input type="text" value={formData.BankDetails.ifscCode} onChange={e => handleNestedInputChange('BankDetails', 'ifscCode', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">Branch</label>
                <input type="text" value={formData.BankDetails.branch} onChange={e => handleNestedInputChange('BankDetails', 'branch', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">UPI ID</label>
                <input type="text" value={formData.UPI.upiId} onChange={e => handleNestedInputChange('UPI', 'upiId', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" placeholder="username@upi" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">UPI Holder Name</label>
                <input type="text" value={formData.UPI.upiHolderName} onChange={e => handleNestedInputChange('UPI', 'upiHolderName', e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm font-semibold text-slate-800 bg-white" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-blue-200 disabled:opacity-50 flex items-center gap-2">
              <ShieldCheck size={18} />
              {loading ? 'Saving Changes...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileTab;
