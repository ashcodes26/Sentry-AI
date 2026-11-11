import React, { useEffect } from 'react';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { MachineAsset } from '../types/telemetry';

interface CleanTimelineProps {
  asset: MachineAsset;
  currentCycle: number;
  onCycleChange: (cycle: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  onAnomalyIntercept?: () => void;
}

export const CleanTimeline: React.FC<CleanTimelineProps> = ({
  asset,
  currentCycle,
  onCycleChange,
  isPlaying,
  onTogglePlay,
  speed,
  onSpeedChange,
  onAnomalyIntercept,
}) => {
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      if (currentCycle < asset.kneePoint && currentCycle + speed >= asset.kneePoint) {
        onCycleChange(asset.kneePoint);
        onTogglePlay();
        if (onAnomalyIntercept) {
          onAnomalyIntercept();
        }
        return;
      }

      onCycleChange(Math.min(asset.maxLife, currentCycle + speed));
    }, 120);
    return () => clearInterval(interval);
  }, [isPlaying, currentCycle, asset.maxLife, asset.kneePoint, speed, onCycleChange, onTogglePlay, onAnomalyIntercept]);

  useEffect(() => {
    if (currentCycle >= asset.maxLife && isPlaying) {
      onTogglePlay();
    }
  }, [currentCycle, asset.maxLife, isPlaying, onTogglePlay]);

  const kneePointPercent = Math.max(0, Math.min(100, ((asset.kneePoint - 1) / (asset.maxLife - 1)) * 100));

  return (
    <div className="bg-surface rounded-2xl p-4 sm:p-5 border border-surface-container-highest shadow-sm space-y-3">
      {/* Sub-banner: Playback Bar directly from Stitch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface-container-low rounded-xl p-3 border border-surface-container-highest/60">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface text-xs font-semibold text-secondary shadow-sm">
            <span className="material-symbols-outlined text-primary text-[15px]">verified</span>
            Live Stream Verified
          </span>
          <span className="text-xs text-on-surface-variant font-mono">
            ID: {asset.id.toUpperCase()}-SN84920
          </span>
        </div>

        {/* Scrubber Playback Controls */}
        <div className="flex items-center gap-2.5 text-xs">
          <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-surface-container-highest">
            <button
              onClick={onTogglePlay}
              className={`w-7 h-7 rounded hover:bg-surface flex items-center justify-center transition-colors ${
                isPlaying ? 'text-tertiary bg-surface font-bold' : 'text-on-surface'
              }`}
              title={isPlaying ? 'Pause' : 'Play Simulation'}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            </button>
            <button
              onClick={() => onCycleChange(Math.max(1, currentCycle - 5))}
              className="w-6 h-7 rounded hover:bg-surface flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
              title="Step -5"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCycleChange(Math.min(asset.maxLife, currentCycle + 5))}
              className="w-6 h-7 rounded hover:bg-surface flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
              title="Step +5"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onCycleChange(1)}
              className="w-6 h-7 rounded hover:bg-surface flex items-center justify-center text-secondary hover:text-on-surface transition-colors"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 bg-surface-container px-3 py-1 rounded-lg border border-surface-container-highest font-mono">
            <span className="text-secondary text-[11px] uppercase">{asset.timeUnit}</span>
            <span className="font-bold text-on-surface">{currentCycle}</span>
            <span className="text-secondary text-[11px]">/ {asset.maxLife}</span>
          </div>

          <span className="text-xs text-tertiary font-medium hidden md:inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Knee point at {asset.timeUnit.slice(0, -1)} {asset.kneePoint}
          </span>
        </div>
      </div>

      {/* Scrub Bar Slider */}
      <div className="relative pt-2 pb-1">
        <div className="relative w-full">
          <input
            type="range"
            min={1}
            max={asset.maxLife}
            value={currentCycle}
            onChange={(e) => onCycleChange(Number(e.target.value))}
            className="w-full h-2.5 bg-surface-container-high rounded-lg appearance-none cursor-pointer accent-primary focus:outline-none"
          />

          {/* Knee point marker indicator on track */}
          <div
            className="absolute top-0 transform -translate-x-1/2 pointer-events-none flex flex-col items-center"
            style={{ left: `${kneePointPercent}%` }}
          >
            <div className="w-1.5 h-3.5 bg-tertiary rounded-sm shadow-sm" />
          </div>
        </div>

        <div className="flex justify-between items-center text-[11px] text-secondary font-mono mt-1.5 px-1">
          <span>Nominal Baseline ({asset.timeUnit} 1)</span>
          <span className="text-tertiary font-semibold">
            Onset Knee Point ({asset.kneePoint} {asset.timeUnit})
          </span>
          <span className="text-error font-semibold">
            Max Lifespan ({asset.maxLife} {asset.timeUnit})
          </span>
        </div>
      </div>
    </div>
  );
};
