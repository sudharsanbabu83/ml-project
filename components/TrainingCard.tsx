
import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, AreaChart, Area } from 'recharts';
import { CheckCircle2, Activity } from 'lucide-react';
import { SimulationData, TrainingStatus } from '../types';

interface TrainingCardProps {
  title: string;
  description: string;
  data: SimulationData;
  color: 'indigo' | 'slate';
  icon: React.ReactNode;
  highlight?: boolean;
}

const TrainingCard: React.FC<TrainingCardProps> = ({ 
  title, description, data, color, icon, highlight
}) => {
  const isFinished = data.status === TrainingStatus.FINISHED;
  const accentColor = color === 'indigo' ? '#6366f1' : '#64748b';

  return (
    <div className={`relative overflow-hidden transition-all duration-700 rounded-3xl p-8 border ${
      highlight 
        ? 'bg-indigo-950/20 border-indigo-500/50 shadow-[0_0_80px_-20px_rgba(99,102,241,0.25)] scale-[1.01]' 
        : isFinished 
          ? 'bg-slate-900/60 border-slate-700/50 opacity-90' 
          : 'bg-slate-900/40 border-slate-800 shadow-xl'
    }`}>
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      {highlight && (
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-indigo-500 text-slate-950 text-[9px] font-black px-5 py-1 rounded-b-xl uppercase tracking-[0.2em] shadow-lg">
          Peak Performance
        </div>
      )}

      <div className="flex items-start justify-between mb-8 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${color === 'indigo' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-500/10 text-slate-500'}`}>
            {icon}
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">{title}</h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">{description}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <Activity className={`w-3 h-3 ${data.status === TrainingStatus.RUNNING ? 'animate-pulse text-indigo-400' : 'text-slate-600'}`} />
            <span className={`text-3xl font-black font-mono tracking-tighter ${color === 'indigo' ? 'text-indigo-400' : 'text-slate-400'}`}>
              {(data.totalTime / 1000).toFixed(2)}s
            </span>
          </div>
          <p className="text-[9px] uppercase tracking-widest font-black text-slate-600 mt-1">Elapsed Runtime</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-8 relative z-10">
        {[
          { label: 'Loss', value: data.snapshots.length > 0 ? data.snapshots[data.snapshots.length - 1].loss.toFixed(4) : '0.0000' },
          { label: 'Acc', value: data.snapshots.length > 0 ? (data.snapshots[data.snapshots.length - 1].accuracy * 100).toFixed(1) + '%' : '0.0%' },
          { label: 'Step', value: data.currentEpoch },
          { label: 'Task', value: Math.round(data.progress) + '%' }
        ].map(item => (
          <div key={item.label} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/50 group hover:border-indigo-500/30 transition-colors">
            <p className="text-[8px] uppercase tracking-widest font-black text-slate-600 mb-1">{item.label}</p>
            <p className="text-sm font-black font-mono tracking-tight text-slate-200">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-6 relative z-10">
        <div>
          <div className="flex justify-between items-end mb-3">
            <p className="text-[9px] uppercase tracking-widest font-black text-slate-500">Live Loss Decay</p>
            {isFinished && <span className="flex items-center gap-1.5 text-indigo-400 text-[9px] font-black tracking-widest"><CheckCircle2 className="w-3 h-3" /> VALIDATED</span>}
          </div>
          <div className="h-40 w-full bg-slate-950/80 rounded-2xl p-4 border border-slate-800/50 overflow-hidden">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.snapshots}>
                <defs>
                  <linearGradient id={`colorLoss-${color}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={accentColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.3} />
                <XAxis dataKey="epoch" hide />
                <YAxis hide domain={[0, 1]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                  labelStyle={{ display: 'none' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="loss" 
                  stroke={accentColor} 
                  fillOpacity={1} 
                  fill={`url(#colorLoss-${color})`} 
                  strokeWidth={3}
                  isAnimationActive={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#10b981" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative pt-2">
          <div className="h-1.5 w-full bg-slate-950 rounded-full border border-slate-800 overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ease-out ${color === 'indigo' ? 'bg-indigo-500' : 'bg-slate-500'}`}
              style={{ width: `${data.progress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingCard;
