import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Store, Globe, AlertTriangle, ShieldAlert, BadgeCheck } from 'lucide-react';

const formatSubdomainUrl = (subdomain) => {
  if (!subdomain) return '';
  // Remove protocols, trailing slash, and duplicate .galibrand.cloud suffixes
  const clean = subdomain.replace(/^https?:\/\//i, '').replace(/\/+$/, '').replace(/(\.galibrand\.cloud)+$/, '');
  return `${clean}.galibrand.cloud`;
};

const MyStoreTab = () => {
  const { currentUser, stores, myPerformanceStores } = useOutletContext();
  const [activeSubTab, setActiveSubTab] = useState('onboarded'); // 'onboarded' | 'assigned'

  const employee = currentUser?.employeeDetails || {};
  
  // Stores I Onboarded - fetched directly from performance endpoint
  const myOnboardedStores = myPerformanceStores || [];

  // Stores I Manage - resolved from global stores list using assignedStores IDs
  const assignedStoreIds = employee.assignedStores || [];
  const myAssignedStores = stores.filter(s => assignedStoreIds.includes(s._id));

  const listToRender = activeSubTab === 'onboarded' ? myOnboardedStores : myAssignedStores;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Sub Tabs */}
      <div className="flex gap-4 border-b border-slate-200 pb-3">
        <button 
          onClick={() => setActiveSubTab('onboarded')}
          className={`pb-2 text-sm font-bold transition-all relative ${activeSubTab === 'onboarded' ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Stores I Onboarded ({myOnboardedStores.length})
        </button>
        <button 
          onClick={() => setActiveSubTab('assigned')}
          className={`pb-2 text-sm font-bold transition-all relative ${activeSubTab === 'assigned' ? 'text-blue-600 font-extrabold border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Stores I Manage ({myAssignedStores.length})
        </button>
      </div>

      {listToRender.length > 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Store Info</th>
                  <th className="px-6 py-4">Domain & Link</th>
                  <th className="px-6 py-4">Plan Name</th>
                  <th className="px-6 py-4">Active Plan Price</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {listToRender.map(store => {
                  const daysLeft = store.planExpiryDate 
                    ? Math.ceil((new Date(store.planExpiryDate) - new Date()) / (1000 * 60 * 60 * 24))
                    : null;
                  const isExpired = daysLeft !== null && daysLeft <= 0;

                  // Plan information (differs slightly between populated performance store structure and standard store)
                  const planName = store.plan ? store.plan.name : (typeof store.planId === 'object' && store.planId !== null ? store.planId.name : 'Free');
                  const planPrice = store.plan ? store.plan.price : (typeof store.planId === 'object' && store.planId !== null ? store.planId.price : 0);

                  return (
                    <tr key={store._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-inner">
                            <Store size={18} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">{store.storeName || store.name}</p>
                            <p className="text-xs text-slate-400 font-medium">ID: {store.storeId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <a 
                            href={`https://${formatSubdomainUrl(store.subdomain)}`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-blue-600 hover:underline font-bold text-xs"
                          >
                            {formatSubdomainUrl(store.subdomain)}
                          </a>
                          {store.customDomain ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-100 text-xs font-bold w-fit shadow-sm">
                              <Globe size={12} className="text-emerald-600" />
                              <span>External: </span>
                              <a 
                                href={`https://${store.customDomain}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="hover:underline font-extrabold text-emerald-800"
                              >
                                {store.customDomain}
                              </a>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-400 font-medium italic">
                              No external domain connected
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 uppercase text-xs">
                        {planName}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-800 text-xs">
                        ₹{planPrice} / month
                      </td>
                      <td className="px-6 py-4">
                        {store.subscriptionStatus === 'active' ? (
                          <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                            <BadgeCheck size={12} /> Active
                          </span>
                        ) : store.subscriptionStatus === 'expired' || isExpired ? (
                          <span className="px-2.5 py-0.5 bg-red-50 text-red-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                            <ShieldAlert size={12} /> Expired
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1 w-fit">
                            <AlertTriangle size={12} /> Pending / Trial
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-600">
                        {store.planExpiryDate ? (
                          <div className="space-y-0.5">
                            <p className="text-xs font-semibold">{new Date(store.planExpiryDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}</p>
                            <p className={`text-[10px] font-bold ${daysLeft <= 3 ? 'text-red-500' : 'text-slate-400'}`}>
                              {daysLeft > 0 ? `${daysLeft} Days Left` : 'Expired'}
                            </p>
                          </div>
                        ) : 'N/A'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <div className="h-16 w-16 bg-slate-50 text-slate-400 flex items-center justify-center rounded-full mx-auto mb-4 border border-slate-200">
            <Store size={28} />
          </div>
          <h4 className="text-base font-bold text-slate-700">No Stores Found</h4>
          <p className="text-sm text-slate-500 mt-1">
            {activeSubTab === 'onboarded' 
              ? 'You have not onboarded any stores on the platform yet.' 
              : 'You have not been assigned to manage any stores yet.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default MyStoreTab;
