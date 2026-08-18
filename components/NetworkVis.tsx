
import React, { useMemo, useEffect, useState } from 'react';
import { DatasetSize } from '../types';

interface NetworkVisProps {
  isRunning: boolean;
  isOptimized: boolean;
  datasetSize: DatasetSize;
}

const NetworkVis: React.FC<NetworkVisProps> = ({ isRunning, isOptimized, datasetSize }) => {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => setFrame(f => (f + 1) % 200), 40);
    return () => clearInterval(interval);
  }, [isRunning]);

  // Scale complexity based on dataset size
  const densityMultiplier = useMemo(() => {
    if (datasetSize === DatasetSize.SMALL) return 1;
    if (datasetSize === DatasetSize.MEDIUM) return 2.5;
    return 5;
  }, [datasetSize]);

  const layers = [4, 6, 8, 6, 4];
  
  const nodes = useMemo(() => {
    return layers.flatMap((count, layerIdx) => 
      Array.from({ length: count }).map((_, nodeIdx) => ({
        id: `${layerIdx}-${nodeIdx}`,
        x: 80 + layerIdx * 85, // Shifted right for ingress space
        y: 40 + nodeIdx * 40 + (8 - count) * 20,
        layer: layerIdx,
        nodeIdx
      }))
    );
  }, []);

  const links = useMemo(() => {
    const result = [];
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].layer === nodes[i].layer + 1) {
          result.push({ 
            id: `link-${nodes[i].id}-${nodes[j].id}`,
            source: nodes[i], 
            target: nodes[j] 
          });
        }
      }
    }
    return result;
  }, [nodes]);

  // Forward paths for activations
  const forwardPaths = useMemo(() => {
    const count = Math.floor((isOptimized ? 15 : 8) * densityMultiplier);
    return Array.from({ length: count }).map(() => {
      const path = [];
      let currentLayer = 0;
      let currentNode = nodes.filter(n => n.layer === 0)[Math.floor(Math.random() * layers[0])];
      path.push(currentNode);
      while (currentLayer < layers.length - 1) {
        currentLayer++;
        const nextNodes = nodes.filter(n => n.layer === currentLayer);
        currentNode = nextNodes[Math.floor(Math.random() * nextNodes.length)];
        path.push(currentNode);
      }
      return path.map(p => `${p.x},${p.y}`).join(' L ');
    });
  }, [isOptimized, layers, nodes, densityMultiplier]);

  // Backward paths for gradients (Backprop)
  const backwardPaths = useMemo(() => {
    const count = Math.floor((isOptimized ? 10 : 5) * densityMultiplier);
    return Array.from({ length: count }).map(() => {
      const path = [];
      let currentLayer = layers.length - 1;
      let currentNode = nodes.filter(n => n.layer === currentLayer)[Math.floor(Math.random() * layers[currentLayer])];
      path.push(currentNode);
      while (currentLayer > 0) {
        currentLayer--;
        const prevNodes = nodes.filter(n => n.layer === currentLayer);
        currentNode = prevNodes[Math.floor(Math.random() * prevNodes.length)];
        path.push(currentNode);
      }
      return path.map(p => `${p.x},${p.y}`).join(' L ');
    });
  }, [isOptimized, layers, nodes, densityMultiplier]);

  const primaryColor = isOptimized ? '#818cf8' : '#64748b';
  const backpropColor = isOptimized ? '#f59e0b' : '#94a3b8';
  const glowId = "synapseGlow";

  const isForwardPhase = frame < 100;

  return (
    <div className="bg-slate-900/40 border border-slate-800/50 rounded-3xl p-6 backdrop-blur-md h-full min-h-[450px] flex flex-col group overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[radial-gradient(circle_at_center,_#4f46e5_0%,_transparent_70%)]" />
      
      <div className="flex justify-between items-center mb-6 relative z-10">
        <div className="space-y-1">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isRunning ? (isForwardPhase ? 'bg-indigo-500' : 'bg-amber-500') : 'bg-slate-700'}`} />
            {datasetSize} Workflow
          </h3>
          <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tight">
            Flow Density: {densityMultiplier.toFixed(1)}x | {isForwardPhase ? 'Inference Mode' : 'Learning Mode'}
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right">
             <p className="text-[8px] font-black text-slate-500 uppercase">Throughput</p>
             <p className="text-xs font-mono font-bold text-indigo-400">
               {isRunning ? (isOptimized ? (2500 * densityMultiplier).toLocaleString() : (800 * densityMultiplier).toLocaleString()) : '0'} <span className="text-[8px] opacity-50">SPS</span>
             </p>
           </div>
        </div>
      </div>
      
      <div className="flex-1 relative bg-slate-950/40 rounded-2xl border border-slate-800/30 overflow-hidden">
        {/* Ingress Data Flow */}
        {isRunning && isForwardPhase && (
           <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col justify-center gap-4 px-4 overflow-hidden pointer-events-none">
             {Array.from({length: Math.floor(densityMultiplier * 3)}).map((_, i) => (
               <div key={i} className="w-1.5 h-6 bg-indigo-500/20 rounded-full animate-[ingress_1s_linear_infinite]" style={{ animationDelay: `${i * 0.2}s` }} />
             ))}
           </div>
        )}

        <svg viewBox="0 0 500 350" className="w-full h-full p-4">
          <defs>
            <filter id={glowId} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Ingress Connector */}
          <path d="M 20 175 L 80 175" stroke="#1e293b" strokeWidth="2" strokeDasharray="4 4" />

          {/* Static Links */}
          {links.map((link) => (
            <line 
              key={link.id} 
              x1={link.source.x} y1={link.source.y} 
              x2={link.target.x} y2={link.target.y}
              stroke="#1e293b"
              strokeWidth="0.5"
            />
          ))}
          
          {/* Forward Activation Pulses */}
          {isRunning && isForwardPhase && forwardPaths.map((path, i) => (
            <circle key={`fw-${i}`} r="1.5" fill={primaryColor} filter={`url(#${glowId})`}>
              <animateMotion 
                dur={`${(Math.random() * 0.4 + 0.3) / (isOptimized ? 2.5 : 1)}s`} 
                repeatCount="indefinite"
                path={`M ${path}`}
                begin={`${Math.random()}s`}
              />
            </circle>
          ))}

          {/* Backward Gradient Pulses */}
          {isRunning && !isForwardPhase && backwardPaths.map((path, i) => (
            <circle key={`bw-${i}`} r="1.5" fill={backpropColor} filter={`url(#${glowId})`}>
              <animateMotion 
                dur={`${(Math.random() * 0.4 + 0.3) / (isOptimized ? 2.5 : 1)}s`} 
                repeatCount="indefinite"
                path={`M ${path}`}
                begin={`${Math.random()}s`}
              />
            </circle>
          ))}

          {/* Nodes */}
          {nodes.map(node => {
            const isActive = isRunning && (
              (isForwardPhase && Math.floor(frame / 20) === node.layer) ||
              (!isForwardPhase && Math.floor((200-frame) / 20) === (4-node.layer))
            );
            return (
              <g key={node.id}>
                <circle 
                  cx={node.x} cy={node.y} r={isActive ? 4.5 : 2.5}
                  fill={isActive ? (isForwardPhase ? primaryColor : backpropColor) : '#1e293b'}
                  className="transition-all duration-300"
                  filter={isActive ? `url(#${glowId})` : ''}
                />
              </g>
            );
          })}
        </svg>

        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end pointer-events-none">
          <div className="flex gap-1">
             <span className="text-[7px] font-black text-slate-700 uppercase tracking-tighter self-center mr-2">Batch Engine</span>
            {Array.from({length: 12}).map((_, i) => (
              <div key={i} className={`h-3 w-1 rounded-full transition-all duration-300 ${isRunning && (Math.floor(frame/8) % 12 === i) ? 'bg-indigo-500 h-5' : 'bg-slate-800'}`} />
            ))}
          </div>
          <div className="text-right">
             <p className="text-[8px] font-black text-slate-500 uppercase">GPU Load</p>
             <p className="text-xs font-mono font-bold text-slate-300">{isRunning ? (isOptimized ? '92%' : '100%') : '2%'}</p>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes ingress {
          from { transform: translateX(-50px); opacity: 0; }
          50% { opacity: 0.5; }
          to { transform: translateX(50px); opacity: 0; }
        }
      `}} />
    </div>
  );
};

export default NetworkVis;
