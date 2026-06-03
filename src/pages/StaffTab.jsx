import React, { useState, useEffect } from 'react';
import { Plus, Edit, X, Ban, CheckCircle } from 'lucide-react';

const StaffTab = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);

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

  const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');

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

  if (loading && staffList.length === 0) return <div className="p-8 text-center text-slate-500 font-bold">Loading Staff...</div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Staff Management</h2>
          <p className="text-sm text-slate-500">Manage internal platform employees and their roles.</p>
        </div>
        <button onClick={() => { setIsFormOpen(!isFormOpen); setEditingId(null); setFormData(initialForm); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2">
          {isFormOpen ? <><X size={18} /> Cancel</> : <><Plus size={18} /> Add Employee</>}
        </button>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 animate-fadeIn space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Full Name *</label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Email Address *</label><input type="email" name="email" required disabled={editingId} value={formData.email} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-slate-200 disabled:text-slate-500" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label><input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Role *</label><select name="role" value={formData.role} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white">{roles.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">{editingId ? 'New Password (Optional)' : 'Password *'}</label><input type="password" name="password" required={!editingId} value={formData.password} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder={editingId ? 'Leave blank to keep current' : ''} /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Department</label><input type="text" name="Department" value={formData.Department} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Designation</label><input type="text" name="Designation" value={formData.Designation} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Location</label><input type="text" name="Location" value={formData.Location} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div>
            <div><label className="block text-sm font-semibold text-slate-700 mb-1">Date of Joining</label><input type="date" name="DOJ" value={formData.DOJ} onChange={handleInputChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white" /></div>
          </div>
          <button type="submit" className="mt-4 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition shadow-lg">{editingId ? 'Update Employee' : 'Create Employee'}</button>
        </form>
      )}

      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200"><tr><th className="p-4 font-bold">Emp ID</th><th className="p-4 font-bold">Name & Email</th><th className="p-4 font-bold">Role & Dept</th><th className="p-4 font-bold">Location</th><th className="p-4 font-bold text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {staffList.length === 0 ? <tr><td colSpan="5" className="p-8 text-center text-slate-500">No staff members found.</td></tr> : staffList.map(staff => (<tr key={staff._id} className={`hover:bg-slate-50 transition ${staff.Suspended ? 'bg-red-50/30' : ''}`}><td className="p-4 font-mono text-sm text-slate-600 font-bold">{staff.EmployeeId}</td><td className="p-4"><div><span className={`font-bold ${staff.Suspended ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{staff.name}</span>{staff.Suspended && <span className="ml-2 text-[10px] uppercase font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200">Suspended</span>}</div><div className="text-xs text-slate-500">{staff.email}</div></td><td className="p-4"><div className={`text-sm font-semibold inline-block px-2 py-0.5 rounded border mb-1 ${staff.Suspended ? 'text-slate-500 bg-slate-100 border-slate-200' : 'text-blue-700 bg-blue-50 border-blue-100'}`}>{staff.role}</div><div className="text-xs text-slate-500">{staff.Department || 'N/A'} {staff.Designation ? `• ${staff.Designation}` : ''}</div></td><td className="p-4 text-sm text-slate-600">{staff.Location || 'N/A'}</td><td className="p-4 flex items-center justify-end gap-2">
              <button onClick={() => handleEdit(staff)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition inline-flex items-center gap-1">
                <Edit size={14} /> Edit
              </button>
              <button 
                onClick={() => handleToggleSuspend(staff)} 
                className={`px-3 py-1.5 rounded-lg text-sm font-bold transition inline-flex items-center gap-1 ${staff.Suspended ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200' : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'}`}
              >
                {staff.Suspended ? <><CheckCircle size={14} /> Reactivate</> : <><Ban size={14} /> Suspend</>}
              </button>
            </td></tr>))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default StaffTab;