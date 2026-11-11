import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertOctagon,
  RefreshCw,
  Activity,
  Layers,
  Wrench,
  ChevronDown,
  ChevronUp,
  Cpu,
  Info,
  Filter
} from 'lucide-react';
import { MachineAsset, TelemetryPoint } from '../types/telemetry';

export interface AiSensorAnomalyCardProps {
  asset: MachineAsset;
  currentCycle: number;
  activePoint: TelemetryPoint;
  isOnlyAnomaliesFilter: boolean;
  onToggleFilter: () => void;
  anomalousChannelCount: number;
}

interface AnomalyData {
  hasAnomaly: boolean;
  severity: 'NOMINAL' | 'DRIFT' | 'WARNING' | 'CRITICAL';
  headline: string;
  summary: string;
  anomalousSensors: Array<{
    name: string;
    reading: string;
    deviation: string;
    concern: string;
  }>;
  physicalRootCause: string;
  recommendedAction: string;
}

export const AiSensorAnomalyCard: React.FC<AiSensorAnomalyCardProps> = ({
  asset,
  currentCycle,
  activePoint,
  isOnlyAnomaliesFilter,
  onToggleFilter,
  anomalousChannelCount,
}) => {
  const [anomalyData, setAnomalyData] = useState<AnomalyData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState<boolean>(false);

  const sensorMetrics = asset.sensors.map((s) => {
    const valKey = s.key as keyof TelemetryPoint;
    const currentVal = Number(activePoint[valKey] || 0);
    const baseline = s.baseline;
    const delta = currentVal - baseline;
    const pctDelta = Number(((delta / (baseline || 1)) * 100).toFixed(1));
    const isCritical = Math.abs(pctDelta) > 20;
    const isWarning = Math.abs(pctDelta) > 8 && !isCritical;
    return {
      name: s.name,
      unit: s.unit,
      current: currentVal.toFixed(1),
      baseline,
      delta: Number(delta.toFixed(1)),
      pctDelta,
      isCritical,
      isWarning,
    };
  });

  const fetchAnomalyDiagnosis = async () => {
    setIsLoading(true);
    try {
      const payload = {
        assetName: asset.name,
        assetType: asset.type,
        category: asset.category,
        currentCycle,
        maxLife: asset.maxLife,
        timeUnit: asset.timeUnit,
        healthIndexMse: activePoint.health_index_mse,
        threshold3Sigma: asset.threshold3Sigma,
        rulPred: activePoint.RUL_pred,
        sensors: sensorMetrics,
      };

      const res = await fetch('/api/anomaly/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`API responded with ${res.status}`);
      }

      const data = await res.json();
      setAnomalyData(data);
    } catch {
      const criticalCount = sensorMetrics.filter((s) => s.isCritical).length;
      const warningCount = sensorMetrics.filter((s) => s.isWarning).length;
      const hasAnomaly = activePoint.health_index_mse > asset.threshold3Sigma || criticalCount > 0 || warningCount > 0;
      const mseRatio = activePoint.health_index_mse / asset.threshold3Sigma;

      const severity: 'NOMINAL' | 'DRIFT' | 'WARNING' | 'CRITICAL' =
        criticalCount > 0 || mseRatio >= 2.0
          ? 'CRITICAL'
          : warningCount > 0 || mseRatio >= 1.0
          ? 'WARNING'
          : activePoint.health_index_mse > asset.threshold3Sigma * 0.8
          ? 'DRIFT'
          : 'NOMINAL';

      setAnomalyData({
        hasAnomaly,
        severity,
        headline:
          severity === 'CRITICAL'
            ? 'Critical Sensor Anomaly Breach Detected'
            : severity === 'WARNING'
            ? 'Early Sensor Degradation Drift Observed'
            : severity === 'DRIFT'
            ? 'Subtle Multi-Channel Boundary Drift'
            : 'All Sensor Channels Calibrated & Nominal',
        summary:
          severity === 'NOMINAL'
            ? `All telemetry channels for ${asset.name} are tracking along expected baseline bounds with safe statistical variance.`
            : `Autoencoder anomaly MSE (${activePoint.health_index_mse.toFixed(4)}) is ${mseRatio.toFixed(2)}x the 3-sigma baseline. ${
                criticalCount > 0
                  ? `${criticalCount} channel(s) in critical limit breach.`
                  : `${warningCount} channel(s) exhibiting accelerated drift.`
              }`,
        anomalousSensors: sensorMetrics
          .filter((s) => Math.abs(s.pctDelta) > 8)
          .map((s) => ({
            name: s.name,
            reading: `${s.current} ${s.unit}`,
            deviation: `${s.delta > 0 ? '+' : ''}${s.delta} (${s.pctDelta}%)`,
            concern: s.isCritical ? 'Critical Envelope Breach' : 'Statistical Drift',
          })),
        physicalRootCause:
          severity === 'CRITICAL'
            ? `Sub-surface physical degradation and hot section thermal barrier breakdown on ${asset.name}.`
            : severity === 'WARNING'
            ? `Incipient component wear causing aerodynamic and frictional impedance drift.`
            : 'Nominal operational wear within calibrated design envelopes.',
        recommendedAction:
          severity === 'CRITICAL'
            ? `Schedule urgent overhaul within ${Math.min(15, Math.round(activePoint.RUL_pred))} ${asset.timeUnit} to prevent secondary catastrophic failure.`
            : severity === 'WARNING'
            ? `Flag telemetry for engineering review and prepare replacement staging.`
            : `Standard operational routine. No intervention required.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnomalyDiagnosis();
  }, [asset.id, Math.floor(currentCycle / 10)]);

  const mseRatio = activePoint.health_index_mse / asset.threshold3Sigma;
  const severity = anomalyData?.severity || (mseRatio > 1.8 ? 'CRITICAL' : mseRatio > 1.0 ? 'WARNING' : 'NOMINAL');

  const config = {
    NOMINAL: {
      borderColor: 'border-surface-container-highest',
      badgeBg: 'bg-primary-container text-on-primary-container border-primary/20',
      icon: CheckCircle2,
      iconColor: 'text-primary',
      label: 'AI Sensor Anomaly: NOMINAL',
      accentColor: '#4a7c59',
    },
    DRIFT: {
      borderColor: 'border-secondary/30',
      badgeBg: 'bg-secondary-container text-on-secondary-container border-secondary/30',
      icon: Activity,
      iconColor: 'text-secondary',
      label: 'AI Sensor Monitor: EARLY DRIFT',
      accentColor: '#6b6358',
    },
    WARNING: {
      borderColor: 'border-tertiary/40',
      badgeBg: 'bg-tertiary-container text-on-tertiary-container border-tertiary/30',
      icon: AlertTriangle,
      iconColor: 'text-tertiary',
      label: 'AI Anomaly Detected: SENSOR DRIFT',
      accentColor: '#8a6627',
    },
    CRITICAL: {
      borderColor: 'border-error/40',
      badgeBg: 'bg-error-container text-error border-error/30',
      icon: AlertOctagon,
      iconColor: 'text-error',
      label: 'AI Critical Alert: ANOMALY BREACH',
      accentColor: '#b83230',
    },
  }[severity];

  const IconComponent = config.icon;

  return (
    <div
      className={`relative rounded-2xl border ${config.borderColor} bg-surface-container-low p-4 sm:p-5 mb-6 transition-all duration-300 shadow-sm overflow-hidden`}
    >
      {/* Decorative top pulse strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 transition-colors duration-500"
        style={{
          backgroundColor: config.accentColor,
          opacity: severity === 'NOMINAL' ? 0.7 : 0.95,
        }}
      />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-surface-container-highest">
        <div className="flex items-center gap-3">
          <div
            className={`p-2 rounded-xl border ${config.badgeBg} flex items-center justify-center shrink-0 shadow-sm`}
          >
            <IconComponent className={`w-5 h-5 ${config.iconColor} ${severity === 'CRITICAL' ? 'animate-pulse' : ''}`} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full border ${config.badgeBg} uppercase tracking-wider font-mono`}>
                {config.label}
              </span>

              <span className="text-[11px] font-mono text-secondary flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-primary" />
                <span>Autoencoder MSE:</span>
                <span className={`font-semibold ${activePoint.health_index_mse > asset.threshold3Sigma ? 'text-tertiary' : 'text-on-surface'}`}>
                  {activePoint.health_index_mse.toFixed(4)}
                </span>
                <span className="text-secondary text-[10px]">
                  (3σ: {asset.threshold3Sigma} · {mseRatio.toFixed(2)}x)
                </span>
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-semibold text-on-surface mt-1 flex items-center gap-1.5">
              <span>{anomalyData?.headline || 'Scanning Multi-Channel Sensor Envelopes...'}</span>
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={onToggleFilter}
            className={`px-3 py-1.5 text-xs font-medium rounded-xl border transition-all flex items-center gap-1.5 shadow-sm ${
              isOnlyAnomaliesFilter
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface hover:bg-surface-container border-surface-container-highest text-on-surface'
            }`}
            title="Filter to show only anomalous channels"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>
              {isOnlyAnomaliesFilter ? 'Showing Anomalies' : 'Filter Anomalous'}
            </span>
            {anomalousChannelCount > 0 && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                isOnlyAnomaliesFilter ? 'bg-primary-container text-on-primary-container' : 'bg-tertiary-container text-on-tertiary-container'
              }`}>
                {anomalousChannelCount}
              </span>
            )}
          </button>

          <button
            onClick={fetchAnomalyDiagnosis}
            disabled={isLoading}
            className="p-1.5 text-secondary hover:text-on-surface bg-surface hover:bg-surface-container border border-surface-container-highest rounded-xl transition-colors disabled:opacity-40 shadow-sm"
            title="Re-run AI Sensor Scan"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Analysis Body */}
      <div className="mt-3.5 space-y-3">
        {/* Natural Language Diagnostic Summary */}
        <div className="text-xs sm:text-sm text-on-surface leading-relaxed bg-surface rounded-xl p-3.5 border border-surface-container-highest flex items-start gap-2.5 shadow-sm">
          <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-on-surface font-medium">
              {anomalyData?.summary || 'Synthesizing sensor patterns and autoencoder statistical metrics...'}
            </p>

            {/* Quick Action & Cause Tags */}
            <div className="mt-2.5 pt-2 border-t border-surface-container-highest flex flex-wrap items-center gap-2 text-xs">
              {anomalyData?.physicalRootCause && (
                <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-md border border-surface-container-highest text-on-surface shadow-sm">
                  <Layers className="w-3 h-3 text-primary shrink-0" />
                  <span className="text-secondary">Root Cause:</span>
                  <span className="font-semibold text-on-surface">{anomalyData.physicalRootCause}</span>
                </div>
              )}

              {anomalyData?.recommendedAction && (
                <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-1 rounded-md border border-surface-container-highest text-on-surface shadow-sm">
                  <Wrench className="w-3 h-3 text-tertiary shrink-0" />
                  <span className="text-secondary">Action:</span>
                  <span className="font-semibold text-on-surface">{anomalyData.recommendedAction}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Anomalous Channels List if detected */}
        {anomalyData && anomalyData.anomalousSensors && anomalyData.anomalousSensors.length > 0 && (
          <div className="bg-surface rounded-xl p-3.5 border border-surface-container-highest shadow-sm">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-secondary mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-tertiary" />
                Detected Channel Anomalies ({anomalyData.anomalousSensors.length})
              </span>
              <span className="text-secondary font-normal font-mono">
                Deviations &gt; ±8% baseline limit
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {anomalyData.anomalousSensors.map((s, idx) => (
                <div
                  key={idx}
                  className="bg-surface-container border border-surface-container-highest rounded-lg px-2.5 py-1.5 flex items-center justify-between text-xs shadow-sm"
                >
                  <div className="truncate mr-2">
                    <span className="font-medium text-on-surface block truncate">{s.name}</span>
                    <span className="text-[10px] text-secondary">{s.reading}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-mono text-xs font-bold block ${
                        s.concern.includes('Critical') ? 'text-error' : 'text-tertiary'
                      }`}
                    >
                      {s.deviation}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-secondary font-medium">
                      {s.concern}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technical Deep Dive */}
        <div className="pt-1">
          <button
            onClick={() => setIsDetailsExpanded(!isDetailsExpanded)}
            className="text-[11px] text-secondary hover:text-on-surface flex items-center gap-1 transition-colors font-medium"
          >
            <Info className="w-3.5 h-3.5 text-primary" />
            <span>{isDetailsExpanded ? 'Hide Model & Baseline Calibration Details' : 'View Model & Baseline Calibration Details'}</span>
            {isDetailsExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </button>

          {isDetailsExpanded && (
            <div className="mt-2 text-xs bg-surface p-3.5 rounded-xl border border-surface-container-highest text-on-surface space-y-2 leading-relaxed shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center pb-2 border-b border-surface-container-highest">
                <div className="bg-surface-container p-2.5 rounded-lg border border-surface-container-highest shadow-sm">
                  <div className="text-[10px] text-secondary">Reconstruction MSE</div>
                  <div className="font-mono font-bold text-on-surface text-sm">{activePoint.health_index_mse.toFixed(5)}</div>
                </div>
                <div className="bg-surface-container p-2.5 rounded-lg border border-surface-container-highest shadow-sm">
                  <div className="text-[10px] text-secondary">3σ Baseline Threshold</div>
                  <div className="font-mono font-bold text-on-surface text-sm">{asset.threshold3Sigma.toFixed(4)}</div>
                </div>
                <div className="bg-surface-container p-2.5 rounded-lg border border-surface-container-highest shadow-sm">
                  <div className="text-[10px] text-secondary">Threshold Ratio</div>
                  <div className={`font-mono font-bold text-sm ${mseRatio > 1.0 ? 'text-tertiary' : 'text-primary'}`}>
                    {mseRatio.toFixed(2)}x
                  </div>
                </div>
                <div className="bg-surface-container p-2.5 rounded-lg border border-surface-container-highest shadow-sm">
                  <div className="text-[10px] text-secondary">Degradation Knee Point</div>
                  <div className="font-mono font-bold text-on-surface text-sm">Cycle {asset.kneePoint}</div>
                </div>
              </div>
              <p className="text-secondary text-[11px] pt-1">
                <strong className="text-on-surface">Autoencoder Anomaly Pipeline:</strong> Deep PyTorch Autoencoder trained on healthy baseline runs. When mechanical wear starts after cycle {asset.kneePoint}, multi-channel cross-correlations fracture, breaching the statistical 3σ threshold ({asset.threshold3Sigma.toFixed(4)}).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
