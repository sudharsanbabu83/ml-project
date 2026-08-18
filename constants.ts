
import { DatasetSize, OptimizationStrategy, HardwareSpec } from './types';

export const CONFIG = {
  [DatasetSize.SMALL]: { totalEpochs: 25, baselineStepMs: 600 },
  [DatasetSize.MEDIUM]: { totalEpochs: 60, baselineStepMs: 1000 },
  [DatasetSize.LARGE]: { totalEpochs: 150, baselineStepMs: 1500 }
};

export interface EnhancedStrategy extends OptimizationStrategy {
  memoryImpact: number;
  powerImpact: number;
  description: string;
}

export const OPTIMIZATIONS: EnhancedStrategy[] = [
  { 
    id: 'amp', 
    name: 'Mixed Precision', 
    reduction: 0.35, 
    memoryImpact: 0.5, 
    powerImpact: 0.2, 
    active: true,
    description: "Uses FP16 arithmetic to accelerate compute while reducing VRAM pressure."
  },
  { 
    id: 'fusion', 
    name: 'Kernel Fusion', 
    reduction: 0.15, 
    memoryImpact: 0.1, 
    powerImpact: 0.05, 
    active: false,
    description: "Combines multiple GPU operations into a single kernel launch."
  },
  { 
    id: 'xla', 
    name: 'XLA JIT', 
    reduction: 0.20, 
    memoryImpact: 0.05, 
    powerImpact: 0.1, 
    active: true,
    description: "Accelerated Linear Algebra compiler for optimizing whole-graph execution."
  },
  { 
    id: 'dist', 
    name: 'Sharded Parallel', 
    reduction: 0.25, 
    memoryImpact: 0.4, 
    powerImpact: 0.3, 
    active: false,
    description: "Distributes model weights across multiple nodes for large-scale training."
  }
];

export const HARDWARE: HardwareSpec[] = [
  { id: 't4', name: 'NVIDIA T4', multiplier: 1.0, hourlyRate: 0.35, maxPower: 70, maxMemory: 16 },
  { id: 'a100', name: 'NVIDIA A100', multiplier: 0.4, hourlyRate: 3.67, maxPower: 400, maxMemory: 80 },
  { id: 'h100', name: 'NVIDIA H100', multiplier: 0.15, hourlyRate: 12.50, maxPower: 700, maxMemory: 188 }
];

export const INITIAL_LOSS = 0.95;
export const FINAL_ACC_TARGET = 0.98;
export const INITIAL_ACC = 0.12;
