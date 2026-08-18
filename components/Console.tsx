
import React from 'react';
import { Terminal } from 'lucide-react';
import { LogEntry } from '../types';

interface ConsoleProps {
  logs: LogEntry[];
}

const Console: React.FC<ConsoleProps> = ({ logs }) => {
  return (
    <div className="bg-slate-950/80 border border-slate-800/50 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-xl h-full flex flex-col">
      <div className="bg-slate-900/50 px-5 py-3 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-emerald-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Kernel Trace Output</span>
        </div>
        <div className="flex gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
          <div className="w-2.5 h-2.5 rounded-full bg-slate-800" />
        </div>
      </div>
      <div className="h-48 xl:h-full overflow-y-auto p-5 font-mono text-[10px] flex flex-col-reverse gap-1.5 scrollbar-hide">
        {logs.length === 0 && <div className="text-slate-700 italic">Listening for system events...</div>}
        {logs.map((log) => (
          <div key={log.id} className="flex gap-4 animate-in slide-in-from-left-2 duration-300">
            <span className="text-slate-600 shrink-0 select-none">[{log.timestamp}]</span>
            <span className={
              log.type === 'success' ? 'text-emerald-400' : 
              log.type === 'warning' ? 'text-amber-400 font-bold' : 
              log.type === 'error' ? 'text-rose-500 font-black' :
              'text-slate-400'
            }>
              {log.message}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Console;
