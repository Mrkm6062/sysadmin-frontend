import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { IndianRupee, CreditCard, Clock, BadgePercent, CheckCircle, HelpCircle } from 'lucide-react';

const EarningTab = () => {
  const { currentUser, stores } = useOutletContext();
  const employee = currentUser?.employeeDetails || {};
  const onboardedStores = employee.onboardedStores || [];

  // Calculate earnings metrics
  const totalEarnings = onboardedStores.reduce((sum, item) => sum + (item.commissionAmount || 0), 0);
  const paidEarnings = onboardedStores.filter(item => item.isCommissionPaid).reduce((sum, item) => sum + (item.commissionAmount || 0), 0);
  const pendingEarnings = totalEarnings - paidEarnings;

  // Resolve store details for list
  const listData = onboardedStores.map(onboarded => {
    const storeObj = stores.find(s => s._id === onboarded.storeId.toString()) || {};
    return {
      ...onboarded,
      storeName: storeObj.name || 'Store ' + onboarded.storeId,
      subdomain: storeObj.subdomain || ''
    };
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Earnings Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <IndianRupee size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Commission</h4>
            <p className="text-2xl font-extrabold text-slate-800">₹{totalEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Paid Earnings</h4>
            <p className="text-2xl font-extrabold text-slate-800">₹{paidEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
            <Clock size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Payouts</h4>
            <p className="text-2xl font-extrabold text-slate-800">₹{pendingEarnings.toLocaleString('en-IN')}</p>
          </div>
        </div>
      </div>

      {/* Payout Details Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-4">
          <CreditCard size={20} className="text-blue-500" />
          Commission Breakdown & History
        </h3>

        {listData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Onboarded Store</th>
                  <th className="px-6 py-4">Onboarded Date</th>
                  <th className="px-6 py-4">Commission (₹)</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Paid On</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {listData.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800">{item.storeName}</div>
                      {item.subdomain && (
                        <div className="text-xs text-slate-400 font-medium">
                          {item.subdomain}.galibrand.cloud
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-600">
                      {new Date(item.onboardedAt || item.createdAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">
                      ₹{(item.commissionAmount || 0).toLocaleString('en-IN')}
                    </td>
                    <td className="px-6 py-4">
                      {item.isCommissionPaid ? (
                        <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full w-fit">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-full w-fit">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-500">
                      {item.isCommissionPaid && item.paidAt ? (
                        new Date(item.paidAt).toLocaleDateString('en-IN', { dateStyle: 'medium' })
                      ) : (
                        <span className="text-slate-400 font-normal italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-slate-50 text-slate-400 flex items-center justify-center rounded-full mx-auto mb-4 border border-slate-200">
              <BadgePercent size={28} />
            </div>
            <h4 className="text-base font-bold text-slate-700">No Commission Records</h4>
            <p className="text-sm text-slate-500 mt-1">
              You haven't earned any commissions yet. Commisisons are generated when you onboard new stores.
            </p>
          </div>
        )}
      </div>

      {/* Payment details quick reference */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="p-3 bg-blue-50 rounded-xl text-blue-600 shrink-0">
          <HelpCircle size={24} />
        </div>
        <div>
          <h4 className="font-bold text-slate-800 text-base mb-1">Commission Payment Policy</h4>
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Commissions are paid directly to your registered bank account or UPI ID. Invoices are cleared monthly by the finance department. Please make sure your Bank and UPI details in the **Profile** section are accurate.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EarningTab;
