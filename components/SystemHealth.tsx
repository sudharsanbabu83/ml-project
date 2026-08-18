
import React from 'react';

interface SystemHealthProps {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: 'indigo' | 'fuchsia';
}

const SystemHealth: React.FC<SystemHealthProps> = ({ label, value, max, unit, color }) => {
  const percentage = (value / max) * 100;
  const stroke = color === 'indigo' ? '#6366f1' : '#d946ef';

  return (
    <div className="p-5 bg-slate-900/40 border border-slate-800/50 rounded-3xl backdrop-blur-md flex items-center gap-5">
      <div className="relative w-16 h-16 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90">
          <circle cx="32" cy="32" r="28" fill="transparent" stroke="#1e293b" strokeWidth="4" />
          <circle cx="32" cy="32" r="28" fill="transparent" stroke={stroke} strokeWidth="4" 
            strokeDasharray={175.9} strokeDashoffset={175.9 * (1 - percentage / 100)}
            strokeLinecap="round" className="transition-all duration-500" />
        </svg>
        <span className="absolute text-[10px] font-mono font-bold text-slate-400">{Math.round(percentage)}%</span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{label}</p>
        <p className="text-xl font-black font-mono tracking-tighter">
          {value.toFixed(1)} <span className="text-xs text-slate-600">{unit}</span>
        </p>
      </div>
    </div>
  );
};

export default SystemHealth;
