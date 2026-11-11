import React, { useState } from 'react';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Plus,
  RefreshCw,
  ClipboardList,
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers,
  FileCheck
} from 'lucide-react';
import { MachineAsset, WorkOrder } from '../types/telemetry';

interface MaintenanceOpsPanelProps {
  asset: MachineAsset;
  currentCycle: number;
  workOrders: WorkOrder[];
  onUpdateStatus: (orderId: string, status: 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED') => void;
  onRecalibrateAsset: (assetId: string) => void;
  onCreateWorkOrder: (order: Omit<WorkOrder, 'id' | 'createdAt'>) => void;
}

export const MaintenanceOpsPanel: React.FC<MaintenanceOpsPanelProps> = ({
  asset,
  currentCycle,
  workOrders,
  onUpdateStatus,
  onRecalibrateAsset,
  onCreateWorkOrder,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED'>('ALL');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<'CRITICAL' | 'HIGH' | 'MEDIUM'>('HIGH');
  const [newTech, setNewTech] = useState('Senior Line Specialist M. Vance');
  const [newAction, setNewAction] = useState('');

  const filteredOrders = workOrders.filter((wo) => {
    if (filter === 'ALL') return true;
    return wo.status === filter;
  });

  const activeCount = workOrders.filter((w) => w.status !== 'RESOLVED').length;
  const resolvedCount = workOrders.filter((w) => w.status === 'RESOLVED').length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onCreateWorkOrder({
      assetId: asset.id,
      assetName: asset.name,
      cycle: currentCycle,
      priority: newPriority,
      title: newTitle.trim(),
      status: 'DISPATCHED',
      technician: newTech.trim() || 'Assigned Crew',
      actionRequired: newAction.trim() || 'Execute standard diagnostic borescope and wear realignment protocol.',
    });
    setNewTitle('');
    setNewAction('');
    setIsCreateModalOpen(false);
  };

  return (
    <div className="space-y-6 font-body">
      {/* 1. Station Context Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container p-6 border border-surface-container-highest shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-2.5 py-1 rounded-full bg-primary text-on-primary text-xs font-semibold tracking-wide uppercase">
                Active Station
              </span>
              <span className="font-mono text-xs text-secondary">
                {asset.name} · S/N: {asset.id.toUpperCase()}-8842
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs text-secondary font-mono">
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                Live Stream 100Hz
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-headline font-bold text-on-surface tracking-tight">
              Maintenance Operations & Work Order Dispatch
            </h1>
            <p className="text-xs text-secondary max-w-2xl leading-relaxed">
              Closed-loop condition-based dispatch system. Logged interventions recalibrate
              sensor baselines and restore operational runway for mission-critical hardware.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold text-xs transition-all shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Create Work Order</span>
            </button>
            <button
              onClick={() => onRecalibrateAsset(asset.id)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface hover:bg-surface-container-high text-on-surface border border-surface-container-highest text-xs font-semibold transition-all shadow-sm"
              title="Reset asset cycle wear to calibrated baseline"
            >
              <RefreshCw className="w-4 h-4 text-primary" />
              <span>Recalibrate Machine</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Operations KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface rounded-xl p-5 border border-surface-container-highest shadow-sm">
          <div className="flex items-center justify-between text-secondary text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Total Work Orders</span>
            <ClipboardList className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-headline font-bold font-mono text-on-surface">{workOrders.length}</div>
          <div className="text-[11px] text-secondary mt-1">Recorded in fleet audit trail</div>
        </div>

        <div className="bg-surface rounded-xl p-5 border border-surface-container-highest shadow-sm">
          <div className="flex items-center justify-between text-secondary text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Pending Interventions</span>
            <AlertTriangle className="w-4 h-4 text-tertiary" />
          </div>
          <div className="text-2xl font-headline font-bold font-mono text-tertiary">{activeCount}</div>
          <div className="text-[11px] text-secondary mt-1">Requires crew staging</div>
        </div>

        <div className="bg-surface rounded-xl p-5 border border-surface-container-highest shadow-sm">
          <div className="flex items-center justify-between text-secondary text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Resolved Overhauls</span>
            <CheckCircle2 className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-headline font-bold font-mono text-primary">{resolvedCount}</div>
          <div className="text-[11px] text-secondary mt-1">Full restoration complete</div>
        </div>

        <div className="bg-surface rounded-xl p-5 border border-surface-container-highest shadow-sm">
          <div className="flex items-center justify-between text-secondary text-xs mb-1">
            <span className="font-semibold uppercase tracking-wider font-mono text-[11px]">Intervention Efficacy</span>
            <ShieldCheck className="w-4 h-4 text-primary" />
          </div>
          <div className="text-2xl font-headline font-bold font-mono text-on-surface">100%</div>
          <div className="text-[11px] text-primary mt-1 font-medium">Zero catastrophic failures</div>
        </div>
      </div>

      {/* 3. Filter Navigation & Work Orders Table */}
      <div className="bg-surface rounded-2xl p-5 border border-surface-container-highest shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-surface-container pb-4">
          <div className="flex items-center gap-1.5 bg-surface-container p-1 rounded-xl border border-surface-container-highest text-xs">
            {(['ALL', 'DISPATCHED', 'IN_PROGRESS', 'RESOLVED'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                  filter === tab
                    ? 'bg-surface text-on-surface shadow-sm font-semibold'
                    : 'text-secondary hover:text-on-surface'
                }`}
              >
                {tab.replace('_', ' ')}
                {tab === 'ALL' && ` (${workOrders.length})`}
                {tab === 'DISPATCHED' &&
                  ` (${workOrders.filter((w) => w.status === 'DISPATCHED').length})`}
                {tab === 'IN_PROGRESS' &&
                  ` (${workOrders.filter((w) => w.status === 'IN_PROGRESS').length})`}
                {tab === 'RESOLVED' &&
                  ` (${workOrders.filter((w) => w.status === 'RESOLVED').length})`}
              </button>
            ))}
          </div>

          <div className="text-xs text-secondary font-mono">
            Current Lifespan: <span className="font-mono text-on-surface font-bold">{currentCycle} {asset.timeUnit}</span>
          </div>
        </div>

        {/* Work Order Cards */}
        {filteredOrders.length === 0 ? (
          <div className="py-12 text-center text-secondary text-xs">
            No work orders currently match this filter.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredOrders.map((wo) => {
              const isResolved = wo.status === 'RESOLVED';
              const isInProgress = wo.status === 'IN_PROGRESS';

              return (
                <div
                  key={wo.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isResolved
                      ? 'bg-surface-container-low border-surface-container-highest/60 opacity-80'
                      : wo.priority === 'CRITICAL'
                      ? 'bg-error-container/30 border-error/40'
                      : 'bg-surface-container-low border-surface-container-highest hover:border-outline/40'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-bold text-on-surface tracking-wider">
                          {wo.id}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            wo.priority === 'CRITICAL'
                              ? 'bg-error-container text-error border border-error/30'
                              : wo.priority === 'HIGH'
                              ? 'bg-tertiary-container text-on-tertiary-container border border-tertiary/30'
                              : 'bg-surface-container text-secondary border border-surface-container-highest'
                          }`}
                        >
                          {wo.priority}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                            isResolved
                              ? 'bg-primary-container text-primary border border-primary/30'
                              : isInProgress
                              ? 'bg-primary-container text-on-primary-container border border-primary/30 animate-pulse'
                              : 'bg-tertiary-container text-on-tertiary-container border border-tertiary/30'
                          }`}
                        >
                          {wo.status.replace('_', ' ')}
                        </span>
                        <span className="text-secondary text-xs font-mono">
                          Triggered at Cycle {wo.cycle}
                        </span>
                      </div>

                      <h3 className="text-sm font-headline font-semibold text-on-surface">{wo.title}</h3>
                      <p className="text-xs text-secondary leading-relaxed">{wo.actionRequired}</p>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-secondary pt-1 font-mono">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-secondary" />
                          {wo.technician}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-secondary" />
                          {new Date(wo.createdAt).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-surface-container">
                      {wo.status === 'DISPATCHED' && (
                        <button
                          onClick={() => onUpdateStatus(wo.id, 'IN_PROGRESS')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-tertiary hover:opacity-90 text-on-tertiary text-xs font-semibold transition-colors shadow-sm"
                        >
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Start Service</span>
                        </button>
                      )}

                      {wo.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => onUpdateStatus(wo.id, 'RESOLVED')}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold transition-colors shadow-sm"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Resolved</span>
                        </button>
                      )}

                      {isResolved && (
                        <span className="text-xs font-mono text-primary font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Service Logged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Create Work Order Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2e3230]/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-surface border border-surface-container-highest rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-on-surface">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <h2 className="text-base font-headline font-semibold text-on-surface flex items-center gap-2">
                <Wrench className="w-4 h-4 text-primary" />
                Dispatch New Maintenance Ticket
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-secondary hover:text-on-surface text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-secondary font-semibold uppercase tracking-wider mb-1 font-mono text-[11px]">
                  Ticket Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HPT Stage 1 Nozzle Guide Vane Borescope"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-secondary font-semibold uppercase tracking-wider mb-1 font-mono text-[11px]">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  >
                    <option value="CRITICAL">CRITICAL</option>
                    <option value="HIGH">HIGH</option>
                    <option value="MEDIUM">MEDIUM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-secondary font-semibold uppercase tracking-wider mb-1 font-mono text-[11px]">
                    Assigned Specialist
                  </label>
                  <input
                    type="text"
                    value={newTech}
                    onChange={(e) => setNewTech(e.target.value)}
                    className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-secondary font-semibold uppercase tracking-wider mb-1 font-mono text-[11px]">
                  Action &amp; Inspection Protocol
                </label>
                <textarea
                  rows={3}
                  placeholder="Specify replacement parts, inspection checkpoints, and safety lockouts..."
                  value={newAction}
                  onChange={(e) => setNewAction(e.target.value)}
                  className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-surface-container">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-3.5 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-secondary hover:text-on-surface font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-on-primary font-semibold shadow-sm"
                >
                  Dispatch Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
