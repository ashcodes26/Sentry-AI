/**
 * Multi-Asset Predictive Maintenance Types
 * Supports Turbofans, Power Transformers, Industrial Pumps, and Wind Gearboxes.
 */

export type MachineType =
  | 'turbofan'
  | 'transformer'
  | 'pump'
  | 'gearbox'
  | 'generator';

export interface SensorDefinition {
  key: string;
  name: string;
  unit: string;
  baseline: number;
  description: string;
}

export interface TelemetryPoint {
  cycle: number;
  // Generic numeric channels mapped dynamically per machine type
  val1: number;
  val2: number;
  val3: number;
  val4: number;
  val5: number;
  val6: number;
  // Specific turbofan mappings for compatibility
  T24: number;
  T50: number;
  P30: number;
  Nf: number;
  Ps30: number;
  Vibration: number;
  RUL_actual: number;
  RUL_clipped: number;
  RUL_pred: number;
  health_index_mse: number;
  is_healthy: boolean;
  is_anomaly: boolean;
}

export type EngineStatus =
  | 'HEALTHY'
  | 'DRIFT DETECTED'
  | 'SCHEDULE MAINTENANCE'
  | 'CRITICAL IMMINENT FAILURE';

export interface MachineAsset {
  id: string;
  name: string;
  type: MachineType;
  category: string;
  location: string;
  criticality: 'Critical' | 'High' | 'Medium';
  timeUnit: 'Cycles' | 'Hours' | 'Days';
  maxLife: number;
  kneePoint: number;
  threshold3Sigma: number;
  unplannedCost: number;
  scheduledCost: number;
  sensors: SensorDefinition[];
  data: TelemetryPoint[];
}

export interface FinancialImpact {
  status: EngineStatus;
  statusColor: string;
  avoidedLoss: number;
  unitsPreserved: number;
  unplannedCost: number;
  scheduledCost: number;
  netSavings: number;
  roiPercent: number;
}

export interface WorkOrder {
  id: string;
  assetId: string;
  assetName: string;
  cycle: number;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  title: string;
  status: 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED';
  technician: string;
  actionRequired: string;
  partsReplaced?: string;
  createdAt: number;
  resolvedAt?: number;
}

