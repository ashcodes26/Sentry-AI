import React from 'react';
import { DollarSign, ShieldAlert, Cpu, CheckCircle2, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { FinancialImpact, MachineAsset, TelemetryPoint } from '../types/telemetry';

interface VenturePitchPanelProps {
  asset: MachineAsset;
  data: TelemetryPoint[];
  currentCycle: number;
  financials: FinancialImpact;
}

export const VenturePitchPanel: React.FC<VenturePitchPanelProps> = ({
  asset,
  data,
  currentCycle,
  financials,
}) => {
  const netSaved = Math.max(0, asset.unplannedCost - asset.scheduledCost);
  const activePoint = data.find((d) => d.cycle === currentCycle) || data[data.length - 1];

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container p-6 shadow-sm border border-surface-container-highest">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary text-on-primary text-[11px] font-semibold tracking-wider uppercase font-mono">
                {asset.name}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant text-[11px] font-medium">
                {asset.location}
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-lowest text-primary text-[11px] font-mono font-medium shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live Stream Verified
              </span>
            </div>
            <h1 className="font-headline text-2xl lg:text-3xl font-semibold text-on-surface tracking-tight">
              Financial ROI & Capital Loss Avoidance
            </h1>
            <p className="text-secondary text-xs flex flex-wrap items-center gap-x-3 gap-y-1">
              <span>Model: <span className="font-medium text-on-surface">Predictive Capital Preservation Model v3.1</span></span>
              <span>·</span>
              <span>Currency: <span className="font-mono font-semibold text-on-surface">USD ($)</span></span>
            </p>
          </div>

          <div className="flex items-center gap-4 bg-surface p-3.5 rounded-xl shadow-xs border border-surface-container-highest min-w-[260px]">
            <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-secondary">Operating Life</span>
                <span className="font-mono font-bold text-on-surface">{currentCycle} / {asset.maxLife} {asset.timeUnit}</span>
              </div>
              <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden flex">
                <div
                  className="bg-primary h-full"
                  style={{ width: `${Math.min(100, (currentCycle / asset.maxLife) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-secondary mt-1 font-mono">Knee Point: Cycle {asset.kneePoint}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Executive Capital Impact Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bento Hero Card: Net Capital Preserved */}
        <div className="sm:col-span-2 rounded-2xl bg-primary text-on-primary p-6 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase tracking-wider text-on-primary-container font-mono font-semibold">
                Net Capital Preserved
              </span>
              <TrendingUp className="w-5 h-5 text-on-primary-container" />
            </div>
            <div className="font-headline text-3xl sm:text-4xl font-bold tracking-tight text-on-primary mb-2">
              +${netSaved.toLocaleString()}
            </div>
            <p className="text-on-primary-container text-xs leading-relaxed max-w-sm">
              Secured via planned Stage-1 boroscope intervention, intercepting high-pressure cascade damage before casing deformation.
            </p>
          </div>
          <div className="mt-5 pt-3 flex items-center justify-between text-xs text-on-primary-container border-t border-on-primary/15 font-mono">
            <span>Return on Maintenance Investment</span>
            <span className="font-bold text-on-primary text-sm">{financials.roiPercent}%</span>
          </div>
        </div>

        {/* Card 2: Unplanned Outage Avoided */}
        <div className="rounded-2xl bg-surface p-5 shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-secondary font-medium">Unplanned Outage Avoided</span>
              <span className="w-6 h-6 rounded-md bg-error-container text-error flex items-center justify-center">
                <ShieldAlert className="w-3.5 h-3.5" />
              </span>
            </div>
            <div className="font-headline text-2xl font-bold text-on-surface mb-1 font-mono">
              ${asset.unplannedCost.toLocaleString()}
            </div>
            <p className="text-[11px] text-secondary leading-normal">
              Full catastrophic blade release benchmark with titanium casing containment repair and collateral downtime.
            </p>
          </div>
          <div className="mt-4 text-[10px] text-secondary font-mono pt-2 border-t border-surface-container">
            Impact: <span className="text-error font-semibold uppercase">Severe Catastrophic</span>
          </div>
        </div>

        {/* Card 3: Proactive Planned Budget */}
        <div className="rounded-2xl bg-surface p-5 shadow-sm border border-surface-container-highest flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-secondary font-medium">Proactive Budget</span>
              <span className="w-6 h-6 rounded-md bg-primary-container text-on-primary-container flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary" />
              </span>
            </div>
            <div className="font-headline text-2xl font-bold text-on-surface mb-1 font-mono">
              ${asset.scheduledCost.toLocaleString()}
            </div>
            <p className="text-[11px] text-secondary leading-normal">
              Planned borescope inspection, thermal barrier repointing, and replacement during regular depot maintenance.
            </p>
          </div>
          <div className="mt-4 text-[10px] text-secondary font-mono pt-2 border-t border-surface-container">
            Status: <span className="text-primary font-semibold uppercase">Controlled Window</span>
          </div>
        </div>
      </div>

      {/* 3. Algorithmic Decision Architecture Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-surface rounded-2xl p-6 border border-surface-container-highest shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
            <Cpu className="w-4 h-4 text-primary" />
            <span className="font-headline text-sm font-semibold">Two-Stage Predictive Algorithm</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-highest/80 space-y-1">
              <div className="text-xs font-semibold text-primary font-mono">
                1. Stage 1: Autoencoder Reconstruction MSE
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Reconstructs baseline sensor correlations without labeled failure data. When reconstruction MSE crosses the 3-sigma statistical threshold ({asset.threshold3Sigma.toFixed(4)}), a latent degradation drift is flagged.
              </p>
            </div>

            <div className="p-4 bg-surface-container-low rounded-xl border border-surface-container-highest/80 space-y-1">
              <div className="text-xs font-semibold text-primary font-mono">
                2. Stage 2: GRU Remaining Useful Life Sequence Regression
              </div>
              <p className="text-[11px] text-secondary leading-relaxed">
                Processes temporal multi-sensor sliding sequences to predict exact remaining cycles with a 95% confidence interval, calibrated with NASA asymmetric scoring penalties to strictly prevent late failure.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-surface rounded-2xl p-6 border border-surface-container-highest shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
              <DollarSign className="w-4 h-4 text-primary" />
              <span className="font-headline text-sm font-semibold">Reliability Business Case</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-surface-container">
                <span className="text-secondary">Asset Criticality Tier:</span>
                <span className="font-semibold text-on-surface font-mono">{asset.criticality} Priority</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-surface-container">
                <span className="text-secondary">Fleet Downtime Penalty:</span>
                <span className="font-semibold text-error font-mono">$15,000 / hour</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-surface-container">
                <span className="text-secondary">Proactive Lead Time Provided:</span>
                <span className="font-semibold text-primary font-mono">
                  {Math.round(activePoint?.RUL_pred || 0)} {asset.timeUnit}
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-secondary">Fleet Capital Preservation Ratio:</span>
                <span className="font-semibold text-primary font-mono">
                  {((netSaved / asset.unplannedCost) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-secondary pt-3 border-t border-surface-container flex items-center justify-between font-mono">
            <span>Asset Category: {asset.category}</span>
            <span>Target ID: {asset.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
