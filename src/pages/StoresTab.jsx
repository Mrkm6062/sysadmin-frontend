import React from 'react';
import { useOutletContext } from 'react-router-dom';

const StoresTab = () => {
  const { stores, plans } = useOutletContext();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-200"><h2 className="text-xl font-bold text-slate-800">Active Stores</h2></div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th className="p-4 font-bold">Store ID</th><th className="p-4 font-bold">Store Name</th><th className="p-4 font-bold">URL</th><th className="p-4 font-bold">Owner ID</th><th className="p-4 font-bold">Status</th><th className="p-4 font-bold">Plan</th>
            </tr>
          </thead>
          <tbody>
            {stores.map(store => (
              <tr key={store._id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                <td className="p-4 text-sm font-mono text-slate-500">{store.storeId}</td>
                <td className="p-4 font-semibold text-slate-800">{store.storeName}</td>
                <td className="p-4"><a href={`http://${store.subdomain}`} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">{store.subdomain}</a></td>
                <td className="p-4 text-sm font-mono text-slate-500">{store.ownerId}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded-full text-xs font-bold ${store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{store.status || 'active'}</span></td>
                <td className="p-4">
                  <span className="block font-semibold text-slate-800">{plans.find(p => p._id === store.planId)?.name || 'Free'}</span>
                  <span className={`text-xs font-medium capitalize ${store.subscriptionStatus === 'active' ? 'text-green-600' : store.subscriptionStatus === 'expired' ? 'text-red-500' : 'text-orange-500'}`}>
                    {store.subscriptionStatus || 'trial'}
                  </span>
                </td>
              </tr>
            ))}
            {stores.length === 0 && <tr><td colSpan="6" className="p-8 text-center text-slate-500 font-medium">No stores created yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StoresTab;