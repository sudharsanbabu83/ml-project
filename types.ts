
export enum DatasetSize {
  SMALL = 'Small (1k images)',
  MEDIUM = 'Medium (10k images)',
  LARGE = 'Large (100k images)'
}

export enum TrainingStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  FINISHED = 'FINISHED'
}

export interface TrainingSnapshot {
  epoch: number;
  loss: number;
  accuracy: number;
  timestamp: number;
  learningRate: number;
}

export interface SimulationData {
  snapshots: TrainingSnapshot[];
  totalTime: number;
  status: TrainingStatus;
  currentEpoch: number;
  progress: number;
  memoryUsage: number;
  powerUsage: number;
}

export interface OptimizationStrategy {
  id: string;
  name: string;
  reduction: number; 
  active: boolean;
}

export interface HardwareSpec {
  id: string;
  name: string;
  multiplier: number; 
  hourlyRate: number;
  maxPower: number; // Watts
  maxMemory: number; // GB
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export interface RunHistory {
  id: string;
  hardware: string;
  time: string;
  speedup: string;
  timestamp: number;
}
