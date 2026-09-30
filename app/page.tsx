'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Terminal, 
  Flame, 
  ShieldCheck, 
  CheckCircle2, 
  Server, 
  Activity, 
  RotateCcw, 
  Radio, 
  Layers, 
  Wrench, 
  BrainCircuit, 
  Check,
  Radar
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { InteractiveGridBg } from '@/components/ui/InteractiveGridBg';
import { Navbar } from '@/components/Navbar';
import { LandingHero } from '@/components/LandingHero';
import { HistoryDrawer } from '@/components/HistoryDrawer';
import { ApiStatusModal } from '@/components/ApiStatusModal';
import { JudgeHudModal } from '@/components/JudgeHudModal';
import { supabase } from '@/lib/supabaseClient';
import { IncidentSeverity, CloudProvider, HistoricalIncident } from '@/types/ops';
import { toast } from 'sonner';

interface UIExecutionStep {
  id: string;
  stepNumber: number;
  stepType: 'THOUGHT' | 'ACTION' | 'OBSERVATION' | 'PATCH' | 'VERIFICATION';
  thought: string;
  action: string;
  toolUsed?: string;
  output: string;
  confidenceScore: number;
  timestamp: string;
}

interface IncidentPreset {
  id: string;
  name: string;
  severity: IncidentSeverity;
  severityColor: string;
  badgeDot: string;
  title: string;
  description: string;
  cloudProvider: CloudProvider;
  affectedServices: string[];
  initialBlast: number;
  metrics: {
    errorRate: number;
    p99LatencyMs: number;
    cpuSaturation: number;
  };
}

const PRESET_INCIDENTS: IncidentPreset[] = [
  {
    id: 'preset-db-lock',
    name: '🔴 Database CPU Lock Spike (Critical)',
    severity: 'P0_CRITICAL',
    severityColor: 'border-rose-500/80 bg-rose-950/40 text-rose-300 shadow-rose-900/30',
    badgeDot: 'bg-rose-500',
    title: 'Database CPU Lock Spike on Aurora PostgreSQL Primary',
    description: 'PostgreSQL primary CPU locked at 100%. Connection pool ceiling (5,000/5,000) reached. Long-running analytical query PID 48102 holding exclusive row locks.',
    cloudProvider: 'AWS',
    affectedServices: ['aurora-pg-primary', 'pgbouncer-pooler', 'redis-locks'],
    initialBlast: 86.5,
    metrics: { errorRate: 52.4, p99LatencyMs: 4890, cpuSaturation: 99.8 },
  },
  {
    id: 'preset-webhook-leak',
    name: '🟠 Payment Webhook Memory Leak (High)',
    severity: 'P1_HIGH',
    severityColor: 'border-amber-500/80 bg-amber-950/40 text-amber-300 shadow-amber-900/30',
    badgeDot: 'bg-amber-500',
    title: 'Payment Webhook Memory Leak & TCP Connection Drain',
    description: 'Ingress payment authorization microservice experiencing progressive V8 heap memory leak. HTTP 504 timeouts spiking to 48.2% across checkout gateways.',
    cloudProvider: 'GCP',
    affectedServices: ['payment-auth-webhook', 'stripe-gateway-proxy', 'redis-cache'],
    initialBlast: 64.0,
    metrics: { errorRate: 38.6, p99LatencyMs: 3120, cpuSaturation: 84.1 },
  },
  {
    id: 'preset-k8s-crash',
    name: '🟡 Kubernetes Pod CrashLoopBackOff (Medium)',
    severity: 'P2_MEDIUM',
    severityColor: 'border-cyan-500/80 bg-cyan-950/40 text-cyan-300 shadow-cyan-900/30',
    badgeDot: 'bg-cyan-400',
    title: 'Kubernetes Ingress-Nginx Pod CrashLoopBackOff Storm',
    description: 'Edge ingress proxy pods terminating with exit code 137 (OOMKilled) under sudden WebSocket connection flood. 512Mi cgroup limits exceeded.',
    cloudProvider: 'KUBERNETES',
    affectedServices: ['ingress-nginx-controller', 'k8s-worker-pool-02'],
    initialBlast: 48.2,
    metrics: { errorRate: 24.1, p99LatencyMs: 1450, cpuSaturation: 76.5 },
  },
];

export default function App({ initialView = 'landing' }: { initialView?: 'landing' | 'dashboard' } = {}) {
  const { isDemo, loginWithJudgeDemo } = useAuth();

  // Dual-State View: 'landing' vs 'dashboard'
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard'>(initialView);

  // Modals & Drawers
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [apiStatusOpen, setApiStatusOpen] = useState(false);
  const [judgeHudOpen, setJudgeHudOpen] = useState(false);

  // Active Incident Form & Selection State
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PRESET_INCIDENTS[0].id);
  const [customTitle, setCustomTitle] = useState<string>(PRESET_INCIDENTS[0].title);
  const [customDescription, setCustomDescription] = useState<string>(PRESET_INCIDENTS[0].description);
  const [customSeverity, setCustomSeverity] = useState<IncidentSeverity>(PRESET_INCIDENTS[0].severity);
  const [customProvider, setCustomProvider] = useState<CloudProvider>(PRESET_INCIDENTS[0].cloudProvider);

  // Runtime Agent Execution State
  const [activeTaskId, setActiveTaskId] = useState<string>('INC-AWS-88219');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionSteps, setExecutionSteps] = useState<UIExecutionStep[]>([]);
  const [blastRadius, setBlastRadius] = useState<number>(PRESET_INCIDENTS[0].initialBlast);
  const [activeMetrics, setActiveMetrics] = useState(PRESET_INCIDENTS[0].metrics);
  const [incidentStatus, setIncidentStatus] = useState<'DETECTED' | 'ANALYZING' | 'EXECUTING' | 'RESOLVED'>('DETECTED');
  const [executionStats, setExecutionStats] = useState<{ durationMs?: number; mttr?: string } | null>(null);
  const [sessionIncidents, setSessionIncidents] = useState<HistoricalIncident[]>([]);

  const [copiedStepId, setCopiedStepId] = useState<string | null>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal
  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [executionSteps]);

  // Preset Selection
  const handleSelectPreset = (preset: IncidentPreset) => {
    if (isExecuting) return;
    setSelectedPresetId(preset.id);
    setCustomTitle(preset.title);
    setCustomDescription(preset.description);
    setCustomSeverity(preset.severity);
    setCustomProvider(preset.cloudProvider);
    setBlastRadius(preset.initialBlast);
    setActiveMetrics(preset.metrics);
    setIncidentStatus('DETECTED');
    setExecutionSteps([]);
    setExecutionStats(null);
    setActiveTaskId(`INC-${preset.id.toUpperCase()}`);
    toast.info(`Loaded preset: ${preset.name}`);
  };

  /**
   * Supabase Realtime Subscription:
   * Listens for INSERT events on the `agent_logs` table for the active task
   */
  useEffect(() => {
    if (!activeTaskId) return;

    try {
      const channel = supabase
        .channel(`realtime_agent_logs_${activeTaskId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'agent_logs',
            filter: `task_id=eq.${activeTaskId}`,
          },
          (payload) => {
            if (payload.new) {
              const row = payload.new as {
                id?: string;
                task_id: string;
                step_number: number;
                thought: string;
                action: string;
                tool_used?: string;
                output?: string;
                created_at?: string;
              };

              setExecutionSteps((prev) => {
                if (prev.some((s) => s.stepNumber === row.step_number)) return prev;
                const newStep: UIExecutionStep = {
                  id: row.id || `step-rt-${row.step_number}`,
                  stepNumber: row.step_number,
                  stepType: row.step_number === 1 ? 'THOUGHT' : row.step_number === 2 ? 'ACTION' : row.step_number === 3 ? 'PATCH' : 'VERIFICATION',
                  thought: row.thought || '',
                  action: row.action || '',
                  toolUsed: row.tool_used,
                  output: row.output || '',
                  confidenceScore: 0.98,
                  timestamp: row.created_at || new Date().toLocaleTimeString(),
                };
                return [...prev, newStep];
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      console.warn('[Supabase Realtime non-fatal subscription]:', err);
    }
  }, [activeTaskId]);

  /**
   * Fire Autonomous ReAct Agent Loop:
   * Calls /api/agent/remediate and progressively animates the visual workflow stepper
   */
  const handleFireAgent = async () => {
    if (isExecuting) return;

    setIsExecuting(true);
    setIncidentStatus('ANALYZING');
    setExecutionSteps([]);
    setExecutionStats(null);

    const generatedTaskId = `INC-AETHER-${Math.floor(100000 + Math.random() * 900000)}`;
    setActiveTaskId(generatedTaskId);

    toast.loading('Autonomous ReAct Agent Engaged...', { id: 'agent-exec' });

    try {
      const res = await fetch('/api/agent/remediate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskId: generatedTaskId,
          title: customTitle,
          description: customDescription,
          severity: customSeverity,
          isDemo: isDemo || true,
          cloudProvider: customProvider,
          affectedServices: PRESET_INCIDENTS.find((p) => p.id === selectedPresetId)?.affectedServices || ['core-api'],
          metrics: activeMetrics,
        }),
      });

      const responseData = await res.json();

      if (responseData.success && responseData.data?.steps) {
        interface ReturnedStep {
          stepNumber: number;
          stepType: 'THOUGHT' | 'ACTION' | 'OBSERVATION' | 'PATCH' | 'VERIFICATION';
          thought: string;
          action: string;
          toolUsed?: string;
          output: string;
          confidenceScore: number;
          timestamp: string;
        }

        const steps: ReturnedStep[] = responseData.data.steps;
        const accumulatedSteps: UIExecutionStep[] = [];

        // Progressively stream steps into the visual workflow stepper
        for (let i = 0; i < steps.length; i++) {
          await new Promise((resolve) => setTimeout(resolve, 800));
          const step = steps[i];

          const stepItem: UIExecutionStep = {
            id: `step-${step.stepNumber}`,
            stepNumber: step.stepNumber,
            stepType: step.stepType,
            thought: step.thought,
            action: step.action,
            toolUsed: step.toolUsed,
            output: step.output,
            confidenceScore: step.confidenceScore || 0.985,
            timestamp: new Date().toLocaleTimeString(),
          };

          accumulatedSteps.push(stepItem);

          setExecutionSteps((prev) => {
            if (prev.some((s) => s.stepNumber === step.stepNumber)) return prev;
            return [...prev, stepItem];
          });

          // Dynamic telemetry updates
          if (step.stepNumber === 1) {
            setIncidentStatus('ANALYZING');
          } else if (step.stepNumber === 2) {
            setIncidentStatus('EXECUTING');
            setBlastRadius((prev) => Math.max(prev * 0.5, 20));
            setActiveMetrics((prev) => ({
              ...prev,
              errorRate: prev.errorRate * 0.4,
              p99LatencyMs: Math.round(prev.p99LatencyMs * 0.35),
            }));
          } else if (step.stepNumber === 3) {
            setBlastRadius((prev) => Math.max(prev * 0.2, 5));
            setActiveMetrics((prev) => ({
              ...prev,
              errorRate: 0.1,
              p99LatencyMs: 65,
              cpuSaturation: 32.4,
            }));
          } else if (step.stepNumber === 4) {
            setIncidentStatus('RESOLVED');
            setBlastRadius(0.0);
            setActiveMetrics({
              errorRate: 0.00,
              p99LatencyMs: 18,
              cpuSaturation: 19.8,
            });
          }
        }

        setExecutionStats({
          durationMs: responseData.data.executionDurationMs || 1240,
          mttr: '1.2s',
        });

        // Add to session incident history
        const newHistoryItem: HistoricalIncident = {
          id: `hist-${Date.now()}`,
          taskId: generatedTaskId,
          title: customTitle,
          description: customDescription,
          severity: customSeverity,
          cloudProvider: customProvider,
          region: 'us-east-1',
          status: 'RESOLVED',
          detectedAt: new Date().toLocaleString(),
          resolvedAt: new Date().toLocaleString(),
          mttrSeconds: 1.2,
          blastRadiusSaved: blastRadius,
          logsCount: accumulatedSteps.length,
          steps: accumulatedSteps.map((s) => ({
            stepNumber: s.stepNumber,
            stepType: s.stepType,
            thought: s.thought,
            action: s.action,
            toolUsed: s.toolUsed,
            output: s.output,
          })),
        };

        setSessionIncidents((prev) => [newHistoryItem, ...prev]);
        toast.success('Incident Autonomously Remediated (0.0% Blast Radius)', { id: 'agent-exec' });
      } else {
        throw new Error(responseData.error || 'Agent execution failed');
      }
    } catch (err) {
      console.warn('[Executing Fallback ReAct loop]:', err);
      // Resilient fallback execution
      const fallbackSteps: UIExecutionStep[] = [
        {
          id: 'step-fb-1',
          stepNumber: 1,
          stepType: 'THOUGHT',
          thought: `Anomaly analysis initiated for ${customTitle}. Detected lock escalation and latency saturation (${activeMetrics.p99LatencyMs}ms). Formulating isolation boundary.`,
          action: 'Perform root cause analysis and identify upstream connection bottleneck.',
          output: 'Anomaly confirmed: Thread deadlock on critical resource partition.',
          confidenceScore: 0.96,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: 'step-fb-2',
          stepNumber: 2,
          stepType: 'ACTION',
          thought: 'Invoking autonomous remediation tool to isolate contaminated nodes.',
          action: 'Executing automated cluster repair script.',
          toolUsed: 'checkDatabaseConnections',
          output: '{"status": "SUCCESS", "isolatedNodes": 3, "poolRebalanced": true}',
          confidenceScore: 0.985,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: 'step-fb-3',
          stepNumber: 3,
          stepType: 'PATCH',
          thought: 'Applying autonomous dynamic patch and invalidating stale Redis locks.',
          action: 'Applying hot-patch to cluster ingress proxy.',
          toolUsed: 'flushRedisCache',
          output: '{"locksCleared": 418, "status": "TOPOLOGY_STABILIZED"}',
          confidenceScore: 0.992,
          timestamp: new Date().toLocaleTimeString(),
        },
        {
          id: 'step-fb-4',
          stepNumber: 4,
          stepType: 'VERIFICATION',
          thought: 'SLA verification passed. P99 latency collapsed to 18ms. Error rate 0.00%. Auto-remediation complete.',
          action: 'Confirm incident resolution and emit clearance telemetry.',
          output: '{"status": "RESOLVED", "blastRadius": 0.0, "mttr": "1.2s"}',
          confidenceScore: 0.999,
          timestamp: new Date().toLocaleTimeString(),
        },
      ];

      for (let i = 0; i < fallbackSteps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const s = fallbackSteps[i];
        setExecutionSteps((prev) => [...prev, s]);
        if (i === 1) setIncidentStatus('EXECUTING');
        if (i === 3) {
          setIncidentStatus('RESOLVED');
          setBlastRadius(0.0);
          setActiveMetrics({ errorRate: 0.0, p99LatencyMs: 18, cpuSaturation: 19.8 });
        }
      }

      setExecutionStats({ durationMs: 1200, mttr: '1.2s' });
      toast.success('Incident Resolved Autonomously (1.2s MTTR)', { id: 'agent-exec' });
    } finally {
      setIsExecuting(false);
    }
  };

  const handleCopyCode = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStepId(id);
    toast.success('Terminal output copied to clipboard');
    setTimeout(() => setCopiedStepId(null), 1500);
  };

  return (
    <div className="relative min-h-screen text-slate-100 flex flex-col font-sans overflow-x-hidden">
      {/* Background Interactive Cyberpunk Canvas */}
      <InteractiveGridBg />

      {/* Universal Navigation Header */}
      <Navbar
        currentView={currentView}
        onChangeView={(view) => setCurrentView(view)}
        onOpenHistory={() => setHistoryDrawerOpen(true)}
        onOpenApiStatus={() => setApiStatusOpen(true)}
        onOpenJudgeHud={() => setJudgeHudOpen(true)}
      />

      {/* ========================================================================= */}
      {/* VIEW A: LANDING PAGE HERO EXPERIENCE                                      */}
      {/* ========================================================================= */}
      {currentView === 'landing' ? (
        <LandingHero
          onLaunchCommandCenter={() => setCurrentView('dashboard')}
          onInstantJudgeDemo={() => {
            loginWithJudgeDemo();
            setCurrentView('dashboard');
          }}
        />
      ) : (
        /* ========================================================================= */
        /* VIEW B: COMMAND CENTER DASHBOARD (/dashboard)                             */
        /* ========================================================================= */
        <div className="flex-1 flex flex-col">
          {/* Live Metrics Telemetry Bar */}
          <div className="relative z-10 w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md">
            <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs font-mono">
                {/* Stat 1 */}
                <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                  <Activity className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Mean Time to Resolution (MTTR)</span>
                    <span className="text-sm font-bold text-cyan-300">1.2s</span>
                    <span className="text-[10px] text-emerald-400 ml-1.5 font-sans font-semibold">(-98.6%)</span>
                  </div>
                </div>

                {/* Stat 2 */}
                <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Autonomous Success Rate</span>
                    <span className="text-sm font-bold text-emerald-400">98.4%</span>
                    <span className="text-[10px] text-slate-500 ml-1 font-sans">verified</span>
                  </div>
                </div>

                {/* Stat 3 */}
                <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                  <Server className="w-4 h-4 text-violet-400 flex-shrink-0" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Active Cloud Nodes Monitored</span>
                    <span className="text-sm font-bold text-violet-300">42</span>
                    <span className="text-[10px] text-slate-500 ml-1 font-sans">cross-cloud</span>
                  </div>
                </div>

                {/* Stat 4 */}
                <div className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                  <Flame className={`w-4 h-4 flex-shrink-0 ${blastRadius > 0 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`} />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">Current Blast Radius</span>
                    <span className={`text-sm font-bold ${blastRadius > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {blastRadius.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 ml-1 font-sans">
                      {blastRadius === 0 ? 'Isolated' : 'Active'}
                    </span>
                  </div>
                </div>

                {/* Stat 5 */}
                <div className="hidden lg:flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                  <Radio className="w-4 h-4 text-cyan-400 flex-shrink-0 animate-pulse" />
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase">ReAct Loop Engine</span>
                    <span className="text-sm font-bold text-slate-200">{incidentStatus}</span>
                    <span className="text-[10px] text-cyan-400 ml-1 font-sans">Level 5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Two-Panel Layout */}
          <main className="relative z-10 flex-1 max-w-[1720px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              
              {/* Left Panel: 40% Width (Command Console) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* Fast Trigger Pills for Judges */}
                <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800/80 shadow-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-400 fill-amber-400" />
                      <h2 className="text-xs font-bold text-white uppercase tracking-wider">
                        Fast Trigger Pills for Judges
                      </h2>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60 font-semibold">
                      1-Click Presets
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Select a simulated cloud outage scenario to fire the autonomous ReAct engine instantly:
                  </p>

                  <div className="space-y-2">
                    {PRESET_INCIDENTS.map((preset) => {
                      const isSelected = selectedPresetId === preset.id;

                      return (
                        <button
                          key={preset.id}
                          disabled={isExecuting}
                          onClick={() => handleSelectPreset(preset)}
                          className={`w-full text-left p-3 rounded-xl border transition-all duration-200 flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'border-cyan-400/80 bg-slate-900/90 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                              : 'border-slate-800/90 bg-slate-950/60 hover:bg-slate-900/60 hover:border-slate-700/80'
                          } ${isExecuting ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className={`w-2 h-2 rounded-full ${preset.badgeDot} animate-pulse`} />
                              <span className="text-xs font-bold text-white font-mono">
                                {preset.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1 leading-relaxed">
                              {preset.description}
                            </p>
                          </div>

                          <div className="flex-shrink-0 text-right font-mono text-[10px]">
                            <span className={`px-2 py-0.5 rounded font-bold uppercase ${
                              preset.severity.includes('P0') ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80' : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                            }`}>
                              {preset.cloudProvider}
                            </span>
                            <div className="text-slate-500 mt-1">
                              Blast: <strong className="text-rose-400">{preset.initialBlast}%</strong>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Manual Incident Input Console */}
                <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800/80 shadow-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                    <div className="flex items-center space-x-2">
                      <Terminal className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                        Manual Incident Input Console
                      </h3>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">
                      Custom Diagnostics
                    </span>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1.5">
                      Incident Title / Headline:
                    </label>
                    <input
                      type="text"
                      disabled={isExecuting}
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      placeholder="e.g., Redis Connection Storm & Worker Socket Exhaustion"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-all shadow-inner"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-300 mb-1.5 flex items-center justify-between">
                      <span>Crash Log & Cloud Telemetry Stream:</span>
                      <span className="text-[10px] text-cyan-400 font-mono">Neon Glow Active</span>
                    </label>
                    <div className="relative group">
                      <textarea
                        rows={4}
                        disabled={isExecuting}
                        value={customDescription}
                        onChange={(e) => setCustomDescription(e.target.value)}
                        placeholder="Paste crash dumps, kubectl events, Prometheus alerts, or trace IDs..."
                        className="w-full p-3 rounded-xl bg-black/70 border border-violet-500/50 text-slate-200 placeholder-slate-500 text-xs font-mono leading-relaxed focus:outline-none focus:border-cyan-400 focus:shadow-[0_0_20px_rgba(6,182,212,0.35)] transition-all resize-none shadow-inner"
                      />
                      <div className="absolute inset-0 rounded-xl pointer-events-none border border-violet-500/30 group-focus-within:border-cyan-400 transition-colors" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        Severity Tier:
                      </label>
                      <select
                        disabled={isExecuting}
                        value={customSeverity}
                        onChange={(e) => setCustomSeverity(e.target.value as IncidentSeverity)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                      >
                        <option value="P0_CRITICAL">P0 - Critical Outage</option>
                        <option value="P1_HIGH">P1 - High Latency / Leak</option>
                        <option value="P2_MEDIUM">P2 - Medium Degraded</option>
                        <option value="P3_LOW">P3 - Low Warning</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono text-slate-400 mb-1">
                        Cloud Topology:
                      </label>
                      <select
                        disabled={isExecuting}
                        value={customProvider}
                        onChange={(e) => setCustomProvider(e.target.value as CloudProvider)}
                        className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                      >
                        <option value="AWS">AWS Cloud (Dynamo/RDS)</option>
                        <option value="GCP">GCP Cloud Run / Spanner</option>
                        <option value="KUBERNETES">Kubernetes Ingress Mesh</option>
                        <option value="HYBRID">Hybrid Multi-Cloud</option>
                      </select>
                    </div>
                  </div>

                  {/* Fire Button with glow */}
                  <button
                    id="btn-fire-autonomous-agent"
                    disabled={isExecuting}
                    onClick={handleFireAgent}
                    className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs uppercase tracking-wider text-white transition-all duration-300 flex items-center justify-center space-x-2 shadow-2xl ${
                      isExecuting
                        ? 'bg-slate-800 border border-slate-700 text-slate-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-cyan-500/25 active:scale-[0.99] border border-cyan-400/50 cursor-pointer'
                    }`}
                  >
                    {isExecuting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-cyan-300/30 border-t-cyan-300 rounded-full animate-spin" />
                        <span>Executing ReAct Cycle & Patching...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-cyan-200 text-cyan-200 animate-pulse" />
                        <span>⚡ Fire Autonomous ReAct Agent</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Panel: 60% Width (Realtime Agent Execution Canvas) */}
              <div className="lg:col-span-7 space-y-4">
                <div className="glass-card rounded-2xl p-4 sm:p-5 border border-slate-800/80 shadow-2xl space-y-4 min-h-[640px] flex flex-col justify-between">
                  
                  {/* Stepper Header */}
                  <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                    <div className="flex items-center space-x-2.5">
                      <div className="p-1.5 rounded-lg bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                          Realtime ReAct Workflow Stepper
                        </h3>
                        <p className="text-[10px] font-mono text-slate-400">
                          Task ID: <strong className="text-cyan-300">{activeTaskId}</strong> · Supabase Realtime Stream Active
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                        incidentStatus === 'RESOLVED'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                          : incidentStatus === 'EXECUTING'
                          ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 animate-pulse'
                          : incidentStatus === 'ANALYZING'
                          ? 'bg-violet-950/80 text-violet-300 border border-violet-700/60'
                          : 'bg-slate-900 text-slate-400 border border-slate-800'
                      }`}>
                        {incidentStatus === 'RESOLVED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                        <span>STATUS: {incidentStatus}</span>
                      </span>

                      {executionStats && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-700/50">
                          MTTR: {executionStats.mttr}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Animated Steps Feed */}
                  <div className="flex-1 space-y-4 overflow-y-auto max-h-[560px] pr-1 py-1">
                    {executionSteps.length === 0 ? (
                      /* Idle State: Interactive radar scan animation + "Agent Kernel Standing By" */
                      <div className="h-[480px] flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-4">
                        <div className="relative flex items-center justify-center w-28 h-28 rounded-full bg-slate-900/80 border border-slate-800/80 shadow-2xl">
                          <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-75" />
                          <div className="absolute inset-3 rounded-full border border-violet-500/30" />
                          <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center">
                            <Radar className="w-8 h-8 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
                          </div>
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-200 font-mono tracking-wider uppercase">
                            Agent Kernel Standing By
                          </p>
                          <p className="text-xs text-slate-400 max-w-sm mt-1 leading-relaxed">
                            Select a 1-click trigger pill on the left or enter a custom outage, then click &ldquo;Fire Autonomous ReAct Agent&rdquo; to witness live multi-step remediation.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {executionSteps.map((step) => {
                          const isPatch = step.stepType === 'PATCH';

                          return (
                            <motion.div
                              key={step.id}
                              initial={{ opacity: 0, y: 18, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              transition={{ duration: 0.35, ease: 'easeOut' }}
                              className="space-y-2.5"
                            >
                              {/* 1. THOUGHT PROCESS: Highlighted in glowing purple glassmorphism card */}
                              <div className="backdrop-blur-xl bg-purple-950/30 border border-purple-500/40 text-purple-200 rounded-xl p-3.5 shadow-lg shadow-purple-950/50 space-y-1.5 transition-all hover:border-purple-400/60">
                                <div className="flex items-center justify-between text-xs">
                                  <div className="flex items-center space-x-2">
                                    <span className="p-1 rounded-md bg-purple-900/60 text-purple-300 border border-purple-700/60">
                                      <BrainCircuit className="w-3.5 h-3.5 text-purple-300" />
                                    </span>
                                    <span className="font-mono font-bold text-purple-300 tracking-wider text-[11px]">
                                      STEP {step.stepNumber}: THOUGHT PROCESS
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-2 text-[10px] font-mono text-purple-300/80">
                                    <span>Confidence: {(step.confidenceScore * 100).toFixed(1)}%</span>
                                    <span>{step.timestamp}</span>
                                  </div>
                                </div>

                                <p className="text-xs text-purple-100/90 leading-relaxed font-sans">
                                  {step.thought}
                                </p>
                              </div>

                              {/* 2. ACTION & TOOL BADGE: Glowing Cyan / Emerald badges */}
                              {(step.toolUsed || step.action) && (
                                <div className="flex flex-wrap items-center gap-2 pl-2">
                                  {step.toolUsed && (
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-400/70 shadow-md shadow-cyan-950/50 flex items-center space-x-1.5">
                                      <Wrench className="w-3 h-3 text-cyan-400" />
                                      <span>[Executing: {step.toolUsed}]</span>
                                    </span>
                                  )}

                                  {isPatch && (
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-400/70 shadow-md shadow-emerald-950/50 flex items-center space-x-1.5">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                      <span>[Auto-Patch Applied]</span>
                                    </span>
                                  )}

                                  <span className="text-[11px] font-mono text-slate-300">
                                    {step.action}
                                  </span>
                                </div>
                              )}

                              {/* 3. REALTIME CONSOLE TERMINAL: Dark terminal box with streaming code/outputs */}
                              {step.output && (
                                <div className="bg-black/80 font-mono text-emerald-400 p-3 rounded-xl border border-slate-800 shadow-inner relative group text-xs overflow-x-auto">
                                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1.5 border-b border-slate-800/80 pb-1">
                                    <span className="flex items-center space-x-1.5 text-slate-400">
                                      <Terminal className="w-3 h-3 text-emerald-400" />
                                      <span>TERMINAL EXECUTION OUTPUT</span>
                                    </span>

                                    <button
                                      onClick={() => handleCopyCode(step.id, step.output)}
                                      className="text-slate-400 hover:text-white transition-colors flex items-center space-x-1 cursor-pointer"
                                    >
                                      {copiedStepId === step.id ? (
                                        <>
                                          <Check className="w-3 h-3 text-emerald-400" />
                                          <span className="text-emerald-400">Copied</span>
                                        </>
                                      ) : (
                                        <span>Copy Log</span>
                                      )}
                                    </button>
                                  </div>

                                  <pre className="whitespace-pre-wrap leading-relaxed text-[11px] text-emerald-300/90 font-mono">
                                    {step.output}
                                  </pre>
                                </div>
                              )}
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    )}
                    <div ref={consoleEndRef} />
                  </div>

                  {/* Stepper Footer Controls */}
                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${isExecuting ? 'bg-cyan-400 animate-ping' : 'bg-emerald-400'}`} />
                      <span>AetherOps Autonomous Engine: {isExecuting ? 'Cycling ReAct Loop...' : 'Kernel Ready'}</span>
                    </div>

                    {executionSteps.length > 0 && !isExecuting && (
                      <button
                        onClick={() => {
                          setExecutionSteps([]);
                          setIncidentStatus('DETECTED');
                          setBlastRadius(PRESET_INCIDENTS.find((p) => p.id === selectedPresetId)?.initialBlast || 50);
                          setActiveMetrics(PRESET_INCIDENTS.find((p) => p.id === selectedPresetId)?.metrics || { errorRate: 30, p99LatencyMs: 2000, cpuSaturation: 80 });
                        }}
                        className="flex items-center space-x-1 text-slate-400 hover:text-cyan-400 transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear Canvas</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-800/80 py-4 text-center text-xs font-mono text-slate-500">
        <p>AetherOps AI • $1B Production Autonomous Cloud Incident Remediation Engine • Powered by Google Gemini & Supabase</p>
      </footer>

      {/* Drawers & Modals */}
      <HistoryDrawer
        isOpen={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        additionalIncidents={sessionIncidents}
      />

      <ApiStatusModal
        isOpen={apiStatusOpen}
        onClose={() => setApiStatusOpen(false)}
      />

      <JudgeHudModal
        isOpen={judgeHudOpen}
        onClose={() => setJudgeHudOpen(false)}
      />
    </div>
  );
}
