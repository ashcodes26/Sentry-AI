import React from 'react';
import {
  AlertOctagon,
  Wrench,
  Activity,
  DollarSign,
  Clock,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { MachineAsset, TelemetryPoint, FinancialImpact } from '../types/telemetry';

interface EmergencyInterceptModalProps {
  isOpen: boolean;
  asset: MachineAsset;
  currentCycle: number;
  activePoint: TelemetryPoint;
  financials: FinancialImpact;
  onAcknowledgeDispatch: () => void;
  onContinue: () => void;
}

export const EmergencyInterceptModal: React.FC<EmergencyInterceptModalProps> = ({
  isOpen,
  asset,
  currentCycle,
  activePoint,
  financials,
  onAcknowledgeDispatch,
  onContinue,
}) => {
  if (!isOpen) return null;

  const mseRatio = (activePoint.health_index_mse / asset.threshold3Sigma).toFixed(2);

  // Filter divergent sensors
  const divergentSensors = asset.sensors
    .map((s) => {
      const reading = Number(activePoint[s.key as keyof TelemetryPoint] || 0);
      const delta = reading - s.baseline;
      const pctDelta = s.baseline !== 0 ? (delta / s.baseline) * 100 : 0;
      return {
        ...s,
        reading,
        delta,
        pctDelta,
      };
    })
    .filter((s) => Math.abs(s.pctDelta) > 8);

  const getPhysicalFailureContext = () => {
    switch (asset.type) {
      case 'turbofan':
        return 'High-Pressure Turbine (HPT) Stage 1 blade tip clearance erosion and nozzle guide vane thermal barrier breakdown, inducing localized hot streak recirculation.';
      case 'transformer':
        return 'Dielectric cellulose insulation pyrolysis resulting in combustible gas evolution (C2H2, H2) and accelerated partial discharge activity.';
      case 'pump':
        return 'Inboard mechanical seal leakage and rolling element bearing spalling, inducing high-frequency harmonic vibration in radial axes.';
      default:
        return 'Statistical anomaly detector detected multi-channel parameter divergence exceeding nominal baseline.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2e3230]/40 backdrop-blur-sm animate-in fade-in duration-200 font-body">
      <div className="relative w-full max-w-2xl bg-surface border border-error/40 rounded-2xl shadow-2xl overflow-hidden text-on-surface">
        
        {/* Top Glowing Alert Banner */}
        <div className="bg-error-container/70 border-b border-error/20 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center p-2.5 rounded-xl bg-error text-on-error shadow-sm">
              <AlertOctagon className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase bg-error text-on-error shadow-xs">
                  CRITICAL INTERCEPT
                </span>
                <span className="text-xs text-error font-mono font-semibold">
                  CYCLE {currentCycle} / {asset.maxLife} {asset.timeUnit.toUpperCase()}
                </span>
              </div>
              <h2 className="text-lg font-headline font-semibold text-on-surface tracking-tight mt-0.5">
                Statistical 3-Sigma Anomaly Knee-Point Breached
              </h2>
            </div>
          </div>
          
          <div className="hidden sm:block text-right font-mono">
            <span className="text-[10px] text-secondary block uppercase">Auto-Pause Trigger</span>
            <span className="text-xs text-error font-bold">STATE: INTERCEPTED</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Asset & Risk Subtitle */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-surface-container">
            <div>
              <span className="text-xs text-secondary">Target Asset: </span>
              <span className="text-sm font-semibold text-on-surface">{asset.name}</span>
              <span className="text-xs text-secondary ml-2">({asset.category} · {asset.location})</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-secondary">Degradation Knee:</span>
              <span className="text-error font-bold">{asset.kneePoint} {asset.timeUnit}</span>
            </div>
          </div>

          {/* 3 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Anomaly MSE */}
            <div className="bg-surface-container-low border border-error/20 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-secondary text-[11px]">
                <span>Autoencoder MSE</span>
                <Activity className="w-3.5 h-3.5 text-error" />
              </div>
              <div className="text-xl font-bold font-mono text-error">
                {activePoint.health_index_mse.toFixed(4)}
              </div>
              <div className="text-[11px] text-secondary">
                Limit: <span className="font-mono text-on-surface font-semibold">{asset.threshold3Sigma.toFixed(4)}</span>
                <span className="text-error font-bold ml-1.5">({mseRatio}x)</span>
              </div>
            </div>

            {/* 2. Projected RUL */}
            <div className="bg-surface-container-low border border-tertiary/20 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-secondary text-[11px]">
                <span>Projected RUL</span>
                <Clock className="w-3.5 h-3.5 text-tertiary" />
              </div>
              <div className="text-xl font-bold font-mono text-tertiary">
                {Math.round(activePoint.RUL_pred)} <span className="text-xs text-secondary">{asset.timeUnit}</span>
              </div>
              <div className="text-[11px] text-tertiary font-semibold">
                Window: Maintenance Open
              </div>
            </div>

            {/* 3. Cost Avoidance */}
            <div className="bg-surface-container-low border border-primary/20 rounded-xl p-3.5 space-y-1">
              <div className="flex items-center justify-between text-secondary text-[11px]">
                <span>Avoided Loss ROI</span>
                <DollarSign className="w-3.5 h-3.5 text-primary" />
              </div>
              <div className="text-xl font-bold font-mono text-primary">
                ${financials.avoidedLoss.toLocaleString()}
              </div>
              <div className="text-[11px] text-secondary">
                Overhaul: <span className="font-mono text-on-surface font-semibold">${financials.scheduledCost.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Physical Root Cause */}
          <div className="bg-surface-container-low border border-surface-container-highest rounded-xl p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-error mb-1">
              <ShieldAlert className="w-4 h-4 text-error" />
              <span>Physical Root Cause Diagnosis:</span>
            </div>
            <p className="text-xs text-secondary leading-relaxed">
              {getPhysicalFailureContext()}
            </p>
          </div>

          {/* Divergent Sensor Telemetry */}
          {divergentSensors.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-secondary block font-mono">
                Critical Diverging Sensor Channels:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {divergentSensors.slice(0, 4).map((s) => (
                  <div
                    key={s.key}
                    className="flex items-center justify-between px-3 py-2 bg-surface border border-surface-container-highest rounded-xl text-xs"
                  >
                    <span className="text-on-surface font-medium truncate max-w-[150px]">{s.name}</span>
                    <div className="text-right font-mono">
                      <span className="text-secondary">{s.reading.toFixed(1)} {s.unit}</span>
                      <span className={`ml-2 font-bold ${s.delta > 0 ? 'text-error' : 'text-tertiary'}`}>
                        {s.delta > 0 ? '+' : ''}{s.pctDelta.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer CTAs */}
        <div className="bg-surface-container border-t border-surface-container-highest px-6 py-4 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            onClick={onContinue}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-secondary hover:text-on-surface bg-surface hover:bg-surface-container-high border border-surface-container-highest rounded-xl transition-colors"
          >
            Continue Simulation Run
          </button>
          <button
            onClick={onAcknowledgeDispatch}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-on-error bg-error hover:opacity-90 rounded-xl shadow-sm transition-all"
          >
            <Wrench className="w-4 h-4" />
            <span>Acknowledge & Dispatch Work-Order</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
