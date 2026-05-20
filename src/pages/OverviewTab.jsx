import React from 'react';
import { useOutletContext } from 'react-router-dom';

const OverviewTab = () => {
  const { users, stores } = useOutletContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Platform Users</h3>
        <p className="text-5xl font-extrabold text-blue-600">{users.length}</p>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Active Stores</h3>
        <p className="text-5xl font-extrabold text-green-600">{stores.length}</p>
      </div>
    </div>
  );
};

export default OverviewTab;