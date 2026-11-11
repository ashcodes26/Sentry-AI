import { EngineStatus, FinancialImpact, MachineAsset, MachineType, SensorDefinition, TelemetryPoint } from '../types/telemetry';

function gaussianRandom(mean = 0, stdev = 1) {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export const MACHINE_TYPE_TEMPLATES: Record<
  MachineType,
  {
    category: string;
    timeUnit: 'Cycles' | 'Hours' | 'Days';
    unplannedCost: number;
    scheduledCost: number;
    sensors: SensorDefinition[];
    defaultLifespan: number;
  }
> = {
  turbofan: {
    category: 'Commercial Aviation',
    timeUnit: 'Cycles',
    unplannedCost: 180000,
    scheduledCost: 12000,
    defaultLifespan: 192,
    sensors: [
      { key: 'val1', name: 'T24 (LPC Temp)', unit: '°R', baseline: 642.0, description: 'Low-pressure compressor outlet temperature' },
      { key: 'val2', name: 'T50 (HPT Temp)', unit: '°R', baseline: 1585.0, description: 'High-pressure turbine exhaust gas temperature' },
      { key: 'val3', name: 'P30 (HPC Pressure)', unit: 'psia', baseline: 553.5, description: 'Total pressure at high-pressure compressor discharge' },
      { key: 'val4', name: 'Nf (Fan Speed)', unit: 'rpm', baseline: 2388.0, description: 'Physical low-pressure spool angular velocity' },
      { key: 'val5', name: 'Ps30 (Static Press)', unit: 'psia', baseline: 47.45, description: 'Static pressure before combustion chamber' },
      { key: 'val6', name: 'Vibration RMS', unit: 'mm/s', baseline: 0.38, description: 'High-frequency rotor casing vibration amplitude' },
    ],
  },
  transformer: {
    category: 'Power Grid Infrastructure',
    timeUnit: 'Days',
    unplannedCost: 450000,
    scheduledCost: 22000,
    defaultLifespan: 210,
    sensors: [
      { key: 'val1', name: 'Top-Oil Temperature', unit: '°C', baseline: 58.0, description: 'Insulating oil temperature at tank top' },
      { key: 'val2', name: 'Dissolved H2 Gas', unit: 'ppm', baseline: 14.0, description: 'Dissolved hydrogen indicating thermal micro-arcing' },
      { key: 'val3', name: 'Moisture in Oil', unit: 'ppm', baseline: 11.5, description: 'Cellulose insulation moisture concentration' },
      { key: 'val4', name: 'Dielectric Strength', unit: 'kV', baseline: 68.0, description: 'Oil breakdown voltage resistance' },
      { key: 'val5', name: 'Core Acoustic Noise', unit: 'dB', baseline: 46.0, description: 'Magnetostriction acoustic vibration level' },
      { key: 'val6', name: 'Bushing Power Factor', unit: '%', baseline: 0.35, description: 'Capacitive dielectric dissipation factor' },
    ],
  },
  pump: {
    category: 'Petrochemical & Slurry',
    timeUnit: 'Hours',
    unplannedCost: 85000,
    scheduledCost: 6500,
    defaultLifespan: 180,
    sensors: [
      { key: 'val1', name: 'Inboard Bearing Temp', unit: '°C', baseline: 52.0, description: 'Drive-end journal bearing operating heat' },
      { key: 'val2', name: 'Discharge Flow', unit: 'm³/h', baseline: 345.0, description: 'Volumetric liquid throughput discharge' },
      { key: 'val3', name: 'Suction Pressure', unit: 'bar', baseline: 3.8, description: 'Inlet pressure margin preventing cavitation' },
      { key: 'val4', name: 'Motor Current Draw', unit: 'A', baseline: 138.0, description: 'Induction drive electrical load demand' },
      { key: 'val5', name: 'Seal Flush Pressure', unit: 'bar', baseline: 6.2, description: 'Barrier fluid pressure across mechanical seal' },
      { key: 'val6', name: 'Casing Vibration RMS', unit: 'mm/s', baseline: 1.65, description: 'Impeller hydraulic imbalance & cavitation shake' },
    ],
  },
  gearbox: {
    category: 'Renewable Wind Energy',
    timeUnit: 'Days',
    unplannedCost: 320000,
    scheduledCost: 18000,
    defaultLifespan: 220,
    sensors: [
      { key: 'val1', name: 'High-Speed Shaft Temp', unit: '°C', baseline: 64.0, description: 'Generator input pinion bearing temperature' },
      { key: 'val2', name: 'Debris Particle Count', unit: 'p/ml', baseline: 95.0, description: 'Metallic wear debris count in lube circuit' },
      { key: 'val3', name: 'Planetary Gear Shake', unit: 'g', baseline: 0.35, description: 'Low-speed planetary mesh acceleration amplitude' },
      { key: 'val4', name: 'Lube Oil Pressure', unit: 'bar', baseline: 4.5, description: 'Forced lubricating manifold delivery pressure' },
      { key: 'val5', name: 'Oil Viscosity Index', unit: 'cSt', baseline: 310.0, description: 'Kinematic oil viscosity under thermal stress' },
      { key: 'val6', name: 'Overall Nacelle RMS', unit: 'mm/s', baseline: 2.1, description: 'Structural tower and nacelle resonant vibration' },
    ],
  },
  generator: {
    category: 'Thermal Power Plant',
    timeUnit: 'Hours',
    unplannedCost: 260000,
    scheduledCost: 15000,
    defaultLifespan: 200,
    sensors: [
      { key: 'val1', name: 'Stator Core Temp', unit: '°C', baseline: 82.0, description: 'Stator winding slot thermocouple temperature' },
      { key: 'val2', name: 'Exciter Voltage', unit: 'V', baseline: 240.0, description: 'Field excitation rotor control voltage' },
      { key: 'val3', name: 'Hydrogen Cooling Press', unit: 'bar', baseline: 3.2, description: 'Sealed rotor casing hydrogen coolant pressure' },
      { key: 'val4', name: 'Shaft Eccentricity', unit: 'μm', baseline: 24.0, description: 'Dynamic rotor orbit eccentricity displacement' },
      { key: 'val5', name: 'Partial Discharge Rate', unit: 'pC', baseline: 180.0, description: 'High-voltage insulation corona discharge rate' },
      { key: 'val6', name: 'Bearing Pedestal RMS', unit: 'mm/s', baseline: 1.4, description: 'Turbine-generator journal bearing vibration' },
    ],
  },
};

/**
 * Generates synthetic telemetry for any industrial asset type
 */
export function generateAssetTelemetry(
  type: MachineType,
  maxLife: number,
  kneePoint: number,
  sensors: SensorDefinition[]
): TelemetryPoint[] {
  const data: TelemetryPoint[] = [];

  for (let c = 1; c <= maxLife; c++) {
    const isHealthy = c <= kneePoint;
    const wearProgress = Math.max(0, (c - kneePoint) / (maxLife - kneePoint));
    const expWear = (Math.exp(wearProgress * 2.8) - 1.0) / (Math.exp(2.8) - 1.0);

    // Dynamic sensor values based on type
    let val1 = 0, val2 = 0, val3 = 0, val4 = 0, val5 = 0, val6 = 0;

    if (type === 'turbofan') {
      val1 = +(642.0 + expWear * 12.0 + gaussianRandom(0, 0.45)).toFixed(2);
      val2 = +(1585.0 + expWear * 48.0 + gaussianRandom(0, 1.2)).toFixed(2);
      val3 = +(553.5 - expWear * 18.0 + gaussianRandom(0, 0.35)).toFixed(2);
      val4 = +(2388.0 - expWear * 8.5 + gaussianRandom(0, 0.8)).toFixed(2);
      val5 = +(47.45 - expWear * 1.8 + gaussianRandom(0, 0.08)).toFixed(2);
      val6 = +(0.38 + Math.pow(expWear, 1.6) * 1.85 + gaussianRandom(0, 0.03)).toFixed(3);
    } else if (type === 'transformer') {
      val1 = +(58.0 + expWear * 34.0 + gaussianRandom(0, 0.8)).toFixed(1);
      val2 = +(14.0 + Math.pow(expWear, 1.8) * 380.0 + gaussianRandom(0, 2.5)).toFixed(1);
      val3 = +(11.5 + expWear * 28.0 + gaussianRandom(0, 0.5)).toFixed(1);
      val4 = +(68.0 - expWear * 38.0 + gaussianRandom(0, 1.2)).toFixed(1);
      val5 = +(46.0 + expWear * 24.0 + gaussianRandom(0, 0.6)).toFixed(1);
      val6 = +(0.35 + expWear * 1.35 + gaussianRandom(0, 0.02)).toFixed(3);
    } else if (type === 'pump') {
      val1 = +(52.0 + expWear * 38.0 + gaussianRandom(0, 0.7)).toFixed(1);
      val2 = +(345.0 - expWear * 75.0 + gaussianRandom(0, 2.5)).toFixed(1);
      val3 = +(3.8 - expWear * 1.5 + gaussianRandom(0, 0.06)).toFixed(2);
      val4 = +(138.0 + expWear * 42.0 + gaussianRandom(0, 1.2)).toFixed(1);
      val5 = +(6.2 - expWear * 2.8 + gaussianRandom(0, 0.08)).toFixed(2);
      val6 = +(1.65 + Math.pow(expWear, 1.7) * 5.2 + gaussianRandom(0, 0.08)).toFixed(2);
    } else if (type === 'gearbox') {
      val1 = +(64.0 + expWear * 36.0 + gaussianRandom(0, 0.8)).toFixed(1);
      val2 = +(95.0 + Math.pow(expWear, 2.0) * 2800.0 + gaussianRandom(0, 20)).toFixed(0);
      val3 = +(0.35 + expWear * 2.1 + gaussianRandom(0, 0.04)).toFixed(2);
      val4 = +(4.5 - expWear * 1.8 + gaussianRandom(0, 0.07)).toFixed(2);
      val5 = +(310.0 - expWear * 90.0 + gaussianRandom(0, 3.5)).toFixed(1);
      val6 = +(2.1 + Math.pow(expWear, 1.6) * 4.8 + gaussianRandom(0, 0.09)).toFixed(2);
    } else {
      val1 = +(82.0 + expWear * 32.0 + gaussianRandom(0, 0.6)).toFixed(1);
      val2 = +(240.0 - expWear * 25.0 + gaussianRandom(0, 1.5)).toFixed(1);
      val3 = +(3.2 - expWear * 1.1 + gaussianRandom(0, 0.04)).toFixed(2);
      val4 = +(24.0 + expWear * 58.0 + gaussianRandom(0, 1.2)).toFixed(1);
      val5 = +(180.0 + Math.pow(expWear, 1.9) * 1200.0 + gaussianRandom(0, 15)).toFixed(0);
      val6 = +(1.4 + expWear * 3.6 + gaussianRandom(0, 0.07)).toFixed(2);
    }

    const rulActual = maxLife - c;
    const rulClipped = Math.min(125, rulActual);

    // Autoencoder MSE
    let mse = isHealthy
      ? 0.0032 + gaussianRandom(0, 0.0008)
      : 0.0032 + expWear * 0.042 + Math.pow(expWear, 2) * 0.078 + gaussianRandom(0, 0.002);
    mse = Math.max(0.001, +mse.toFixed(5));

    // LSTM RUL
    let rulPred = 125;
    if (c >= 25) {
      if (isHealthy) {
        rulPred = Math.max(115, Math.min(125, 125 - gaussianRandom(0, 3.0)));
      } else {
        const rawPred = rulClipped - gaussianRandom(1.2, 3.5);
        rulPred = Math.max(0, Math.min(125, rawPred));
      }
    }
    rulPred = +rulPred.toFixed(1);

    data.push({
      cycle: c,
      val1, val2, val3, val4, val5, val6,
      // Map to turbofan fields for chart backward compatibility
      T24: val1,
      T50: val2,
      P30: val3,
      Nf: val4,
      Ps30: val5,
      Vibration: val6,
      RUL_actual: rulActual,
      RUL_clipped: rulClipped,
      RUL_pred: rulPred,
      health_index_mse: mse,
      is_healthy: isHealthy,
      is_anomaly: mse > 0.0082,
    });
  }

  return data;
}

/**
 * Creates initial default fleet with diverse industrial machines
 */
export function getDefaultFleet(): MachineAsset[] {
  const assets: MachineAsset[] = [
    {
      id: 'turbofan-01',
      name: 'Turbofan CFM56 #01',
      type: 'turbofan',
      category: 'Commercial Aviation',
      location: 'Boeing 737 · Engine Left (Port)',
      criticality: 'Critical',
      timeUnit: 'Cycles',
      maxLife: 192,
      kneePoint: 88,
      threshold3Sigma: 0.0082,
      unplannedCost: 180000,
      scheduledCost: 12000,
      sensors: MACHINE_TYPE_TEMPLATES.turbofan.sensors,
      data: generateAssetTelemetry('turbofan', 192, 88, MACHINE_TYPE_TEMPLATES.turbofan.sensors),
    },
    {
      id: 'transformer-01',
      name: 'Substation Transformer TX-400',
      type: 'transformer',
      category: 'Electrical Grid',
      location: 'North Substation 230kV Bay 3',
      criticality: 'Critical',
      timeUnit: 'Days',
      maxLife: 210,
      kneePoint: 105,
      threshold3Sigma: 0.0082,
      unplannedCost: 450000,
      scheduledCost: 22000,
      sensors: MACHINE_TYPE_TEMPLATES.transformer.sensors,
      data: generateAssetTelemetry('transformer', 210, 105, MACHINE_TYPE_TEMPLATES.transformer.sensors),
    },
    {
      id: 'pump-01',
      name: 'Slurry Feed Pump P-302',
      type: 'pump',
      category: 'Petrochemical Plant',
      location: 'Cracking Unit · Train B',
      criticality: 'High',
      timeUnit: 'Hours',
      maxLife: 180,
      kneePoint: 82,
      threshold3Sigma: 0.0082,
      unplannedCost: 85000,
      scheduledCost: 6500,
      sensors: MACHINE_TYPE_TEMPLATES.pump.sensors,
      data: generateAssetTelemetry('pump', 180, 82, MACHINE_TYPE_TEMPLATES.pump.sensors),
    },
    {
      id: 'gearbox-01',
      name: 'Offshore Turbine Gearbox WTG-12',
      type: 'gearbox',
      category: 'Offshore Wind Farm',
      location: 'North Sea Field · Nacelle #12',
      criticality: 'Critical',
      timeUnit: 'Days',
      maxLife: 220,
      kneePoint: 110,
      threshold3Sigma: 0.0082,
      unplannedCost: 320000,
      scheduledCost: 18000,
      sensors: MACHINE_TYPE_TEMPLATES.gearbox.sensors,
      data: generateAssetTelemetry('gearbox', 220, 110, MACHINE_TYPE_TEMPLATES.gearbox.sensors),
    },
    {
      id: 'turbofan-02',
      name: 'Turbofan CFM56 #02',
      type: 'turbofan',
      category: 'Commercial Aviation',
      location: 'Boeing 737 · Engine Right (Starboard)',
      criticality: 'Critical',
      timeUnit: 'Cycles',
      maxLife: 206,
      kneePoint: 98,
      threshold3Sigma: 0.0082,
      unplannedCost: 180000,
      scheduledCost: 12000,
      sensors: MACHINE_TYPE_TEMPLATES.turbofan.sensors,
      data: generateAssetTelemetry('turbofan', 206, 98, MACHINE_TYPE_TEMPLATES.turbofan.sensors),
    },
  ];

  return assets;
}

/**
 * Creates a brand new custom machine asset
 */
export function createCustomMachine(
  name: string,
  type: MachineType,
  location: string,
  criticality: 'Critical' | 'High' | 'Medium',
  lifespan?: number
): MachineAsset {
  const template = MACHINE_TYPE_TEMPLATES[type] || MACHINE_TYPE_TEMPLATES.turbofan;
  const maxLife = lifespan || template.defaultLifespan;
  const kneePoint = Math.round(maxLife * 0.48);
  const data = generateAssetTelemetry(type, maxLife, kneePoint, template.sensors);

  return {
    id: `${type}-${Date.now().toString(36)}`,
    name,
    type,
    category: template.category,
    location: location || 'Main Facility',
    criticality,
    timeUnit: template.timeUnit,
    maxLife,
    kneePoint,
    threshold3Sigma: 0.0082,
    unplannedCost: template.unplannedCost,
    scheduledCost: template.scheduledCost,
    sensors: template.sensors,
    data,
  };
}

/**
 * Calculates financial avoidance and status
 */
export function getAssetFinancialStatus(
  currentCycle: number,
  activePoint: TelemetryPoint,
  asset: MachineAsset
): FinancialImpact {
  const netSavings = asset.unplannedCost - asset.scheduledCost;
  let status: EngineStatus = 'HEALTHY';
  let statusColor = '#4a7c59';
  let avoidedLoss = 0;

  if (activePoint.RUL_pred <= 10) {
    status = 'CRITICAL IMMINENT FAILURE';
    statusColor = '#b83230';
    avoidedLoss = netSavings;
  } else if (activePoint.RUL_pred <= 35) {
    status = 'SCHEDULE MAINTENANCE';
    statusColor = '#8a6627';
    avoidedLoss = netSavings;
  } else if (activePoint.health_index_mse > asset.threshold3Sigma) {
    status = 'DRIFT DETECTED';
    statusColor = '#8a6627';
    avoidedLoss = netSavings;
  } else {
    status = 'HEALTHY';
    statusColor = '#4a7c59';
    avoidedLoss = 0;
  }

  const roiPercent = Math.round((netSavings / asset.scheduledCost) * 100);

  return {
    status,
    statusColor,
    avoidedLoss,
    unitsPreserved: currentCycle,
    unplannedCost: asset.unplannedCost,
    scheduledCost: asset.scheduledCost,
    netSavings,
    roiPercent,
  };
}
