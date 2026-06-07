import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { X, ExternalLink, CheckCircle, Shield, Palette, Calendar, User } from 'lucide-react';

const StoresTab = () => {
  const { stores, plans, users } = useOutletContext();
  const [selectedStore, setSelectedStore] = useState(null);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200"><h2 className="text-xl font-bold text-slate-800">Active Stores</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                <th className="p-4 font-bold">Store Name</th>
                <th className="p-4 font-bold">Type</th>
                <th className="p-4 font-bold">URL</th>
                <th className="p-4 font-bold">Owner</th>
                <th className="p-4 font-bold">Plan</th>
                <th className="p-4 font-bold">Expiry Date</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {stores.map(store => {
                const owner = users.find(u => u.userId === store.ownerId);
                const url = store.customDomain || store.subdomain;
                return (
                  <tr key={store._id} onClick={() => setSelectedStore(store)} className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="p-4">
                      <span className="font-semibold text-slate-800">{store.storeName}</span>
                      <span className="block text-xs font-mono text-slate-400">{store.storeId}</span>
                    </td>
                    <td className="p-4 text-sm text-slate-600 capitalize font-medium">{store.storeType || 'N/A'}</td>
                    <td className="p-4"><a href={`https://${url}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center gap-1 text-sm">{url} <ExternalLink size={14} /></a></td>
                    <td className="p-4 text-sm text-slate-600">{owner?.name || 'N/A'}</td>
                    <td className="p-4">
                      <span className="block font-semibold text-slate-800">{plans.find(p => p._id === store.planId)?.name || 'Free'}</span>
                      <span className={`text-xs font-medium capitalize ${store.subscriptionStatus === 'active' ? 'text-green-600' : store.subscriptionStatus === 'expired' ? 'text-red-500' : 'text-orange-500'}`}>
                        {store.subscriptionStatus || 'trial'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-slate-600">{store.planExpiryDate ? new Date(store.planExpiryDate).toLocaleDateString() : 'N/A'}</td>
                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{store.status || 'active'}</span></td>
                  </tr>
                )
              })}
              {stores.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-slate-500 font-medium">No stores created yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {selectedStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold text-slate-800">{selectedStore.storeName}</h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold uppercase rounded-full tracking-wider">{selectedStore.storeType || 'N/A'}</span>
                </div>
                <p className="text-xs text-slate-500 font-mono mt-1">{selectedStore.storeId}</p>
              </div>
              <button onClick={() => setSelectedStore(null)} className="text-slate-400 hover:text-red-500 transition-colors text-3xl leading-none">&times;</button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><User size={14} /> Owner Details</h4>
                  <p className="font-bold text-slate-800">{users.find(u => u.userId === selectedStore.ownerId)?.name || 'N/A'}</p>
                  <p className="text-sm text-slate-600 font-mono">{selectedStore.ownerId}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><ExternalLink size={14} /> Domain & URL</h4>
                  <a href={`https://${selectedStore.customDomain || selectedStore.subdomain}`} target="_blank" rel="noreferrer" className="font-bold text-blue-600 hover:underline">{selectedStore.customDomain || selectedStore.subdomain}</a>
                  <p className="text-sm text-slate-600">{selectedStore.customDomain ? 'Custom Domain' : 'Galibrand Subdomain'}</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Shield size={14} /> Plan & Billing</h4>
                  <p className="font-bold text-slate-800">{plans.find(p => p._id === selectedStore.planId)?.name || 'Free'}</p>
                  <p className="text-sm text-slate-600">Expires on: {selectedStore.planExpiryDate ? new Date(selectedStore.planExpiryDate).toLocaleDateString() : 'N/A'}</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Palette size={14} /> Applied Theme</h4>
                  <p className="font-bold text-slate-800 capitalize">{selectedStore.theme.replace(/-/g, ' ')}</p>
                  <p className="text-sm text-slate-600">Currently active on storefront</p>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2"><CheckCircle size={16} className="text-green-500" /> Purchased Themes ({selectedStore.paidThemes?.length || 0})</h4>
                {selectedStore.paidThemes && selectedStore.paidThemes.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-100 text-xs uppercase text-slate-500"><tr><th className="p-2 text-left">Theme ID</th><th className="p-2 text-left">Transaction ID</th><th className="p-2 text-right">Purchase Date</th></tr></thead>
                      <tbody>
                        {selectedStore.paidThemes.map((theme, i) => (
                          <tr key={i} className="border-t border-slate-100">
                            <td className="p-2 font-mono font-semibold">{theme.themeId}</td>
                            <td className="p-2 font-mono text-slate-500">{theme.transactionId}</td>
                            <td className="p-2 text-right text-slate-500">{new Date(theme.purchaseDate).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">No paid themes purchased for this store.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StoresTab;