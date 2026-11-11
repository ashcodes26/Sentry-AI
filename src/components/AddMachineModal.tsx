import React, { useState } from 'react';
import { X, Plus, Cpu, Zap, Droplets } from 'lucide-react';
import { MachineType } from '../types/telemetry';
import { MACHINE_TYPE_TEMPLATES } from '../utils/engineSimulation';

interface AddMachineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddMachine: (
    name: string,
    type: MachineType,
    location: string,
    criticality: 'Critical' | 'High' | 'Medium',
    lifespan: number
  ) => void;
}

export const AddMachineModal: React.FC<AddMachineModalProps> = ({
  isOpen,
  onClose,
  onAddMachine,
}) => {
  const [selectedType, setSelectedType] = useState<MachineType>('transformer');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [criticality, setCriticality] = useState<'Critical' | 'High' | 'Medium'>('High');
  const [lifespan, setLifespan] = useState(200);

  if (!isOpen) return null;

  const machineOptions: Array<{
    type: MachineType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    defaultName: string;
    defaultLoc: string;
    costInfo: string;
  }> = [
    {
      type: 'transformer',
      label: 'HV Power Transformer',
      icon: Zap,
      defaultName: 'Substation Transformer TX-500',
      defaultLoc: 'East Grid Substation · 230kV',
      costInfo: '$450k Unplanned / $22k Scheduled',
    },
    {
      type: 'turbofan',
      label: 'Aviation Turbofan Engine',
      icon: Cpu,
      defaultName: 'Turbofan GE90-115B #03',
      defaultLoc: 'Boeing 777 · Wing Mount L',
      costInfo: '$180k Unplanned / $12k Scheduled',
    },
    {
      type: 'pump',
      label: 'Centrifugal Slurry Pump',
      icon: Droplets,
      defaultName: 'Heavy Slurry Pump P-404',
      defaultLoc: 'Refinery Processing Train C',
      costInfo: '$65k Unplanned / $4.5k Scheduled',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || machineOptions.find((m) => m.type === selectedType)?.defaultName || 'New Machine';
    const finalLoc = location.trim() || machineOptions.find((m) => m.type === selectedType)?.defaultLoc || 'Main Facility';
    onAddMachine(finalName, selectedType, finalLoc, criticality, lifespan);
    setName('');
    setLocation('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2e3230]/40 backdrop-blur-sm font-body">
      <div className="bg-surface border border-surface-container-highest rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden text-on-surface">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-container-highest bg-surface">
          <div>
            <h3 className="font-headline font-semibold text-base text-on-surface">Add Industrial Asset</h3>
            <p className="text-xs text-secondary mt-0.5">
              Deploy predictive maintenance monitoring to a new industrial machine
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-secondary hover:text-on-surface rounded-xl hover:bg-surface-container transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Machine Type Selector Cards */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-2 font-mono">
              Select Machine Category
            </label>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
              {machineOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = selectedType === opt.type;
                return (
                  <button
                    key={opt.type}
                    type="button"
                    onClick={() => {
                      setSelectedType(opt.type);
                      setLifespan(MACHINE_TYPE_TEMPLATES[opt.type].defaultLifespan);
                      if (!name) setName(opt.defaultName);
                      if (!location) setLocation(opt.defaultLoc);
                    }}
                    className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'bg-primary-container border-primary text-on-primary-container shadow-sm font-medium'
                        : 'bg-surface-container-low border-surface-container-highest text-secondary hover:text-on-surface hover:border-outline/40 shadow-xs'
                    }`}
                  >
                    <Icon className={`w-4 h-4 mb-2 ${isSelected ? 'text-primary' : 'text-secondary'}`} />
                    <span className="text-xs font-semibold">{opt.label}</span>
                    <span className="text-[10px] text-secondary mt-1 line-clamp-1">{opt.costInfo}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Machine Name & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5 font-mono">
                Asset Name / Identifier
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={machineOptions.find((m) => m.type === selectedType)?.defaultName}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5 font-mono">
                Installation Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={machineOptions.find((m) => m.type === selectedType)?.defaultLoc}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Criticality & Lifecycle Horizon */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5 font-mono">
                Operational Criticality
              </label>
              <select
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as any)}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              >
                <option value="Critical" className="bg-surface text-on-surface">Critical (Immediate Line Stoppage)</option>
                <option value="High" className="bg-surface text-on-surface">High Priority (Redundant Failover)</option>
                <option value="Medium" className="bg-surface text-on-surface">Medium (Auxiliary Support)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5 font-mono">
                Inspection Interval ({MACHINE_TYPE_TEMPLATES[selectedType].timeUnit})
              </label>
              <input
                type="number"
                min={100}
                max={400}
                value={lifespan}
                onChange={(e) => setLifespan(Number(e.target.value))}
                className="w-full bg-surface-container border border-surface-container-highest rounded-xl px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-surface-container-highest flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-secondary hover:text-on-surface transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary rounded-xl text-xs font-semibold transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Deploy Machine Monitor</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
