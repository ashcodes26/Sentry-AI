/**
 * SENTRY (PredictIQ) · Multi-Asset Industrial IoT Predictive Maintenance
 * Redesigned with Google Stitch Design System & Complete Maintenance Operations
 */

import React, { useState, useMemo, useEffect } from 'react';
import { CleanTopNav } from './components/CleanTopNav';
import { CleanAssetHero } from './components/CleanAssetHero';
import { CleanTimeline } from './components/CleanTimeline';
import { CleanSensorGrid } from './components/CleanSensorGrid';
import { HealthIndexRulChart } from './components/HealthIndexRulChart';
import { VenturePitchPanel } from './components/VenturePitchPanel';
import { MachineCopilot, DispatchTicket } from './components/MachineCopilot';
import { MaintenanceOpsPanel } from './components/MaintenanceOpsPanel';
import { AddMachineModal } from './components/AddMachineModal';
import { EmergencyInterceptModal } from './components/EmergencyInterceptModal';
import { getDefaultFleet, createCustomMachine, getAssetFinancialStatus } from './utils/engineSimulation';
import { MachineAsset, MachineType, WorkOrder } from './types/telemetry';

const INITIAL_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'WO-AERO-8841',
    assetId: 'turbofan-01',
    assetName: 'CFM-56 · Unit #01',
    cycle: 108,
    priority: 'HIGH',
    title: 'HPT Stage 1 Nozzle Guide Vane Borescope Inspection',
    status: 'IN_PROGRESS',
    technician: 'Senior Line Specialist M. Vance',
    actionRequired: 'Inspect thermal barrier coating erosion and check T50 exhaust gas thermocouple calibration.',
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    id: 'WO-XFMR-3902',
    assetId: 'transformer-01',
    assetName: 'HV Power Transformer 230kV',
    cycle: 142,
    priority: 'CRITICAL',
    title: 'Emergency DGA Degassing & Moisture Sieve Overhaul',
    status: 'DISPATCHED',
    technician: 'High-Voltage Field Crew Beta',
    actionRequired: 'Hydrogen (H2) and Methane (CH4) gas ratios indicate active thermal hotspot. Pull oil sample for breakdown voltage test.',
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    id: 'WO-PUMP-1029',
    assetId: 'pump-01',
    assetName: 'Centrifugal Slurry Pump #04',
    cycle: 84,
    priority: 'MEDIUM',
    title: 'Inboard Drive-End Bearing Vibration Re-alignment',
    status: 'RESOLVED',
    technician: 'Plant Mechanical Tech R. Diaz',
    actionRequired: 'Replaced outboard mechanical seal and repacked synthetic lubricant. Baseline vibration restored to 0.42 mm/s.',
    createdAt: Date.now() - 86400000,
    resolvedAt: Date.now() - 3600000 * 12,
  },
];

export default function App() {
  const [assets, setAssets] = useState<MachineAsset[]>(getDefaultFleet);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('turbofan-01');
  const [currentCycle, setCurrentCycle] = useState<number>(35);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(2);
  const [activeTab, setActiveTab] = useState<'overview' | 'models' | 'roi' | 'maintenance'>('overview');
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isInterceptModalOpen, setIsInterceptModalOpen] = useState<boolean>(false);
  const [dispatchTicket, setDispatchTicket] = useState<DispatchTicket | null>(null);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(INITIAL_WORK_ORDERS);
  const [systemStatus, setSystemStatus] = useState<{
    mlEngine?: { online: boolean; target?: string };
    copilotAi?: { configured: boolean; model?: string };
  } | null>(null);

  useEffect(() => {
    const checkStatus = () => {
      fetch('/api/system/status')
        .then((r) => r.json())
        .then((data) => setSystemStatus(data))
        .catch(() => setSystemStatus({ mlEngine: { online: false }, copilotAi: { configured: false } }));
    };
    checkStatus();
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  // Retrieve active asset
  const currentAsset = useMemo(() => {
    return assets.find((a) => a.id === selectedAssetId) || assets[0];
  }, [assets, selectedAssetId]);

  // Handle switching asset
  const handleSelectAsset = (id: string) => {
    setSelectedAssetId(id);
    setIsPlaying(false);
    setIsInterceptModalOpen(false);
    const targetAsset = assets.find((a) => a.id === id);
    if (targetAsset) {
      setCurrentCycle((prev) => Math.min(prev, targetAsset.maxLife));
    }
  };

  // Handle adding new machine
  const handleAddMachine = (
    name: string,
    type: MachineType,
    location: string,
    criticality: 'Critical' | 'High' | 'Medium',
    lifespan: number
  ) => {
    const newMachine = createCustomMachine(name, type, location, criticality, lifespan);
    setAssets((prev) => [newMachine, ...prev]);
    setSelectedAssetId(newMachine.id);
    setCurrentCycle(15);
    setIsPlaying(false);
    setIsInterceptModalOpen(false);
  };

  const safeCycle = Math.max(1, Math.min(currentAsset.maxLife, currentCycle));
  const activePoint = currentAsset.data[safeCycle - 1] || currentAsset.data[0];

  const financials = useMemo(() => {
    return getAssetFinancialStatus(safeCycle, activePoint, currentAsset);
  }, [safeCycle, activePoint, currentAsset]);

  // Intercept trigger from simulation timeline
  const handleAnomalyIntercept = () => {
    setIsInterceptModalOpen(true);
  };

  // User acknowledges intercept and dispatches SOP
  const handleAcknowledgeDispatch = () => {
    const ticketId = `WO-${currentAsset.type.toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTicket: DispatchTicket = {
      workOrderId: ticketId,
      cycle: safeCycle,
      timestamp: Date.now(),
    };
    setDispatchTicket(newTicket);

    // Auto-create persistent work order in state
    const newOrder: WorkOrder = {
      id: ticketId,
      assetId: currentAsset.id,
      assetName: currentAsset.name,
      cycle: safeCycle,
      priority: safeCycle > currentAsset.kneePoint * 1.3 ? 'CRITICAL' : 'HIGH',
      title: `Emergency Condition Intervention (${currentAsset.name})`,
      status: 'DISPATCHED',
      technician: 'Assigned On-Duty Reliability Lead',
      actionRequired: `Sensor reconstruction MSE departed nominal 3σ envelope at ${safeCycle} ${currentAsset.timeUnit}. Perform urgent component inspection.`,
      createdAt: Date.now(),
    };

    setWorkOrders((prev) => [newOrder, ...prev]);
    setIsInterceptModalOpen(false);
    setIsCopilotOpen(true);
  };

  // User continues simulation past the knee point
  const handleContinueSimulation = () => {
    setIsInterceptModalOpen(false);
    setIsPlaying(true);
  };

  // Work Order actions
  const handleUpdateWorkOrderStatus = (
    id: string,
    status: 'DISPATCHED' | 'IN_PROGRESS' | 'RESOLVED'
  ) => {
    setWorkOrders((prev) =>
      prev.map((wo) =>
        wo.id === id
          ? {
              ...wo,
              status,
              resolvedAt: status === 'RESOLVED' ? Date.now() : wo.resolvedAt,
            }
          : wo
      )
    );
  };

  const handleCreateWorkOrder = (orderData: Omit<WorkOrder, 'id' | 'createdAt'>) => {
    const newOrder: WorkOrder = {
      ...orderData,
      id: `WO-${orderData.assetId.slice(0, 4).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: Date.now(),
    };
    setWorkOrders((prev) => [newOrder, ...prev]);
  };

  const handleRecalibrateAsset = (assetId: string) => {
    setCurrentCycle(15);
    setIsPlaying(false);

    // Log resolved recalibration ticket
    const recalibrationOrder: WorkOrder = {
      id: `WO-CAL-${Math.floor(1000 + Math.random() * 9000)}`,
      assetId,
      assetName: currentAsset.name,
      cycle: safeCycle,
      priority: 'MEDIUM',
      title: `Full Restoration & Recalibration Overhaul (${currentAsset.name})`,
      status: 'RESOLVED',
      technician: 'Chief Reliability Engineer',
      actionRequired: 'All degraded mechanical wear elements replaced. Baseline sensor envelope recalibrated.',
      createdAt: Date.now() - 60000,
      resolvedAt: Date.now(),
    };
    setWorkOrders((prev) => [recalibrationOrder, ...prev]);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface flex flex-col font-body selection:bg-primary-container selection:text-on-primary-container">
      {/* 1. Stitch-Style Top Navigation Bar */}
      <CleanTopNav
        assets={assets}
        selectedAssetId={selectedAssetId}
        onSelectAsset={handleSelectAsset}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCopilotOpen={isCopilotOpen}
        onToggleCopilot={() => setIsCopilotOpen((prev) => !prev)}
        workOrderCount={workOrders.filter((w) => w.status !== 'RESOLVED').length}
        systemStatus={systemStatus}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Stitch-Style Asset Hero Card (Radial Vitality Gauge) */}
        <CleanAssetHero
          asset={currentAsset}
          currentCycle={safeCycle}
          activePoint={activePoint}
          financials={financials}
        />

        {/* Stitch-Style Timeline Scrubber & Sub-Banner Controls */}
        <CleanTimeline
          asset={currentAsset}
          currentCycle={safeCycle}
          onCycleChange={setCurrentCycle}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying((p) => !p)}
          speed={speed}
          onSpeedChange={setSpeed}
          onAnomalyIntercept={handleAnomalyIntercept}
        />

        {/* Content Tabs & Optional Copilot Sidecar */}
        <div className={`grid grid-cols-1 ${isCopilotOpen ? 'lg:grid-cols-12 gap-6' : ''}`}>
          {/* Main Content Pane */}
          <div className={isCopilotOpen ? 'lg:col-span-8' : 'w-full'}>
            {activeTab === 'overview' && (
              <CleanSensorGrid
                asset={currentAsset}
                currentCycle={safeCycle}
                activePoint={activePoint}
              />
            )}

            {activeTab === 'models' && (
              <HealthIndexRulChart
                data={currentAsset.data}
                currentCycle={safeCycle}
                maxCycles={currentAsset.maxLife}
                kneePoint={currentAsset.kneePoint}
                threshold3Sigma={currentAsset.threshold3Sigma}
                timeUnit={currentAsset.timeUnit}
              />
            )}

            {activeTab === 'roi' && (
              <VenturePitchPanel
                asset={currentAsset}
                data={currentAsset.data}
                currentCycle={safeCycle}
                financials={financials}
              />
            )}

            {activeTab === 'maintenance' && (
              <MaintenanceOpsPanel
                asset={currentAsset}
                currentCycle={safeCycle}
                workOrders={workOrders}
                onUpdateStatus={handleUpdateWorkOrderStatus}
                onRecalibrateAsset={handleRecalibrateAsset}
                onCreateWorkOrder={handleCreateWorkOrder}
              />
            )}
          </div>

          {/* Machine Copilot Slide-Over / Sidecar */}
          {isCopilotOpen && (
            <div className="lg:col-span-4">
              <div className="sticky top-20">
                <MachineCopilot
                  asset={currentAsset}
                  currentCycle={safeCycle}
                  activePoint={activePoint}
                  financials={financials}
                  onClose={() => setIsCopilotOpen(false)}
                  dispatchTicket={dispatchTicket}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="pt-6 pb-4 border-t border-surface-container-highest flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-secondary font-body">
          <div>
            <span className="font-semibold text-on-surface">SENTRY (PredictIQ)</span>
            <span className="mx-2 text-outline-variant">·</span>
            <span>Enterprise Fleet Reliability & Digital Twin Platform</span>
          </div>
        </footer>
      </main>

      {/* Emergency Anomaly Intercept Modal */}
      <EmergencyInterceptModal
        isOpen={isInterceptModalOpen}
        asset={currentAsset}
        currentCycle={safeCycle}
        activePoint={activePoint}
        financials={financials}
        onAcknowledgeDispatch={handleAcknowledgeDispatch}
        onContinue={handleContinueSimulation}
      />

      {/* Modal: Add Custom Machine */}
      <AddMachineModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddMachine={handleAddMachine}
      />
    </div>
  );
}
