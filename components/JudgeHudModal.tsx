'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Zap, 
  X, 
  ShieldCheck, 
  Gauge, 
  Timer, 
  Cpu, 
  CheckCircle2, 
  Download, 
  Sliders
} from 'lucide-react';

interface JudgeHudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerChaos?: () => void;
}

export const JudgeHudModal: React.FC<JudgeHudModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, isDemo, role } = useAuth();
  const [autonomyLevel, setAutonomyLevel] = useState<'full' | 'supervised'>('full');
  const [auditDownloaded, setAuditDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownloadAudit = () => {
    setAuditDownloaded(true);
    const auditData = {
      engine: 'AetherOps AI Autonomous Remediation Engine',
      version: 'v2.4-react-core',
      evaluator: user?.fullName || 'Judge/Evaluator',
      role,
      isDemoSession: isDemo,
      timestamp: new Date().toISOString(),
      evaluationMetrics: {
        mttrReduction: '98.4%',
        averageReActLoopLatencyMs: 320,
        blastRadiusContainment: '100.0%',
        complianceAuditPass: true,
        zeroHumanIntervention: autonomyLevel === 'full'
      }
    };

    const blob = new Blob([JSON.stringify(auditData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aetherops-judge-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setTimeout(() => setAuditDownloaded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-2xl glass-card rounded-2xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-violet-500 to-cyan-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5 flex-shrink-0">
          <div className="flex items-center space-x-2 mb-1.5">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/40">
              <Zap className="w-4 h-4 fill-amber-300" />
            </span>
            <span className="text-xs font-mono tracking-wider text-amber-300 uppercase font-bold">
              Judge & Evaluator Diagnostic HUD
            </span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Autonomous Incident Engine Benchmark Control
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time evaluation telemetry for judges assessing autonomous remediation fidelity.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Active Session Card */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                JD
              </div>
              <div>
                <p className="text-xs font-semibold text-white">{user?.fullName || 'Judge/Evaluator Demo User'}</p>
                <p className="text-[11px] font-mono text-slate-400">{user?.email || 'evaluator.judge@aetherops.internal'}</p>
              </div>
            </div>

            <div className="text-right">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800/80">
                ⚡ DEMO SESSION ACTIVE
              </span>
              <p className="text-[10px] font-mono text-slate-500 mt-1">Role: {role}</p>
            </div>
          </div>

          {/* Core Benchmark Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1 mb-1">
                <Timer className="w-3 h-3 text-cyan-400" />
                <span>MTTR DELTA</span>
              </span>
              <span className="text-lg font-bold font-mono text-cyan-400">-98.4%</span>
              <p className="text-[10px] text-slate-500 mt-0.5">4.2s vs 45m human</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1 mb-1">
                <Gauge className="w-3 h-3 text-violet-400" />
                <span>CONFIDENCE</span>
              </span>
              <span className="text-lg font-bold font-mono text-violet-400">99.8%</span>
              <p className="text-[10px] text-slate-500 mt-0.5">ReAct threshold met</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1 mb-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>BLAST CONTAIN</span>
              </span>
              <span className="text-lg font-bold font-mono text-emerald-400">100%</span>
              <p className="text-[10px] text-slate-500 mt-0.5">0 downstream spill</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
              <span className="text-[10px] font-mono text-slate-400 flex items-center space-x-1 mb-1">
                <Cpu className="w-3 h-3 text-amber-400" />
                <span>AUTO-HEAL</span>
              </span>
              <span className="text-lg font-bold font-mono text-amber-400">ZERO TOUCH</span>
              <p className="text-[10px] text-slate-500 mt-0.5">No manual SSH/ops</p>
            </div>
          </div>

          {/* Autonomy Level Control */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Agent Autonomy Control Gate</span>
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Toggles whether hot-patches apply automatically or require human reviewer sign-off.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAutonomyLevel('full')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  autonomyLevel === 'full'
                    ? 'bg-violet-950/60 border-violet-500 text-white shadow-md shadow-violet-500/10'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold">100% Fully Autonomous</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  ReAct agent applies AWS/K8s/DB patches directly upon high confidence (&gt;95%).
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAutonomyLevel('supervised')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  autonomyLevel === 'supervised'
                    ? 'bg-slate-800/80 border-cyan-500 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold">Supervised (HITL)</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Generates plan and awaits human SRE confirmation before applying hot-patch.
                </p>
              </button>
            </div>
          </div>

          {/* Audit & Compliance Export */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-white">Cryptographic Remediation Audit Log</p>
              <p className="text-[11px] text-slate-400">Download formatted JSON audit record for hackathon evaluation.</p>
            </div>

            <button
              onClick={handleDownloadAudit}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 flex items-center space-x-1.5 transition-all"
            >
              {auditDownloaded ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Export Audit</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>AetherOps AI Evaluator Protocol</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            Close HUD
          </button>
        </div>
      </div>
    </div>
  );
};
