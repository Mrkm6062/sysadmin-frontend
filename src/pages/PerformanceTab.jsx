import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Award, Target, TrendingUp, BarChart2, Star, CheckCircle } from 'lucide-react';

const PerformanceTab = () => {
  const { currentUser, myPerformanceDetails } = useOutletContext();
  const employee = currentUser?.employeeDetails || {};
  
  const perfSettings = myPerformanceDetails?.performanceSettings || {};
  const onboardedCount = myPerformanceDetails?.onboardedCount || 0;
  const targetOnboard = perfSettings.monthlyTarget || 10;
  const rating = perfSettings.performanceRating || 5.0;
  const keyPerformanceSettings = perfSettings.keyPerformanceSettings || "Acquire new merchants and onboard them onto the platform.";
  const commissionPercentage = perfSettings.commissionPercentage || 10;

  const targetCompletetionRate = Math.min(Math.round((onboardedCount / targetOnboard) * 100), 100);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
            <Target size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Monthly Target</h4>
            <p className="text-2xl font-extrabold text-slate-800">{targetOnboard} Stores</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl text-green-600">
            <CheckCircle size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Stores Onboarded</h4>
            <p className="text-2xl font-extrabold text-slate-800">{onboardedCount} Stores</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-amber-50 rounded-xl text-amber-500">
            <TrendingUp size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Completion</h4>
            <p className="text-2xl font-extrabold text-slate-800">{targetCompletetionRate}%</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
            <Award size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Performance Rating</h4>
            <p className="text-2xl font-extrabold text-slate-800 flex items-center gap-1">
              {rating.toFixed(1)} <Star size={18} className="fill-amber-400 text-amber-400 shrink-0 inline" />
            </p>
          </div>
        </div>
      </div>

      {/* Target Progress Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 md:p-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <BarChart2 className="text-blue-500" /> Onboarding Goal Progress
            </h3>
            <p className="text-xs text-slate-400 mt-1">Tracks stores created and set up on Galibrand Cloud this month.</p>
          </div>
          <span className="text-sm font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">{onboardedCount} / {targetOnboard} Stores</span>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden mb-2">
          <div 
            className="bg-blue-600 h-full rounded-full transition-all duration-500" 
            style={{ width: `${targetCompletetionRate}%` }}
          />
        </div>
        
        <div className="flex justify-between text-xs font-semibold text-slate-500 mt-2">
          <span>0 Stores</span>
          <span>Target: {targetOnboard} Stores</span>
        </div>
      </div>

      {/* Targets and Tasks Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Designation and Role Info */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Role & Responsibilities</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Designation</p>
              <p className="font-semibold text-slate-800">{employee.Designation || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Department</p>
              <p className="font-semibold text-slate-800">{employee.Department || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Active Commission Rule</p>
              <p className="font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-2 rounded-lg text-sm w-fit mt-1">
                {commissionPercentage}% One-time Onboarding Commission
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Main Goals & KPIs</p>
              <div className="text-sm text-slate-600 mt-2 whitespace-pre-line font-medium leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                {keyPerformanceSettings}
              </div>
            </div>
          </div>
        </div>

        {/* Assigned Metrics */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-base font-bold text-slate-800 mb-4 pb-2 border-b border-slate-100">Assigned Stores Summary</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm font-medium text-slate-600">Assigned Managed Stores</span>
              <span className="font-bold text-slate-800">{employee.assignedStores?.length || 0} Stores</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-50">
              <span className="text-sm font-medium text-slate-600">Onboarded Stores</span>
              <span className="font-bold text-slate-800">{onboardedCount} Stores</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-slate-600">Status</span>
              <span className="px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-bold rounded-full">Active Performer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTab;
