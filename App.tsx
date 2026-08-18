
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Play, RotateCcw, Zap, Timer, Layers, Cpu, CheckCircle2,
  TrendingUp, Settings2, Sparkles, BrainCircuit,
  Activity, ShieldCheck, Globe, FlaskConical, MousePointer2,
  Database, DatabaseBackup, ServerCrash
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { DatasetSize, TrainingStatus, SimulationData, HardwareSpec, LogEntry, RunHistory } from './types';
import { CONFIG, OPTIMIZATIONS, HARDWARE, INITIAL_LOSS, FINAL_ACC_TARGET, INITIAL_ACC, EnhancedStrategy } from './constants';
import TrainingCard from './components/TrainingCard';
import StatCard from './components/StatCard';
import Console from './components/Console';
import NetworkVis from './components/NetworkVis';
import SystemHealth from './components/SystemHealth';

const App: React.FC = () => {
  const [datasetSize, setDatasetSize] = useState<DatasetSize>(DatasetSize.SMALL);
  const [hardware, setHardware] = useState<HardwareSpec>(HARDWARE[0]);
  const [strategies, setStrategies] = useState<EnhancedStrategy[]>(OPTIMIZATIONS);
  const [status, setStatus] = useState<TrainingStatus>(TrainingStatus.IDLE);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(2);
  const [learningRate, setLearningRate] = useState(0.001);
  const [history, setHistory] = useState<RunHistory[]>([]);
  
  const [baseline, setBaseline] = useState<SimulationData>({
    snapshots: [], totalTime: 0, status: TrainingStatus.IDLE, currentEpoch: 0, progress: 0, memoryUsage: 0, powerUsage: 0
  });

  const [optimized, setOptimized] = useState<SimulationData>({
    snapshots: [], totalTime: 0, status: TrainingStatus.IDLE, currentEpoch: 0, progress: 0, memoryUsage: 0, powerUsage: 0
  });

  const config = useMemo(() => CONFIG[datasetSize], [datasetSize]);
  
  const optimizedMultiplier = useMemo(() => {
    return strategies.filter(s => s.active).reduce((acc, s) => acc * (1 - s.reduction), 1);
  }, [strategies]);

  const toggleStrategy = (id: string) => {
    if (status === TrainingStatus.RUNNING) return;
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit' }),
      message, type
    }, ...prev].slice(0, 30));
  }, []);

  const reset = useCallback(() => {
    setStatus(TrainingStatus.IDLE);
    const initial = (mem: number): SimulationData => ({ 
      snapshots: [], totalTime: 0, status: TrainingStatus.IDLE, currentEpoch: 0, progress: 0, 
      memoryUsage: mem, powerUsage: 0 
    });
    setBaseline(initial(hardware.maxMemory * 0.4));
    setOptimized(initial(hardware.maxMemory * 0.25));
    setLogs([]);
    setAiInsight(null);
    addLog("Core initialized. Hardware handshakes complete.", "info");
  }, [hardware, addLog]);

  const startTraining = useCallback(() => {
    reset();
    setStatus(TrainingStatus.RUNNING);
    setBaseline(prev => ({ ...prev, status: TrainingStatus.RUNNING }));
    setOptimized(prev => ({ ...prev, status: TrainingStatus.RUNNING }));
    addLog(`Deploying ${datasetSize} to ${hardware.name} cluster...`, "info");
    addLog(`Active Kernels: ${strategies.filter(s=>s.active).map(s=>s.name).join(', ')}`, "success");
  }, [reset, hardware, datasetSize, addLog, strategies]);

  const generateNextMetrics = (epoch: number, totalEpochs: number, currentLR: number, isOptimized: boolean) => {
    const progress = epoch / totalEpochs;
    const lrFactor = currentLR > 0.05 ? (currentLR * 10) : 1;
    const instability = (currentLR > 0.05 && !isOptimized) ? (Math.random() * 0.2) : 0;
    
    const noise = (Math.random() - 0.5) * 0.02 * lrFactor;
    const loss = INITIAL_LOSS * Math.exp(-progress * 4) + noise + instability;
    const accuracy = INITIAL_ACC + (FINAL_ACC_TARGET - INITIAL_ACC) * (1 - Math.exp(-progress * 6)) - instability;
    
    return { 
      loss: Math.max(0.005, loss), 
      accuracy: Math.min(0.999, Math.max(0.01, accuracy)),
      power: (hardware.maxPower * (0.6 + Math.random() * 0.4)) * (isOptimized ? 0.65 : 1),
      memory: (hardware.maxMemory * (0.3 + Math.random() * 0.1)) * (isOptimized ? 0.55 : 1)
    };
  };

  useEffect(() => {
    if (status !== TrainingStatus.RUNNING || baseline.status !== TrainingStatus.RUNNING) return;
    const stepTime = (config.baselineStepMs * hardware.multiplier) / playbackSpeed;
    const interval = setInterval(() => {
      setBaseline(prev => {
        const nextEpoch = prev.currentEpoch + 1;
        const metrics = generateNextMetrics(nextEpoch, config.totalEpochs, learningRate, false);
        const snapshot = { epoch: nextEpoch, ...metrics, timestamp: prev.totalTime + stepTime, learningRate };
        
        if (nextEpoch >= config.totalEpochs) {
          addLog("Baseline sequence termination reached.", "success");
          return { ...prev, currentEpoch: config.totalEpochs, progress: 100, status: TrainingStatus.FINISHED, snapshots: [...prev.snapshots, snapshot], totalTime: prev.totalTime + stepTime };
        }
        return { ...prev, currentEpoch: nextEpoch, progress: (nextEpoch / config.totalEpochs) * 100, snapshots: [...prev.snapshots, snapshot], totalTime: prev.totalTime + (config.baselineStepMs * hardware.multiplier), memoryUsage: metrics.memory, powerUsage: metrics.power };
      });
    }, stepTime);
    return () => clearInterval(interval);
  }, [status, baseline.status, config, hardware, playbackSpeed, learningRate, addLog]);

  useEffect(() => {
    if (status !== TrainingStatus.RUNNING || optimized.status !== TrainingStatus.RUNNING) return;
    const stepTime = (config.baselineStepMs * hardware.multiplier * optimizedMultiplier) / playbackSpeed;
    const interval = setInterval(() => {
      setOptimized(prev => {
        const nextEpoch = prev.currentEpoch + 1;
        const metrics = generateNextMetrics(nextEpoch, config.totalEpochs, learningRate, true);
        const snapshot = { epoch: nextEpoch, ...metrics, timestamp: prev.totalTime + stepTime, learningRate };
        
        if (nextEpoch >= config.totalEpochs) {
          addLog("Optimized sequence termination reached.", "success");
          return { ...prev, currentEpoch: config.totalEpochs, progress: 100, status: TrainingStatus.FINISHED, snapshots: [...prev.snapshots, snapshot], totalTime: prev.totalTime + stepTime };
        }
        return { ...prev, currentEpoch: nextEpoch, progress: (nextEpoch / config.totalEpochs) * 100, snapshots: [...prev.snapshots, snapshot], totalTime: prev.totalTime + (config.baselineStepMs * hardware.multiplier * optimizedMultiplier), memoryUsage: metrics.memory, powerUsage: metrics.power };
      });
    }, stepTime);
    return () => clearInterval(interval);
  }, [status, optimized.status, config, hardware, optimizedMultiplier, playbackSpeed, learningRate, addLog]);

  useEffect(() => {
    if (baseline.status === TrainingStatus.FINISHED && optimized.status === TrainingStatus.FINISHED) {
      setStatus(TrainingStatus.FINISHED);
      const stats = getStats();
      if (stats) {
        setHistory(prev => [{
          id: Date.now().toString(),
          hardware: hardware.name,
          time: stats.optimizedTime + 's',
          speedup: stats.speedup + 'x',
          timestamp: Date.now()
        }, ...prev].slice(0, 5));
      }
      generateAIInsight();
    }
  }, [baseline.status, optimized.status, hardware]);

  const generateAIInsight = async () => {
    setIsAiLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stats = getStats();
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Benchmark Report: ${hardware.name}. Speedup: ${stats?.speedup}x. Strategies: ${strategies.filter(s => s.active).map(s => s.name).join(', ')}. Efficiency Gain: ${stats?.timeSaved}%. Power: ~40% reduction. Carbon saved: 12kg. Write a punchy, developer-focused summary of why these optimizations won.`
      });
      setAiInsight(response.text);
    } catch {
      setAiInsight("Optimized runtime demonstrates significant reduction in tail latency and memory fragmentation. Throughput gains of "+ (baseline.totalTime/optimized.totalTime).toFixed(1) + "x verified.");
    } finally { setIsAiLoading(false); }
  };

  const getStats = () => {
    if (optimized.totalTime === 0 || baseline.totalTime === 0) return null;
    const timeSaved = ((baseline.totalTime - optimized.totalTime) / baseline.totalTime) * 100;
    const speedup = baseline.totalTime / optimized.totalTime;
    return {
      timeSaved: Math.round(timeSaved),
      speedup: Number(speedup.toFixed(2)),
      baselineTime: (baseline.totalTime / 1000).toFixed(1),
      optimizedTime: (optimized.totalTime / 1000).toFixed(1),
      costSaved: (((baseline.totalTime - optimized.totalTime) / 3600000) * hardware.hourlyRate).toFixed(3),
      carbonSaved: ((baseline.totalTime - optimized.totalTime) / 1000 * 0.005).toFixed(2) // Mock carbon
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 p-4 lg:p-6 font-sans overflow-x-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-600/20 blur-[150px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-fuchsia-600/20 blur-[150px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-[1700px] mx-auto relative z-10 space-y-6">
        {/* Modern Nav */}
        <header className="flex flex-col lg:flex-row items-center justify-between gap-6 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/50 backdrop-blur-2xl shadow-2xl">
          <div className="flex items-center gap-5">
            <div className="relative group">
              <div className="absolute inset-0 bg-indigo-600 blur-xl opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-4 bg-indigo-600 rounded-2xl">
                <BrainCircuit className="w-8 h-8 text-white" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-black tracking-tighter text-white">NEURALFAST</h1>
                <span className="px-2 py-0.5 bg-indigo-500 text-white text-[10px] font-black rounded-md">V2.0</span>
              </div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em] flex items-center gap-2">
                <Activity className="w-3 h-3 text-indigo-400" /> GPU CLUSTER: {hardware.id.toUpperCase()} // STATUS: ACTIVE
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6">
            <div className="h-10 w-[1px] bg-slate-800 hidden xl:block" />
            <div className="flex items-center gap-4">
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Multiplier</p>
                  <p className="text-xs font-mono font-bold text-indigo-400">{(1/optimizedMultiplier).toFixed(2)}x Speed</p>
               </div>
               <div className="h-10 w-[1px] bg-slate-800" />
               <div className="text-right">
                  <p className="text-[10px] font-black text-slate-500 uppercase">Cost Burn</p>
                  <p className="text-xs font-mono font-bold text-fuchsia-400">${hardware.hourlyRate}/h</p>
               </div>
            </div>

            <button 
              onClick={status === TrainingStatus.IDLE ? startTraining : reset}
              className={`group relative flex items-center gap-3 px-10 py-4 rounded-2xl font-black tracking-widest transition-all overflow-hidden ${
                status === TrainingStatus.IDLE 
                  ? 'bg-white text-slate-950 hover:scale-105 active:scale-95' 
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              {status === TrainingStatus.IDLE ? <><Play className="w-5 h-5 fill-current" /> EXECUTE RUN</> : <><RotateCcw className="w-5 h-5" /> SYSTEM RESET</>}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Panel: Configuration Workbench */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="p-6 bg-slate-900/40 border border-slate-800/50 rounded-3xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Settings2 className="w-4 h-4 text-indigo-400" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workbench</h3>
                </div>
                {status === TrainingStatus.RUNNING && <span className="animate-pulse text-[8px] font-bold text-indigo-400">LOCKED</span>}
              </div>
              
              <div className="space-y-4">
                {/* Dataset Size Showcase Selector */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dataset Profile</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: DatasetSize.SMALL, icon: <Database className="w-3 h-3" />, desc: "Fast dev cycle, high noise" },
                      { id: DatasetSize.MEDIUM, icon: <DatabaseBackup className="w-3 h-3" />, desc: "Balanced production load" },
                      { id: DatasetSize.LARGE, icon: <ServerCrash className="w-3 h-3" />, desc: "HPC scale, massive I/O" }
                    ].map(d => (
                      <button 
                        key={d.id} 
                        onClick={() => setDatasetSize(d.id)} 
                        disabled={status === TrainingStatus.RUNNING}
                        className={`flex flex-col gap-1 p-3 rounded-xl border transition-all text-left group ${
                          datasetSize === d.id ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-100' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black">{d.id}</span>
                          <span className={datasetSize === d.id ? 'text-indigo-400' : 'text-slate-700'}>{d.icon}</span>
                        </div>
                        <p className="text-[8px] font-medium text-slate-600 group-hover:text-slate-400">{d.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-4 border-t border-slate-800/50">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Hardware Instance</label>
                  <div className="grid grid-cols-1 gap-2">
                    {HARDWARE.map(h => (
                      <button 
                        key={h.id} 
                        onClick={() => setHardware(h)} 
                        disabled={status === TrainingStatus.RUNNING}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          hardware.id === h.id ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-100' : 'bg-slate-950/50 border-slate-800 text-slate-500 hover:border-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-black">{h.name}</span>
                        <Cpu className={`w-3 h-3 ${hardware.id === h.id ? 'text-indigo-400' : 'text-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800/50">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Optimizations</label>
                  <div className="space-y-2">
                    {strategies.map(s => (
                      <button 
                        key={s.id} 
                        onClick={() => toggleStrategy(s.id)}
                        disabled={status === TrainingStatus.RUNNING}
                        className={`w-full text-left p-3 rounded-xl border transition-all group ${
                          s.active ? 'bg-emerald-500/10 border-emerald-500/50' : 'bg-slate-950/50 border-slate-800'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black ${s.active ? 'text-emerald-400' : 'text-slate-500'}`}>{s.name}</span>
                          <div className={`w-2 h-2 rounded-full ${s.active ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                        </div>
                        <p className="text-[8px] text-slate-600 font-medium leading-tight group-hover:text-slate-400 transition-colors">{s.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <SystemHealth label="Sustained Power" value={baseline.powerUsage} max={hardware.maxPower} unit="W" color="indigo" />
            <SystemHealth label="VRAM Allocated" value={baseline.memoryUsage} max={hardware.maxMemory} unit="GB" color="fuchsia" />
          </aside>

          {/* Main Dashboard Area */}
          <div className="lg:col-span-9 space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <TrainingCard title="Standard Baseline" description="FP32 Execution Path" data={baseline} color="slate" icon={<FlaskConical className="w-5 h-5" />} />
              <TrainingCard title="NeuralFast Engine" description="Vectorized Optimized Graph" data={optimized} color="indigo" icon={<Zap className="w-5 h-5" />} highlight={optimized.status === TrainingStatus.FINISHED && baseline.status !== TrainingStatus.FINISHED} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
              <div className="xl:col-span-8">
                <NetworkVis 
                  isRunning={status === TrainingStatus.RUNNING} 
                  isOptimized={optimized.status === TrainingStatus.RUNNING} 
                  datasetSize={datasetSize}
                />
              </div>
              <div className="xl:col-span-4 flex flex-col gap-6">
                <Console logs={logs} />
                {stats && (
                  <div className="p-6 bg-indigo-600/10 border border-indigo-500/30 rounded-3xl backdrop-blur-md">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                       <ShieldCheck className="w-3 h-3" /> ROI Benchmark
                    </p>
                    <div className="space-y-3">
                       <div className="flex justify-between">
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Efficiency Delta</span>
                         <span className="text-xl font-black font-mono text-indigo-100">+{stats.speedup}x</span>
                       </div>
                       <div className="flex justify-between">
                         <span className="text-[10px] font-bold text-slate-500 uppercase">Cloud Savings</span>
                         <span className="text-xl font-black font-mono text-emerald-400">${stats.costSaved}</span>
                       </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* AI Reasoning Section */}
            {(aiInsight || isAiLoading) && (
              <section className="p-8 bg-gradient-to-br from-indigo-900/20 to-slate-900/40 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-1000">
                  <BrainCircuit className="w-80 h-80 text-white" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-indigo-500 rounded-xl shadow-lg shadow-indigo-500/30 ring-4 ring-indigo-500/10">
                     <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-2xl tracking-tight text-white">Advanced Topology Analysis</h3>
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Model: Gemini 3 Pro Inference Engine</p>
                  </div>
                </div>
                {isAiLoading ? (
                  <div className="space-y-4">
                    <div className="h-4 bg-indigo-500/10 rounded-full w-[80%] animate-pulse" />
                    <div className="h-4 bg-indigo-500/10 rounded-full w-[60%] animate-pulse" />
                    <div className="h-4 bg-indigo-500/10 rounded-full w-[90%] animate-pulse" />
                  </div>
                ) : (
                  <div className="relative">
                    <p className="text-indigo-100/90 leading-relaxed text-xl font-medium italic border-l-4 border-indigo-500 pl-6 py-2">
                      "{aiInsight}"
                    </p>
                    <div className="mt-6 flex gap-4">
                       <span className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/50 border border-slate-800 rounded-lg text-[10px] font-black text-slate-500 uppercase">
                          <MousePointer2 className="w-3 h-3" /> Technical Review
                       </span>
                    </div>
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
