import React from 'react';
import { Plus, Bot, ChevronDown, ClipboardList } from 'lucide-react';
import { MachineAsset } from '../types/telemetry';

interface CleanTopNavProps {
  assets: MachineAsset[];
  selectedAssetId: string;
  onSelectAsset: (id: string) => void;
  onOpenAddModal: () => void;
  activeTab: 'overview' | 'models' | 'roi' | 'maintenance';
  onSelectTab: (tab: 'overview' | 'models' | 'roi' | 'maintenance') => void;
  isCopilotOpen: boolean;
  onToggleCopilot: () => void;
  workOrderCount?: number;
  systemStatus?: {
    mlEngine?: { online: boolean; target?: string };
    copilotAi?: { configured: boolean; model?: string };
  } | null;
}

export const CleanTopNav: React.FC<CleanTopNavProps> = ({
  assets,
  selectedAssetId,
  onSelectAsset,
  onOpenAddModal,
  activeTab,
  onSelectTab,
  isCopilotOpen,
  onToggleCopilot,
  workOrderCount = 0,
  systemStatus,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-surface-container-highest px-6 py-3 transition-all shadow-sm">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Machine Asset Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
              <span className="material-symbols-outlined text-[20px]">psychology</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline font-semibold text-lg text-on-surface tracking-tight">
                  Sentry IQ
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary-container text-on-primary-container font-semibold tracking-wide uppercase">
                  FLEET
                </span>
              </div>
            </div>
          </div>

          <div className="h-5 w-px bg-surface-container-highest hidden sm:block" />

          {/* Machine Dropdown Selector */}
          <div className="flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-xl border border-surface-container-highest/80 hover:border-outline/40 transition-colors">
            <span className="material-symbols-outlined text-primary text-[18px]">turbine</span>
            <select
              value={selectedAssetId}
              onChange={(e) => onSelectAsset(e.target.value)}
              className="bg-transparent font-medium text-xs text-on-surface focus:outline-none cursor-pointer pr-4 appearance-none"
            >
              {assets.map((asset) => (
                <option key={asset.id} value={asset.id} className="bg-surface text-on-surface">
                  {asset.name} ({asset.category})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-secondary pointer-events-none -ml-2" />
          </div>

          <button
            onClick={onOpenAddModal}
            className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 text-xs text-secondary hover:text-on-surface bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl transition-all"
            title="Register new machine asset"
          >
            <Plus className="w-3.5 h-3.5 text-primary" />
            <span>Add Asset</span>
          </button>
        </div>

        {/* Center: Navigation Tabs matching Stitch */}
        <nav className="hidden md:flex items-center bg-surface-container p-1 rounded-xl border border-surface-container-highest text-xs font-semibold text-secondary">
          <button
            onClick={() => onSelectTab('overview')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'overview'
                ? 'bg-surface text-on-surface shadow-sm font-semibold'
                : 'hover:text-on-surface'
            }`}
          >
            Health Overview
          </button>
          <button
            onClick={() => onSelectTab('models')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'models'
                ? 'bg-surface text-on-surface shadow-sm font-semibold'
                : 'hover:text-on-surface'
            }`}
          >
            Diagnostics &amp; RUL
          </button>
          <button
            onClick={() => onSelectTab('roi')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'roi'
                ? 'bg-surface text-on-surface shadow-sm font-semibold'
                : 'hover:text-on-surface'
            }`}
          >
            Financial ROI
          </button>
          <button
            onClick={() => onSelectTab('maintenance')}
            className={`px-3.5 py-1.5 rounded-lg transition-all ${
              activeTab === 'maintenance'
                ? 'bg-surface text-on-surface shadow-sm font-semibold'
                : 'hover:text-on-surface'
            }`}
          >
            Maintenance Ops
          </button>
        </nav>

        {/* Right: Status Pill & Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Work Orders Pill */}
          <button
            onClick={() => onSelectTab('maintenance')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              activeTab === 'maintenance'
                ? 'bg-surface text-on-surface border-primary shadow-sm font-semibold'
                : 'bg-surface-container hover:bg-surface-container-high border-surface-container-highest text-on-surface'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-tertiary" />
            <span className="hidden sm:inline">Orders</span>
            {workOrderCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-tertiary text-on-tertiary text-[10px] flex items-center justify-center font-bold font-mono">
                {workOrderCount}
              </span>
            )}
          </button>

          {/* AI Copilot Toggle */}
          <button
            onClick={onToggleCopilot}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isCopilotOpen
                ? 'bg-primary text-on-primary border-primary shadow-sm'
                : 'bg-surface-container hover:bg-surface-container-high border-surface-container-highest text-on-surface'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
