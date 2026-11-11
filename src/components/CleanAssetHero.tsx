import React from 'react';
import { ShieldCheck, AlertTriangle, Wrench, AlertOctagon, MapPin, DollarSign, TrendingUp } from 'lucide-react';
import { FinancialImpact, MachineAsset, TelemetryPoint } from '../types/telemetry';

interface CleanAssetHeroProps {
  asset: MachineAsset;
  currentCycle: number;
  activePoint: TelemetryPoint;
  financials: FinancialImpact;
}

export const CleanAssetHero: React.FC<CleanAssetHeroProps> = ({
  asset,
  currentCycle,
  activePoint,
  financials,
}) => {
  // Normalized 0-100% vitality
  const healthPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        activePoint.RUL_pred >= 125
          ? 100 - (currentCycle / asset.kneePoint) * 12
          : (activePoint.RUL_pred / 125) * 88
      )
    )
  );

  let statusBadge = {
    label: 'Nominal Calibration',
    containerClass: 'bg-primary-container text-on-primary-container border-primary/20',
    pulseClass: 'bg-primary',
    icon: ShieldCheck,
  };

  if (financials.status === 'DRIFT DETECTED') {
    statusBadge = {
      label: 'Stage 1 Degradation Drift',
      containerClass: 'bg-secondary-container text-on-secondary-container border-secondary/20',
      pulseClass: 'bg-secondary',
      icon: AlertTriangle,
    };
  } else if (financials.status === 'SCHEDULE MAINTENANCE') {
    statusBadge = {
      label: 'Stage 2 Maintenance Open',
      containerClass: 'bg-tertiary-container text-on-tertiary-container border-tertiary/20',
      pulseClass: 'bg-tertiary',
      icon: Wrench,
    };
  } else if (financials.status === 'CRITICAL IMMINENT FAILURE') {
    statusBadge = {
      label: 'Critical Alert · Service Required',
      containerClass: 'bg-error-container text-error border-error/20',
      pulseClass: 'bg-error',
      icon: AlertOctagon,
    };
  }

  const StatusIcon = statusBadge.icon;

  // Circular radial gauge math
  const circumference = 2 * Math.PI * 30;
  const strokeDashoffset = circumference - (healthPercent / 100) * circumference;

  const ciLow = Math.max(0, Math.round(activePoint.RUL_pred - Math.max(3.5, activePoint.RUL_pred * 0.08)));
  const ciHigh = Math.round(activePoint.RUL_pred + Math.max(3.5, activePoint.RUL_pred * 0.08));

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* 1. Asset Vitality & Radial Health Gauge (Span 5) */}
      <div className="lg:col-span-5 bg-surface rounded-2xl p-6 border border-surface-container-highest shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between mb-4">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider font-mono">
                Asset Overview
              </span>
              <h2 className="font-headline font-semibold text-2xl text-on-surface mt-0.5 tracking-tight">
                {asset.name}
              </h2>
              <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>{asset.location}</span>
                <span>·</span>
                <span>{asset.category}</span>
              </p>
            </div>

            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 border shadow-sm ${statusBadge.containerClass}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.pulseClass} animate-pulse`} />
              <span>{statusBadge.label}</span>
            </span>
          </div>

          {/* Stitch Radial Health Gauge & Autoencoder Metric */}
          <div className="flex items-center gap-6 my-4 p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/60">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 72 72">
                <circle
                  className="text-surface-container-high"
                  cx="36"
                  cy="36"
                  fill="none"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                <circle
                  className={`transition-all duration-1000 ease-out ${
                    healthPercent > 60
                      ? 'text-primary'
                      : healthPercent > 25
                      ? 'text-tertiary'
                      : 'text-error'
                  }`}
                  cx="36"
                  cy="36"
                  fill="none"
                  r="30"
                  stroke="currentColor"
                  strokeWidth="6"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-headline text-lg font-bold text-on-surface">{healthPercent}%</span>
                <span className="text-[9px] uppercase tracking-wider font-semibold text-secondary">VITALITY</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                Health Index
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-headline font-bold text-on-surface">
                  {activePoint.health_index_mse.toFixed(4)}
                </span>
                <span className="text-xs text-secondary font-mono">MSE Error</span>
              </div>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                3σ statistical alert threshold is <span className="font-mono text-on-surface font-semibold">{asset.threshold3Sigma.toFixed(4)}</span>.
                {activePoint.health_index_mse > asset.threshold3Sigma
                  ? ' Anomaly knee-point breached.'
                  : ' Baseline sensor correlation nominal.'}
              </p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-container-highest grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-secondary block">Cumulative Operation</span>
            <span className="font-semibold text-on-surface text-sm font-mono">
              {currentCycle} / {asset.maxLife} {asset.timeUnit}
            </span>
          </div>
          <div>
            <span className="text-secondary block">Hardware Criticality</span>
            <span className="font-semibold text-on-surface text-sm">
              Level 1 · {asset.criticality}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Remaining Useful Life Forecasting (Span 4) */}
      <div className="lg:col-span-4 bg-surface rounded-2xl p-6 border border-surface-container-highest shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Sequence Forecasting
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-surface-container text-on-surface border border-surface-container-highest font-mono">
              GRU Sequence RUL
            </span>
          </div>

          <h3 className="text-xs text-secondary">Remaining Useful Life (RUL)</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className={`text-4xl font-headline font-bold tracking-tight ${
              activePoint.RUL_pred < 30 ? 'text-error' : activePoint.RUL_pred < 65 ? 'text-tertiary' : 'text-primary'
            }`}>
              {Math.round(activePoint.RUL_pred)}
            </span>
            <span className="text-sm font-medium text-secondary">{asset.timeUnit} Remaining</span>
          </div>

          <div className="mt-4 p-4 rounded-xl bg-surface-container-low border border-surface-container-highest/60 space-y-2.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-secondary">95% Confidence Interval:</span>
              <span className="font-mono text-primary font-bold">
                [{ciLow} – {ciHigh} {asset.timeUnit}]
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  activePoint.RUL_pred < 30
                    ? 'bg-error'
                    : activePoint.RUL_pred < 65
                    ? 'bg-tertiary'
                    : 'bg-primary'
                }`}
                style={{ width: `${Math.min(100, (activePoint.RUL_pred / 125) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-container-highest space-y-1.5 text-xs">
          <div className="flex justify-between text-secondary">
            <span>Knee Point Horizon:</span>
            <span className="font-mono text-on-surface font-semibold">{asset.kneePoint} {asset.timeUnit}</span>
          </div>
          <div className="flex justify-between text-secondary">
            <span>Next Window:</span>
            <span className="font-mono text-primary font-semibold">
              Within {Math.max(1, Math.round(activePoint.RUL_pred - 12))} {asset.timeUnit}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Economic Impact & ROI (Span 3) */}
      <div className="lg:col-span-3 bg-surface rounded-2xl p-6 border border-surface-container-highest shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              Economic Impact
            </span>
            <DollarSign className="w-4 h-4 text-primary" />
          </div>

          <div className="space-y-1">
            <div className="text-xs text-secondary">Net Capital Saved Per Event</div>
            <div className="text-3xl font-headline font-bold text-primary tracking-tight">
              +${(asset.unplannedCost - asset.scheduledCost).toLocaleString()}
            </div>
            <div className="text-[11px] text-primary font-mono font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{financials.roiPercent}% Return on Maintenance</span>
            </div>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <div className="p-3 rounded-xl bg-surface-container-low border border-surface-container-highest/60 flex justify-between items-center">
              <div>
                <span className="block text-secondary text-[11px]">Unplanned Outage</span>
                <span className="font-mono text-error font-semibold">
                  ${asset.unplannedCost.toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="block text-secondary text-[11px]">Condition Service</span>
                <span className="font-mono text-primary font-semibold">
                  ${asset.scheduledCost.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-surface-container-highest text-[11px] text-secondary leading-relaxed">
          Proactive condition overhaul eliminates secondary equipment damage and emergency rush freight fees.
        </div>
      </div>
    </section>
  );
};
