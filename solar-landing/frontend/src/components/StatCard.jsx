import React from 'react';
import { TrendingUp } from 'lucide-react';

const StatCard = ({ title, value, trend, trendUp, icon, bg }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${bg}`}>
        {icon}
      </div>
      <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        <TrendingUp size={12} className={!trendUp ? "rotate-180" : ""} />
        <span>{trend}</span>
      </div>
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
      <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</h3>
    </div>
  </div>
);

export default StatCard;
