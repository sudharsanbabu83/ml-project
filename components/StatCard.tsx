
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, highlight }) => {
  return (
    <div className={`p-6 rounded-2xl border transition-all duration-300 ${
      highlight 
        ? 'bg-slate-900 border-indigo-500/50 shadow-[0_0_30px_-15px_rgba(99,102,241,0.5)]' 
        : 'bg-slate-900/50 border-slate-800'
    }`}>
      <div className="flex items-center gap-3 mb-2">
        <div className="opacity-70">{icon}</div>
        <p className="text-[10px] uppercase tracking-widest font-black text-slate-500">{label}</p>
      </div>
      <p className={`text-3xl font-black font-mono ${highlight ? 'text-indigo-400' : 'text-slate-100'}`}>
        {value}
      </p>
    </div>
  );
};

export default StatCard;
