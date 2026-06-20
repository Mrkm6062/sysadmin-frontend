import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, DownloadCloud, UploadCloud } from 'lucide-react';

const DefaultProductsTab = () => {
  const [defaultProducts, setDefaultProducts] = useState([]);
  const [isDefaultProductFormOpen, setIsDefaultProductFormOpen] = useState(false);
  const [editingDefaultProductId, setEditingDefaultProductId] = useState(null);
  const [defaultProductForm, setDefaultProductForm] = useState({ name: '', description: '', basePrice: '', totalStock: '', unitType: 'piece', storeTypes: '', category: '', foodtype: '', isActive: true, images: [], variants: [] });
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);
  const [mediaImages, setMediaImages] = useState([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [storeTypesList, setStoreTypesList] = useState([]);
  const [filterStoreType, setFilterStoreType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [uniqueCategories, setUniqueCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [isImporting, setIsImporting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchStoreTypes = async () => {
      try {
        const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
        const response = await fetch(`${envUrl}/api/store-types/active`);
        if (response.ok) {
          const data = await response.json();
          setStoreTypesList(data);
          if (data.length > 0) {
            setDefaultProductForm(prev => ({ ...prev, storeTypes: prev.storeTypes || data[0].name }));
          }
        }
      } catch (err) {
        console.error("Failed to load store types", err);
      }
    };
    fetchStoreTypes();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('superadmin_token');
        const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
        const response = await fetch(`${envUrl}/api/superadmin/default-products?limit=10000`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) {
          const dpData = await response.json();
          setDefaultProducts(dpData.data || []);
        }
      } catch (err) {
        setError('Failed to load default products');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (defaultProducts.length > 0) {
      const categories = [...new Set(defaultProducts.map(p => p.category).filter(Boolean))];
      setUniqueCategories(categories.sort());
    }
  }, [defaultProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStoreType, filterCategory]);

  const handleAddVariant = () => setDefaultProductForm({ ...defaultProductForm, variants: [...defaultProductForm.variants, { name: '', price: '', stock: '', sku: '' }] });
  const handleUpdateVariant = (index, field, value) => {
    const newVariants = [...defaultProductForm.variants];
    newVariants[index][field] = value;
    setDefaultProductForm({ ...defaultProductForm, variants: newVariants });
  };
  const handleRemoveVariant = (index) => setDefaultProductForm({ ...defaultProductForm, variants: defaultProductForm.variants.filter((_, i) => i !== index) });
  const handleRemoveImage = (index) => setDefaultProductForm({ ...defaultProductForm, images: defaultProductForm.images.filter((_, i) => i !== index) });

  const handleDefaultProductImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const uploadData = new FormData();
    uploadData.append('storeId', '000000000000000000000000'); 
    files.forEach(file => uploadData.append('images', file));
    setUploadingProductImage(true);
    try {
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/upload`, { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}` }, body: uploadData });
      const data = await response.json();
      if (response.ok) setDefaultProductForm(prev => ({ ...prev, images: [...prev.images, ...data.urls] }));
      else setError(`Upload Error: ${data.message}`);
    } catch (err) { setError(`Upload Error: ${err.message}`); } finally { setUploadingProductImage(false); }
  };

  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/upload?storeId=000000000000000000000000`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('superadmin_token')}` } });
      const data = await response.json();
      if (response.ok) setMediaImages(data.images || []);
    } catch (err) { console.error(err); } finally { setLoadingMedia(false); }
  };

  const handleSaveDefaultProduct = async (e) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const method = editingDefaultProductId ? 'PUT' : 'POST';
      const url = editingDefaultProductId ? `${envUrl}/api/superadmin/default-products/${editingDefaultProductId}` : `${envUrl}/api/superadmin/default-products`;
      const variantsData = defaultProductForm.variants.map(v => ({ ...v, price: Number(v.price), stock: Number(v.stock) }));
      const calculatedTotalStock = variantsData.length > 0 ? variantsData.reduce((acc, curr) => acc + curr.stock, 0) : (Number(defaultProductForm.totalStock) || 0);
      const payload = { ...defaultProductForm, storeTypes: typeof defaultProductForm.storeTypes === 'string' ? defaultProductForm.storeTypes.split(',').map(s => s.trim()).filter(Boolean) : defaultProductForm.storeTypes, basePrice: Number(defaultProductForm.basePrice) || 0, totalStock: calculatedTotalStock, images: defaultProductForm.images, variants: variantsData };

      const response = await fetch(url, { method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (response.ok) {
        const result = await response.json();
        setDefaultProducts(prev => {
          if (editingDefaultProductId) return prev.map(p => p._id === editingDefaultProductId ? result.product : p);
          return [result.product, ...prev];
        });
        setIsDefaultProductFormOpen(false);
        setEditingDefaultProductId(null);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to save default product');
      }
    } catch (err) { setError('Network error while saving default product'); } finally {
      setIsSaving(false);
    }
  };

  const editDefaultProduct = (product) => {
    setDefaultProductForm({ name: product.name || '', description: product.description || '', basePrice: product.basePrice || '', totalStock: product.totalStock !== undefined ? product.totalStock : (product.stock || ''), unitType: product.unitType || 'piece', storeTypes: (product.storeTypes && product.storeTypes.length > 0) ? product.storeTypes[0] : (storeTypesList.length > 0 ? storeTypesList[0].name : ''), category: product.category || '', foodtype: product.foodtype || '', isActive: product.isActive !== false, images: product.images || [], variants: product.variants || [] });
    setEditingDefaultProductId(product._id);
    setIsDefaultProductFormOpen(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteDefaultProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this default product?")) return;
    try {
      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');
      const response = await fetch(`${envUrl}/api/superadmin/default-products/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      if (response.ok) setDefaultProducts(defaultProducts.filter(p => p._id !== id));
      else { const data = await response.json(); setError(data.message || 'Failed to delete default product'); }
    } catch (err) { setError('Network error while deleting default product'); }
  };

  // --- CSV Export & Import ---
  const handleExportCSV = () => {
    let csvContent = "ID,Name,Category,FoodType,StoreTypes,BasePrice,TotalStock,UnitType,IsActive,Description\n";
    filteredProducts.forEach(p => {
      const storeTypesStr = (p.storeTypes || []).join(';');
      csvContent += `"${p._id}","${p.name.replace(/"/g, '""')}","${(p.category || '').replace(/"/g, '""')}","${(p.foodtype || '').replace(/"/g, '""')}","${storeTypesStr}","${p.basePrice}","${p.totalStock}","${p.unitType}","${p.isActive}","${(p.description || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `default_products_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setError('');

    const parseCSVRow = (str) => {
      const result = [];
      let cur = '';
      let inQuote = false;
      for (let i = 0; i < str.length; i++) {
        if (str[i] === '"') inQuote = !inQuote;
        else if (str[i] === ',' && !inQuote) { result.push(cur.trim()); cur = ''; }
        else cur += str[i];
      }
      result.push(cur.trim());
      return result.map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'));
    };

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target.result;
      const rows = text.split('\n').filter(line => line.trim()).map(parseCSVRow);
      const dataRows = rows.slice(1).filter(r => r.length >= 9); // Require minimum columns

      const token = localStorage.getItem('superadmin_token');
      const envUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3011').replace(/\/api\/superadmin\/?$/, '').replace(/\/$/, '');

      let successCount = 0;
      let failCount = 0;
      const errors = [];

      // Process NEW products (blank ID) ONE AT A TIME to avoid slug race conditions.
      // Process UPDATE products (has ID) in parallel batches since those already have slugs.
      const newProducts = dataRows.filter(row => {
        const idRaw = row[0];
        return !idRaw || !idRaw.trim() || idRaw.trim().length !== 24;
      });
      const updateProducts = dataRows.filter(row => {
        const idRaw = row[0];
        return idRaw && idRaw.trim() && idRaw.trim().length === 24;
      });

      // Process new products sequentially
      for (const row of newProducts) {
        const [idRaw, name, category, foodtype, storeTypesRaw, basePrice, totalStock, unitType, isActive, description] = row;
        if (!name || !name.trim()) { failCount++; errors.push(`Skipped row with empty name`); continue; }
        
        const payload = {
          name: name.trim(), category: category ? category.trim() : '', foodtype: foodtype ? foodtype.trim() : '', unitType: (unitType || 'piece').trim(), description: (description || '').trim(),
          storeTypes: storeTypesRaw ? storeTypesRaw.split(';').map(s => s.trim()).filter(Boolean) : [],
          basePrice: Number(basePrice) || 0,
          totalStock: Number(totalStock) || 0,
          isActive: String(isActive).toLowerCase() !== 'false',
          images: [], variants: []
        };
        try {
          const response = await fetch(`${envUrl}/api/superadmin/default-products`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) 
          });
          if (response.ok) { successCount++; }
          else { 
            const errData = await response.json().catch(() => ({})); 
            failCount++; 
            errors.push(`"${payload.name}": ${errData.message || `HTTP ${response.status}`}`); 
          }
        } catch (e) { failCount++; errors.push(`"${(payload.name || 'unknown')}": Network error - ${e.message}`); }
      }

      // Process updates in parallel batches
      const batchSize = 10;
      for (let i = 0; i < updateProducts.length; i += batchSize) {
        const batch = updateProducts.slice(i, i + batchSize);
        const promises = batch.map(async (row) => {
          const [idRaw, name, category, foodtype, storeTypesRaw, basePrice, totalStock, unitType, isActive, description] = row;
          const id = idRaw.trim();
          const payload = {
            name: name.trim(), category: category ? category.trim() : '', foodtype: foodtype ? foodtype.trim() : '', unitType: (unitType || 'piece').trim(), description: (description || '').trim(),
            storeTypes: storeTypesRaw ? storeTypesRaw.split(';').map(s => s.trim()).filter(Boolean) : [],
            basePrice: Number(basePrice) || 0,
            totalStock: Number(totalStock) || 0,
            isActive: String(isActive).toLowerCase() !== 'false',
          };
          try {
            const response = await fetch(`${envUrl}/api/superadmin/default-products/${id}`, { 
              method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify(payload) 
            });
            if (response.ok) { successCount++; }
            else { 
              const errData = await response.json().catch(() => ({})); 
              failCount++; 
              errors.push(`Update "${payload.name}": ${errData.message || `HTTP ${response.status}`}`); 
            }
          } catch (e) { failCount++; errors.push(`Update "${(payload.name || id)}": Network error - ${e.message}`); }
        });
        await Promise.all(promises);
      }

      // Show detailed errors if any
      if (errors.length > 0) {
        const errorSummary = errors.slice(0, 20).join('\n• ');
        const moreMsg = errors.length > 20 ? `\n...and ${errors.length - 20} more errors` : '';
        alert(`Import Complete!\n✅ Success: ${successCount}\n❌ Failed: ${failCount}\n\nErrors:\n• ${errorSummary}${moreMsg}`);
      } else {
        alert(`Import Complete!\n✅ Successfully processed ${successCount} products.`);
      }

      e.target.value = null;
      
      // Refresh List
      try {
        const response = await fetch(`${envUrl}/api/superadmin/default-products?limit=10000`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (response.ok) { const dpData = await response.json(); setDefaultProducts(dpData.data || []); }
      } catch(err) {}
      setIsImporting(false);
    };
    reader.readAsText(file);
  };

  if (loading) return <div className="p-8 text-center text-slate-500 font-bold">Loading Default Products...</div>;
  if (isImporting) return <div className="p-20 text-center text-blue-500 font-bold animate-pulse text-xl">Importing CSV, please wait... This may take a moment for thousands of products.</div>;

  const filteredProducts = defaultProducts.filter(product => {
    const storeTypeMatch = filterStoreType === 'all' || (product.storeTypes && product.storeTypes.includes(filterStoreType));
    const categoryMatch = filterCategory === 'all' || product.category === filterCategory;
    const searchMatch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
    return storeTypeMatch && categoryMatch && searchMatch;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-slate-800">Default Product Catalog</h2>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={handleExportCSV} className="px-4 py-2 bg-white text-blue-600 border border-blue-200 font-bold rounded-lg hover:bg-blue-50 transition flex items-center gap-2 text-sm">
            <DownloadCloud size={18} /> Export CSV
          </button>
          <label className="px-4 py-2 bg-white text-indigo-600 border border-indigo-200 font-bold rounded-lg hover:bg-indigo-50 transition flex items-center gap-2 text-sm cursor-pointer">
            <UploadCloud size={18} /> Import CSV
            <input type="file" accept=".csv" className="hidden" onChange={handleImportCSV} disabled={isImporting} />
          </label>
          <button onClick={() => { setDefaultProductForm({ name: '', description: '', basePrice: '', totalStock: '', unitType: 'piece', storeTypes: storeTypesList.length > 0 ? storeTypesList[0].name : '', category: '', foodtype: '', isActive: true, images: [], variants: [] }); setEditingDefaultProductId(null); setIsDefaultProductFormOpen(!isDefaultProductFormOpen); }} className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 text-sm">
            {isDefaultProductFormOpen ? 'Cancel' : '+ Add Default Product'}
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Search by Name</label>
          <input 
            type="text" 
            value={searchQuery} 
            onChange={e => setSearchQuery(e.target.value)} 
            placeholder="Search products..." 
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm"
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Store Type</label>
          <select value={filterStoreType} onChange={e => setFilterStoreType(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
            <option value="all">All Store Types</option>
            {storeTypesList.map(st => <option key={st._id} value={st.name}>{st.name}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Category</label>
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white text-sm">
            <option value="all">All Categories</option>
            {uniqueCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
        <div className="flex-shrink-0 md:self-end">
            <p className="text-sm font-bold text-slate-600 text-center md:text-right h-full flex items-center justify-center bg-white px-4 py-2 rounded-lg border border-slate-300">
                Showing {filteredProducts.length} / {defaultProducts.length} products
            </p>
        </div>
      </div>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-200">{error}</div>}

      {isDefaultProductFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 sticky top-0 z-10"><h3 className="text-2xl font-extrabold text-slate-800">{editingDefaultProductId ? 'Edit Default Product' : 'Add New Default Product'}</h3><button onClick={() => { setIsDefaultProductFormOpen(false); setEditingDefaultProductId(null); }} className="text-slate-400 hover:text-red-500 transition-colors text-3xl leading-none">&times;</button></div>
            <div className="p-8 overflow-y-auto flex-1">
              <form id="defaultProductForm" onSubmit={handleSaveDefaultProduct} className="space-y-8">
                <div className="space-y-4">
                  <h4 className="font-bold text-lg border-b border-slate-100 pb-2 text-slate-800">Basic Info</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-sm font-semibold mb-1 text-slate-700">Product Name <span className="text-red-500">*</span></label><input required value={defaultProductForm.name} onChange={e=>setDefaultProductForm({...defaultProductForm, name: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-shadow" placeholder="e.g. Fresh Tomatoes" /></div>
                    <div><label className="block text-sm font-semibold mb-1 text-slate-700">Category</label><input type="text" value={defaultProductForm.category} onChange={e=>setDefaultProductForm({...defaultProductForm, category: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-shadow bg-white" placeholder="e.g. Groceries" /></div>
                    <div><label className="block text-sm font-semibold mb-1 text-slate-700">Food Type</label><input type="text" value={defaultProductForm.foodtype} onChange={e=>setDefaultProductForm({...defaultProductForm, foodtype: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-shadow bg-white" placeholder="e.g. Veg, Non-Veg, Vegan" /></div>
                    <div><label className="block text-sm font-semibold mb-1 text-slate-700">Store Type <span className="text-red-500">*</span></label>
                      <select required value={defaultProductForm.storeTypes} onChange={e => setDefaultProductForm({...defaultProductForm, storeTypes: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-shadow bg-white">
                        {storeTypesList.length > 0 ? storeTypesList.map(st => <option key={st._id} value={st.name}>{st.name}</option>) : <option value="kirana">Kirana (Default)</option>}
                      </select>
                    </div>
                    <div className="md:col-span-2"><label className="block text-sm font-semibold mb-1 text-slate-700">Description</label><textarea rows="3" value={defaultProductForm.description} onChange={e=>setDefaultProductForm({...defaultProductForm, description: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 transition-shadow resize-none" placeholder="Provide product details..." /></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-bold text-lg border-b border-slate-100 pb-2 text-slate-800">Pricing & Default Inventory</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div><label className="block text-sm font-semibold mb-1 text-slate-700">Base Price (₹) <span className="text-red-500">*</span></label><input type="number" required={defaultProductForm.variants.length === 0} value={defaultProductForm.basePrice} onChange={e=>setDefaultProductForm({...defaultProductForm, basePrice: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600" placeholder="0.00" /></div>
                    <div><label className="block text-sm font-semibold mb-1 text-slate-700">Total Stock</label><input type="number" value={defaultProductForm.totalStock} onChange={e=>setDefaultProductForm({...defaultProductForm, totalStock: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 disabled:bg-slate-50" disabled={defaultProductForm.variants.length > 0} placeholder={defaultProductForm.variants.length > 0 ? "Calculated from variants" : "0"} /></div>
                    <div><label className="block text-sm font-semibold mb-1 text-slate-700">Selling Unit Type</label><select value={defaultProductForm.unitType} onChange={e=>setDefaultProductForm({...defaultProductForm, unitType: e.target.value})} className="w-full px-4 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-600 bg-white"><option value="piece">Piece</option><option value="kg">Kg</option><option value="gram">Gram</option><option value="plate">Plate</option><option value="pack">Pack</option><option value="size">Size</option></select></div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2"><h4 className="font-bold text-lg text-slate-800">Product Images</h4><div className="flex gap-2"><button type="button" onClick={() => { setIsMediaLibraryOpen(true); fetchMedia(); }} className="text-sm font-bold text-slate-600 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg transition-colors">View Media Library</button><label className={`cursor-pointer text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors ${uploadingProductImage ? 'opacity-50 cursor-not-allowed' : ''}`}>{uploadingProductImage ? 'Uploading...' : '+ Upload Images'}<input type="file" multiple accept="image/*" className="hidden" onChange={handleDefaultProductImageUpload} disabled={uploadingProductImage} /></label></div></div>
                  {defaultProductForm.images.length === 0 && <p className="text-sm text-slate-500 italic">No images added. A placeholder will be shown.</p>}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {defaultProductForm.images.map((img, idx) => (
                      <div key={idx} className="relative group rounded-xl border border-slate-200 overflow-hidden bg-slate-50 aspect-square flex items-center justify-center"><img src={img} alt={`Product ${idx+1}`} className="w-full h-full object-cover" /><button type="button" onClick={()=>handleRemoveImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-red-600">&times;</button></div>
                    ))}
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2"><h4 className="font-bold text-lg text-slate-800">Product Variants</h4><button type="button" onClick={handleAddVariant} className="text-sm font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors">+ Add Variant</button></div>
                  {defaultProductForm.variants.length === 0 ? <p className="text-sm text-slate-500 italic">No variants added. The product will use the base price and total stock.</p> : defaultProductForm.variants.map((v, idx) => (
                    <div key={idx} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 relative group transition-colors hover:border-slate-300">
                      <button type="button" onClick={()=>handleRemoveVariant(idx)} className="absolute top-3 right-4 text-red-400 hover:text-red-600 font-bold text-xl leading-none">&times;</button>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-2">
                        <div className="md:col-span-2"><label className="block text-xs font-semibold mb-1 text-slate-600">Variant Name <span className="text-red-500">*</span></label><input type="text" placeholder="e.g. 500g, Red, Size L" value={v.name} onChange={e=>handleUpdateVariant(idx, 'name', e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600" /></div>
                        <div><label className="block text-xs font-semibold mb-1 text-slate-600">Price (₹) <span className="text-red-500">*</span></label><input type="number" placeholder="Price" value={v.price} onChange={e=>handleUpdateVariant(idx, 'price', e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600" /></div>
                        <div><label className="block text-xs font-semibold mb-1 text-slate-600">Stock <span className="text-red-500">*</span></label><input type="number" placeholder="Qty" value={v.stock} onChange={e=>handleUpdateVariant(idx, 'stock', e.target.value)} required className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600" /></div>
                        <div><label className="block text-xs font-semibold mb-1 text-slate-600">SKU Code</label><input type="text" placeholder="Optional" value={v.sku} onChange={e=>handleUpdateVariant(idx, 'sku', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600" /></div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 border-t border-slate-100 pt-4"><label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"><input type="checkbox" checked={defaultProductForm.isActive} onChange={e => setDefaultProductForm({...defaultProductForm, isActive: e.target.checked})} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500" />Active (Visible to Stores)</label></div>
              </form>
            </div>
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-4 rounded-b-3xl sticky bottom-0"><button type="button" onClick={() => { setIsDefaultProductFormOpen(false); setEditingDefaultProductId(null); }} className="px-6 py-2.5 font-bold text-slate-500 hover:text-slate-800 transition-colors">Cancel</button><button type="submit" form="defaultProductForm" disabled={isSaving} className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100 disabled:opacity-50">{isSaving ? 'Saving...' : (editingDefaultProductId ? 'Update Default Product' : 'Save Default Product')}</button></div>
          </div>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead><tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200"><th className="p-4 font-bold">Image</th><th className="p-4 font-bold">Product Name</th><th className="p-4 font-bold">Category</th><th className="p-4 font-bold">Food Type</th><th className="p-4 font-bold">Store Types</th><th className="p-4 font-bold text-right">Price</th><th className="p-4 font-bold text-center">Status</th><th className="p-4 font-bold text-right">Actions</th></tr></thead>
          <tbody>
            {paginatedProducts.map(product => (
              <tr key={product._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  {product.images && product.images[0] ? (
                    <img src={product.images[0]} alt={product.name} className="w-12 h-12 object-cover rounded-lg border border-slate-200" />
                  ) : (
                    <span className="text-slate-400 text-xs italic">No Image</span>
                  )}
                </td>
                <td className="p-4 font-semibold text-slate-800">{product.name}</td><td className="p-4 text-sm text-slate-600">{product.category || '-'}</td><td className="p-4 text-sm text-slate-600">{product.foodtype || '-'}</td><td className="p-4 text-sm text-slate-600">{(product.storeTypes || []).join(', ')}</td><td className="p-4 text-right font-bold text-slate-800">₹{product.basePrice}/{product.unitType}</td><td className="p-4 text-center"><span className={`px-2 py-1 rounded-md text-xs font-bold ${product.isActive ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>{product.isActive ? 'Active' : 'Inactive'}</span></td>
                <td className="p-4 text-right"><div className="flex justify-end gap-2"><button onClick={() => editDefaultProduct(product)} className="text-blue-500 hover:text-blue-700 text-sm font-bold bg-blue-50 px-3 py-1.5 rounded-lg transition">Edit</button><button onClick={() => handleDeleteDefaultProduct(product._id)} className="text-red-500 hover:text-red-700 text-sm font-bold bg-red-50 px-3 py-1.5 rounded-lg transition">Delete</button></div></td>
              </tr>
            ))}
            {filteredProducts.length === 0 && !loading && <tr><td colSpan="8" className="p-8 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-xl">No default products match your filters.</td></tr>}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {filteredProducts.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50 gap-4 mt-4 rounded-xl">
            <div className="text-sm text-slate-500 flex items-center gap-2">
              Showing <span className="font-bold text-slate-800">{startIndex + 1}</span> to <span className="font-bold text-slate-800">{Math.min(startIndex + itemsPerPage, filteredProducts.length)}</span> of <span className="font-bold text-slate-800">{filteredProducts.length}</span> products
              <select 
                value={itemsPerPage} 
                onChange={e => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }} 
                className="ml-2 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                <ChevronLeft size={18} />
              </button>
              <div className="text-sm font-medium text-slate-600 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
                {currentPage} / {totalPages || 1}
              </div>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DefaultProductsTab;
