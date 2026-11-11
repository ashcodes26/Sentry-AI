import React, { useState } from 'react';
import { MachineAsset, TelemetryPoint } from '../types/telemetry';
import { AiSensorAnomalyCard } from './AiSensorAnomalyCard';
import { CheckCircle } from 'lucide-react';

interface CleanSensorGridProps {
  asset: MachineAsset;
  currentCycle: number;
  activePoint: TelemetryPoint;
}

export const CleanSensorGrid: React.FC<CleanSensorGridProps> = ({
  asset,
  currentCycle,
  activePoint,
}) => {
  const [isOnlyAnomaliesFilter, setIsOnlyAnomaliesFilter] = useState<boolean>(false);
  const history = asset.data.filter((d) => d.cycle <= currentCycle);

  // Compute anomalous channels count
  const anomalousChannelCount = asset.sensors.filter((s) => {
    const valKey = s.key as keyof TelemetryPoint;
    const currentVal = Number(activePoint[valKey] || 0);
    const baseline = s.baseline;
    const delta = currentVal - baseline;
    const pct = Math.abs((delta / (baseline || 1)) * 100);
    return pct > 8;
  }).length;

  const displayedSensors = isOnlyAnomaliesFilter
    ? asset.sensors.filter((s) => {
        const valKey = s.key as keyof TelemetryPoint;
        const currentVal = Number(activePoint[valKey] || 0);
        const baseline = s.baseline;
        const delta = currentVal - baseline;
        const pct = Math.abs((delta / (baseline || 1)) * 100);
        return pct > 8;
      })
    : asset.sensors;

  return (
    <div className="bg-surface rounded-2xl p-6 border border-surface-container-highest shadow-sm space-y-6">
      {/* 1. AI Sensor Anomaly Diagnostic Component */}
      <AiSensorAnomalyCard
        asset={asset}
        currentCycle={currentCycle}
        activePoint={activePoint}
        isOnlyAnomaliesFilter={isOnlyAnomaliesFilter}
        onToggleFilter={() => setIsOnlyAnomaliesFilter(!isOnlyAnomaliesFilter)}
        anomalousChannelCount={anomalousChannelCount}
      />

      {/* 2. Sensor Grid Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-surface-container-highest pt-4">
        <div>
          <h2 className="text-sm font-headline font-semibold text-on-surface tracking-tight flex items-center gap-2">
            <span>Multi-Channel Telemetry Envelopes</span>
            {isOnlyAnomaliesFilter && (
              <span className="text-[10px] bg-primary-container text-on-primary-container px-2 py-0.5 rounded-full font-mono font-semibold">
                Filtered: Anomalies Only
              </span>
            )}
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Physical telemetry channels evaluated against statistical baseline models
          </p>
        </div>
        <div className="text-xs text-secondary font-mono flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-primary inline-block" />
            <span className="text-[11px] text-secondary">{asset.sensors.length - anomalousChannelCount} Nominal</span>
          </span>
          {anomalousChannelCount > 0 && (
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary inline-block animate-pulse" />
              <span className="text-[11px] text-tertiary font-semibold">{anomalousChannelCount} Diverging</span>
            </span>
          )}
          <span className="text-outline-variant">|</span>
          <span>{displayedSensors.length} of {asset.sensors.length} Channels</span>
        </div>
      </div>

      {/* Empty State when filter is active and no anomalies exist */}
      {displayedSensors.length === 0 ? (
        <div className="text-center py-10 px-4 bg-surface-container-low rounded-xl border border-surface-container-highest/60 my-2">
          <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-on-surface">No Sensor Anomalies Detected</h4>
          <p className="text-xs text-secondary max-w-md mx-auto mt-1">
            At {currentCycle} {asset.timeUnit}, all {asset.sensors.length} channels are operating within the nominal ±8% variance envelope.
          </p>
          <button
            onClick={() => setIsOnlyAnomaliesFilter(false)}
            className="mt-3 text-xs text-primary hover:underline font-semibold"
          >
            Show All Channels
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedSensors.map((sensor) => {
            const valKey = sensor.key as keyof TelemetryPoint;
            const currentVal = Number(activePoint[valKey] || 0);
            const baselineVal = sensor.baseline;
            const delta = currentVal - baselineVal;
            const pctDelta = ((delta / (baselineVal || 1)) * 100).toFixed(1);

            // Calculate min/max for sparkline
            const allVals = asset.data.map((d) => Number(d[valKey] || 0));
            const minVal = Math.min(...allVals);
            const maxVal = Math.max(...allVals);
            const range = maxVal - minVal || 1;

            const w = 320;
            const h = 75;
            const pad = { top: 8, bottom: 12, left: 6, right: 6 };
            const plotW = w - pad.left - pad.right;
            const plotH = h - pad.top - pad.bottom;

            const getX = (c: number) => pad.left + (c / asset.maxLife) * plotW;
            const getY = (v: number) =>
              pad.top + plotH - ((Math.min(maxVal, Math.max(minVal, v)) - minVal) / range) * plotH;

            const pathD = history
              .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(d.cycle).toFixed(1)} ${getY(Number(d[valKey] || 0)).toFixed(1)}`)
              .join(' ');

            const currX = getX(currentCycle);
            const currY = getY(currentVal);

            const absPct = Math.abs(Number(pctDelta));
            const isWarning = absPct > 8 && absPct <= 20;
            const isCritical = absPct > 20;

            return (
              <div
                key={sensor.key}
                className={`border rounded-xl p-4 flex flex-col justify-between transition-all duration-200 shadow-sm ${
                  isCritical
                    ? 'bg-error-container/40 border-error/50'
                    : isWarning
                    ? 'bg-tertiary-container/30 border-tertiary/40'
                    : 'bg-surface-container-low border-surface-container-highest/80 hover:border-outline/40'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-semibold text-on-surface">{sensor.name}</span>
                      {isCritical && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-error-container text-error border border-error/30 uppercase">
                          Anomaly
                        </span>
                      )}
                      {isWarning && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-tertiary-container text-on-tertiary-container border border-tertiary/30 uppercase">
                          Drift
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-secondary line-clamp-1 mt-0.5">
                      {sensor.description}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-base font-bold font-mono text-on-surface">
                      {currentVal.toFixed(1)}{' '}
                      <span className="text-xs font-normal text-secondary">{sensor.unit}</span>
                    </div>
                    <div
                      className={`text-[10px] font-mono font-medium ${
                        isCritical
                          ? 'text-error font-semibold'
                          : isWarning
                          ? 'text-tertiary font-semibold'
                          : 'text-secondary'
                      }`}
                    >
                      Δ {delta > 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1)} ({pctDelta}%)
                    </div>
                  </div>
                </div>

                {/* Sparkline */}
                <div className="mt-3 p-1.5 bg-surface rounded-lg border border-surface-container-highest/60">
                  <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto">
                    <line
                      x1={pad.left}
                      y1={getY(baselineVal)}
                      x2={w - pad.right}
                      y2={getY(baselineVal)}
                      stroke="#c4c8bc"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isCritical ? '#b83230' : isWarning ? '#c4a66a' : '#4a7c59'}
                      strokeWidth="1.8"
                    />
                    <circle
                      cx={currX}
                      cy={currY}
                      r="3.5"
                      fill={isCritical ? '#b83230' : isWarning ? '#c4a66a' : '#4a7c59'}
                      stroke="#faf6f0"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>

                {/* Sensor footer state bar */}
                <div className="mt-2.5 pt-2 border-t border-surface-container-highest/60 flex items-center justify-between text-[10px] text-secondary font-mono">
                  <span>Baseline: {baselineVal} {sensor.unit}</span>
                  <span className={isCritical ? 'text-error font-semibold' : isWarning ? 'text-tertiary font-semibold' : 'text-primary font-semibold'}>
                    {isCritical ? 'Envelope Breach' : isWarning ? 'Statistical Drift' : 'Calibrated Nominal'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
