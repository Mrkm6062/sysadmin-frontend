import React, { useState, useEffect } from 'react';
import AdminLayout from '../components/AdminLayout';
import { Palette, Plus, Edit, Trash2, X, Check, EyeOff, Image as ImageIcon } from 'lucide-react';

const SuperadminManageThemes = ({ token: propToken, stores: propStores, onLogout: propLogout }) => {
  // Fallback to localStorage if props are not passed directly by the router in App.jsx
  const token = propToken || localStorage.getItem('token');
  const stores = propStores || JSON.parse(localStorage.getItem('stores') || '[]');
  const handleLogout = propLogout || (() => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  });

  const [themes, setThemes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const initialFormState = {
    name: '',
    themeId: '',
    type: 'free',
    category: ['general'],
    description: '',
    previewImage: '',
    themeFolder: '',
    isActive: true,
    price: 0,
    version: '1.0'
  };

  const [formData, setFormData] = useState(initialFormState);

  const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
  const API_BASE_URL = envUrl;

  const categoryOptions = ["restaurant", "nasta", "vegetable", "ecommerce", "clothing", "kirana", "general"];

  // Fetch Themes on Load
  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/superadmin/themes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setThemes(data);
      }
    } catch (e) {
      setStatus('❌ Failed to load themes.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleCategoryChange = (cat) => {
    const currentCategories = [...formData.category];
    if (currentCategories.includes(cat)) {
      setFormData({ ...formData, category: currentCategories.filter(c => c !== cat) });
    } else {
      setFormData({ ...formData, category: [...currentCategories, cat] });
    }
  };

  const openForm = (theme = null) => {
    if (theme) {
      setFormData(theme);
      setIsEditing(true);
    } else {
      setFormData(initialFormState);
      setIsEditing(false);
    }
    setIsFormOpen(true);
    setStatus('');
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormData(initialFormState);
    setIsEditing(false);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    // Note: Change 'image' below if your backend multer/upload middleware expects a different field name (like 'file')
    uploadData.append('image', file); 

    setLoading(true);
    setStatus('Uploading image...');

    try {
      const res = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: uploadData
      });

      const data = await res.json();

      if (res.ok) {
        // Try to parse the image URL from common backend response structures
        const imageUrl = data.url || data.secure_url || data.imageUrl || data.image; 
        if (imageUrl) {
          setFormData({ ...formData, previewImage: imageUrl });
          setStatus('✅ Image uploaded successfully!');
          setTimeout(() => setStatus(''), 3000);
        } else {
          setStatus('❌ Upload successful, but unable to read the URL from response.');
        }
      } else {
        setStatus(`❌ Error: ${data.message || 'Failed to upload image'}`);
      }
    } catch (err) {
      setStatus(`❌ Error: ${err.message}`);
    } finally {
      setLoading(false);
      e.target.value = ''; // Reset input to allow re-uploading the same file if needed
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus('Saving theme...');

    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing 
      ? `${API_BASE_URL}/api/superadmin/themes/${formData._id}` 
      : `${API_BASE_URL}/api/superadmin/themes`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('✅ Theme saved successfully!');
        fetchThemes();
        setTimeout(() => closeForm(), 1500);
      } else {
        setStatus(`❌ Error: ${data.message || 'Failed to save theme'}`);
      }
    } catch (e) {
      setStatus(`❌ Error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete the theme "${name}"? This action cannot be undone.`)) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/superadmin/themes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        setThemes(themes.filter(t => t._id !== id));
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.message}`);
      }
    } catch (e) {
      alert(`Error deleting theme: ${e.message}`);
    }
  };

  return (
    
      <div className="w-full px-6 py-10 mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-slate-800 flex items-center gap-3">
              <Palette className="text-[#76b900]" size={32} /> Theme Library
            </h2>
            <p className="text-slate-500 mt-1">Create and manage storefront templates for your SaaS users.</p>
          </div>
          <button 
            onClick={() => openForm()}
            className="px-6 py-3 bg-[#76b900] text-white font-bold rounded-xl hover:bg-[#659e00] transition shadow-lg flex items-center gap-2"
          >
            <Plus size={20} /> Add New Theme
          </button>
        </div>

        {/* Theme Grid */}
        {!isFormOpen ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading && themes.length === 0 ? (
              <div className="col-span-full py-10 text-center text-slate-500 font-medium">Loading themes...</div>
            ) : themes.length === 0 ? (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-slate-200 border-dashed flex flex-col items-center justify-center">
                <Palette size={48} className="text-slate-300 mb-4" />
                <h3 className="text-lg font-bold text-slate-700">No themes found</h3>
                <p className="text-slate-500 mb-6">Start by creating your first storefront theme.</p>
                <button onClick={() => openForm()} className="px-6 py-2.5 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition">Add Theme</button>
              </div>
            ) : (
              themes.map((theme) => (
                <div key={theme._id} className={`bg-white rounded-2xl overflow-hidden border transition-all flex flex-col ${theme.isActive ? 'border-slate-200 shadow-sm' : 'border-slate-200 opacity-75 grayscale-[30%]'}`}>
                  <div className="h-48 bg-slate-100 relative border-b border-slate-100 flex items-center justify-center overflow-hidden group">
                    {theme.previewImage ? (
                      <img src={theme.previewImage} alt={theme.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <ImageIcon size={40} className="text-slate-300" />
                    )}
                    {!theme.isActive && (
                      <div className="absolute top-3 left-3 bg-slate-800 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                        <EyeOff size={14} /> Inactive
                      </div>
                    )}
                    <div className="absolute top-3 right-3 flex gap-2">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full shadow-sm capitalize ${theme.type === 'premium' ? 'bg-amber-100 text-amber-700' : theme.type === 'paid' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                        {theme.type}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-xl font-bold text-slate-800 mb-1">{theme.name}</h3>
                    <p className="text-xs font-mono text-slate-400 mb-4">ID: {theme.themeId} | Folder: {theme.themeFolder}</p>
                    <p className="text-slate-500 text-sm mb-6 flex-1 line-clamp-3">{theme.description}</p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                      <div className="flex gap-1 overflow-hidden max-w-[50%]">
                        {theme.category.slice(0, 2).map(cat => (
                          <span key={cat} className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md truncate">{cat}</span>
                        ))}
                        {theme.category.length > 2 && <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded-md">+{theme.category.length - 2}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => openForm(theme)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-colors" title="Edit Theme">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDelete(theme._id, theme.name)} className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-colors" title="Delete Theme">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Create / Edit Form */
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden animate-fadeIn max-w-4xl">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-extrabold text-slate-800">{isEditing ? 'Edit Theme' : 'Create New Theme'}</h3>
              <button onClick={closeForm} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            {status && (
              <div className={`mx-6 mt-6 p-4 rounded-xl text-sm font-bold border ${status.includes('❌') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-[#76b900] border-green-200'}`}>
                {status}
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Display Name <span className="text-red-500">*</span></label><input type="text" name="name" required value={formData.name} onChange={handleInputChange} placeholder="e.g. Modern Minimalist" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#76b900] focus:ring-1 focus:ring-[#76b900] outline-none transition text-sm" /></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Theme ID (Slug) <span className="text-red-500">*</span></label><input type="text" name="themeId" required disabled={isEditing} value={formData.themeId} onChange={handleInputChange} placeholder="e.g. modern-minimalist" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#76b900] focus:ring-1 focus:ring-[#76b900] outline-none transition text-sm disabled:bg-slate-50 disabled:text-slate-500" /></div>
                
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Pricing Type <span className="text-red-500">*</span></label><select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#76b900] focus:ring-1 focus:ring-[#76b900] outline-none transition text-sm bg-white"><option value="free">Free</option><option value="paid">Paid (One-time)</option><option value="premium">Premium (Subscription Plan Lock)</option></select></div>
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Frontend Target Folder <span className="text-red-500">*</span></label><input type="text" name="themeFolder" required value={formData.themeFolder} onChange={handleInputChange} placeholder="e.g. themes/modern" className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#76b900] focus:ring-1 focus:ring-[#76b900] outline-none transition text-sm font-mono" /></div>
                
                {formData.type === 'paid' && (
                  <div><label className="block text-sm font-bold text-slate-700 mb-2">Price (₹)</label><input type="number" name="price" min="0" value={formData.price} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#76b900] focus:ring-1 focus:ring-[#76b900] outline-none transition text-sm" /></div>
                )}
                <div><label className="block text-sm font-bold text-slate-700 mb-2">Version</label><input type="text" name="version" value={formData.version} onChange={handleInputChange} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#76b900] focus:ring-1 focus:ring-[#76b900] outline-none transition text-sm" /></div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3">Target Categories</label>
                <div className="flex flex-wrap gap-3">
                  {categoryOptions.map(cat => (
                    <label key={cat} className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 cursor-pointer transition-colors ${formData.category.includes(cat) ? 'border-[#76b900] bg-green-50 text-green-800' : 'border-slate-200 hover:border-slate-300 text-slate-600'}`}>
                      <input type="checkbox" checked={formData.category.includes(cat)} onChange={() => handleCategoryChange(cat)} className="hidden" />
                      <span className="text-sm font-bold capitalize">{cat}</span>
                      {formData.category.includes(cat) && <Check size={14} className="text-[#76b900]" />}
                    </label>
                  ))}
                </div>
              </div>

              <div><label className="block text-sm font-bold text-slate-700 mb-2">Description</label><textarea name="description" rows="3" value={formData.description} onChange={handleInputChange} placeholder="Brief description of this theme..." className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:border-[#76b900] focus:ring-1 focus:ring-[#76b900] outline-none transition text-sm resize-none" /></div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Preview Image</label>
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-3">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload} 
                    className="w-full md:w-auto px-4 py-2 border border-slate-200 rounded-xl focus:border-[#76b900] focus:ring-1 focus:ring-[#76b900] outline-none transition text-sm cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-[#76b900] hover:file:bg-green-100" 
                  />
                  {formData.previewImage && (
                    <button type="button" onClick={() => setFormData({...formData, previewImage: ''})} className="px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition text-sm font-bold">Remove Image</button>
                  )}
                </div>
                {formData.previewImage ? (
                  <div className="w-full max-w-sm h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                    <img src={formData.previewImage} alt="Preview" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
                  </div>
                ) : (
                  <div className="w-full max-w-sm h-48 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                    <ImageIcon size={32} className="mb-2" />
                    <span className="text-sm font-medium">No image uploaded</span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} className="w-5 h-5 text-[#76b900] rounded focus:ring-[#76b900]" />
                  <span className="font-bold text-slate-700">Theme is Active and Available to Users</span>
                </label>
                
                <div className="flex gap-4">
                  <button type="button" onClick={closeForm} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-800 transition">Cancel</button>
                  <button type="submit" disabled={loading} className="px-8 py-2.5 bg-[#76b900] text-white font-bold rounded-xl hover:bg-[#659e00] transition shadow-lg disabled:opacity-50">
                    {loading ? 'Saving...' : 'Save Theme'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
  );
};

export default SuperadminManageThemes;