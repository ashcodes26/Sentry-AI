import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Sparkles, RefreshCw, X, Wrench, ShieldAlert } from 'lucide-react';
import { FinancialImpact, MachineAsset, TelemetryPoint } from '../types/telemetry';

export interface DispatchTicket {
  workOrderId: string;
  cycle: number;
  timestamp: number;
}

interface MachineCopilotProps {
  asset: MachineAsset;
  currentCycle: number;
  activePoint: TelemetryPoint;
  financials: FinancialImpact;
  onClose?: () => void;
  dispatchTicket?: DispatchTicket | null;
}

interface Message {
  id: string;
  sender: 'copilot' | 'user';
  text: string;
  timestamp: string;
}

export const MachineCopilot: React.FC<MachineCopilotProps> = ({
  asset,
  currentCycle,
  activePoint,
  financials,
  onClose,
  dispatchTicket,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-generate diagnosis when asset or lifecycle milestone changes
  useEffect(() => {
    generateAutomatedDiagnosis();
  }, [asset.id, Math.floor(currentCycle / 20)]);

  // Listen for emergency work order dispatch event
  useEffect(() => {
    if (!dispatchTicket) return;

    const dispatchMsg: Message = {
      id: `wo-${dispatchTicket.timestamp}`,
      sender: 'copilot',
      text: `🚨 **OFFICIAL WORK ORDER DISPATCHED: [${dispatchTicket.workOrderId}]**

**Priority:** P1 - Urgent Preventive Overhaul
**Target Asset:** ${asset.name} (${asset.category} · ${asset.location})
**Trigger Point:** Cycle ${dispatchTicket.cycle} / ${asset.maxLife} (${activePoint.health_index_mse.toFixed(4)} MSE vs 3-Sigma ${asset.threshold3Sigma.toFixed(4)})
**Projected Remaining Life (RUL):** ${Math.round(activePoint.RUL_pred)} ${asset.timeUnit}
**Financial Protection:** $${financials.avoidedLoss.toLocaleString()} in Avoided Catastrophic Outage Losses

---
*Autonomous field protocol activated: Maintenance crew dispatched with borescope & vibration diagnostic package.*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, dispatchMsg]);
  }, [dispatchTicket]);

  const generateAutomatedDiagnosis = async () => {
    const prompt = `Perform an executive predictive maintenance diagnosis for ${asset.name} at cycle ${currentCycle} of ${asset.maxLife} ${asset.timeUnit}.
Current Condition: ${financials.status}
Autoencoder Anomaly MSE: ${activePoint.health_index_mse.toFixed(4)} (Threshold: ${asset.threshold3Sigma.toFixed(4)})
Predicted Remaining Useful Life (RUL): ${Math.round(activePoint.RUL_pred)} ${asset.timeUnit}
Potential Avoided Loss: $${financials.avoidedLoss.toLocaleString()}
Sensors with elevated variance: ${asset.sensors
      .filter((s) => {
        const val = Number(activePoint[s.key as keyof TelemetryPoint] || 0);
        return Math.abs(((val - s.baseline) / (s.baseline || 1)) * 100) > 8;
      })
      .map((s) => s.name)
      .join(', ') || 'None (all within nominal thresholds)'}.
Provide:
1. Operational Risk Assessment
2. Root Cause Analysis
3. Recommended Engineering Action and financial impact.`;

    await sendMessageToApi(prompt, true);
  };

  const sendMessageToApi = async (userPrompt: string, isAutomated: boolean) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/copilot/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          context: {
            assetName: asset.name,
            assetCategory: asset.category,
            currentCycle,
            maxLife: asset.maxLife,
            timeUnit: asset.timeUnit,
            health_index_mse: activePoint.health_index_mse,
            threshold3Sigma: asset.threshold3Sigma,
            kneePoint: asset.kneePoint,
            RUL_pred: activePoint.RUL_pred,
            status: financials.status,
            avoidedLoss: financials.avoidedLoss,
            sensors: asset.sensors.map((s) => ({
              name: s.name,
              value: activePoint[s.key as keyof TelemetryPoint],
              unit: s.unit,
              baseline: s.baseline,
            })),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();
      const newMsg: Message = {
        id: Date.now().toString(),
        sender: 'copilot',
        text: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (isAutomated) {
        setMessages([newMsg]);
      } else {
        setMessages((prev) => [...prev, newMsg]);
      }
    } catch {
      // Heuristic fallback
      const fallbackMsg: Message = {
        id: Date.now().toString(),
        sender: 'copilot',
        text: `**Aero-Copilot Assessment (${asset.name}):**\nCondition is **${financials.status}** with **${Math.round(activePoint.RUL_pred)} ${asset.timeUnit}** remaining. ${
          activePoint.RUL_pred < 35
            ? `Recommended Action: Schedule preventive overhaul now to protect $${financials.avoidedLoss.toLocaleString()} in unscheduled outage losses.`
            : `System is running stably within normal operational envelopes.`
        }`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      if (isAutomated) {
        setMessages([fallbackMsg]);
      } else {
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    } finally {
      setIsLoading(false);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue.trim();
    setInputValue('');

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    await sendMessageToApi(userText, false);
  };

  const quickPrompts = [
    { label: 'Condition Summary', prompt: `Summarize the operational health of ${asset.name} in plain terms.` },
    { label: 'Recommended Action', prompt: `What maintenance procedure should be executed for ${asset.name} right now?` },
    { label: 'Financial Savings', prompt: `Explain the cost avoidance between scheduled service and catastrophic failure for this machine.` },
    { label: 'Delay Risk (+10 Cycles)', prompt: `What happens to failure risk and financial liability if maintenance is delayed by 10 ${asset.timeUnit}?` },
    { label: 'NASA Penalty Metric', prompt: `Explain the NASA asymmetric scoring penalty formula and how our prediction protects against late failure.` },
  ];

  return (
    <div className="bg-surface border border-surface-container-highest rounded-2xl flex flex-col h-full shadow-lg overflow-hidden font-body">
      {/* Header */}
      <div className="px-5 py-4 bg-surface border-b border-surface-container-highest flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-headline font-semibold text-base text-on-surface tracking-tight">
                Reliability Copilot
              </h3>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Live · AI Agent
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-secondary mt-0.5 font-mono">
              <span>Scope:</span>
              <span className="text-on-surface font-semibold bg-surface-container px-1.5 py-0.2 rounded border border-surface-container-highest">
                {asset.name}
              </span>
              <span>·</span>
              <span>{currentCycle} {asset.timeUnit}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => generateAutomatedDiagnosis()}
            disabled={isLoading}
            title="Refresh Diagnostic"
            className="p-2 text-secondary hover:text-on-surface bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl disabled:opacity-40 transition-colors shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-primary' : ''}`} />
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-secondary hover:text-on-surface bg-surface-container hover:bg-surface-container-high border border-surface-container-highest rounded-xl transition-colors shadow-sm"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="px-4 py-2 bg-surface-container border-b border-surface-container-highest flex items-center gap-1.5 overflow-x-auto scrollbar-thin">
        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mr-1" />
        {quickPrompts.map((qp, idx) => (
          <button
            key={idx}
            onClick={() => {
              setInputValue(qp.prompt);
              sendMessageToApi(qp.prompt, false);
            }}
            disabled={isLoading}
            className="text-[11px] px-3 py-1 rounded-full bg-surface hover:bg-surface-container-high text-on-surface border border-surface-container-highest transition-colors whitespace-nowrap shrink-0 disabled:opacity-40 shadow-xs font-medium"
          >
            {qp.label}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="p-4 flex-1 overflow-y-auto space-y-3 min-h-[220px] max-h-[380px] bg-surface-container-low">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[92%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-primary text-on-primary shadow-sm font-medium'
                  : m.id.startsWith('wo-')
                  ? 'bg-surface border-2 border-error/50 text-on-surface shadow-md'
                  : 'bg-surface border border-surface-container-highest text-on-surface shadow-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{m.text}</div>
            </div>
            <span className="text-[10px] text-secondary mt-1 px-1 font-mono">
              {m.sender === 'user' ? 'You' : 'Copilot'} · {m.timestamp}
            </span>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-secondary bg-surface border border-surface-container-highest rounded-xl px-3.5 py-2.5 w-fit shadow-xs">
            <RefreshCw className="w-3 h-3 animate-spin text-primary" />
            <span>Analyzing machine telemetry...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-surface border-t border-surface-container-highest flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={`Ask about ${asset.name} health or maintenance...`}
          className="flex-1 bg-surface-container border border-surface-container-highest rounded-xl px-3.5 py-2 text-xs text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isLoading}
          className="px-4 py-2 bg-primary hover:bg-primary/90 text-on-primary font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5 disabled:opacity-40 shadow-sm"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
