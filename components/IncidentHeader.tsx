'use client';

import React from 'react';
import { Task, DemoScenario } from '@/types/ops';
import { 
  Flame, 
  Zap, 
  RotateCcw, 
  Server, 
  CheckCircle
} from 'lucide-react';

interface IncidentHeaderProps {
  scenario: DemoScenario;
  task: Task;
  isRemediating: boolean;
  onTriggerRemediation: () => void;
  onReset: () => void;
}

export const IncidentHeader: React.FC<IncidentHeaderProps> = ({
  scenario,
  task,
  isRemediating,
  onTriggerRemediation,
  onReset,
}) => {
  const isResolved = task.status === 'RESOLVED';

  return (
    <div className="glass-card rounded-2xl p-5 sm:p-6 relative overflow-hidden border border-slate-800/80 mb-6">
      {/* Background radial gradient indicator */}
      <div 
        className={`absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-700 ${
          isResolved ? 'bg-emerald-500' : 'bg-rose-600'
        }`}
      />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
        {/* Incident Details */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Chip */}
            <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
              isResolved 
                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-700/60'
                : 'bg-rose-950/90 text-rose-300 border border-rose-700/80 shadow-lg shadow-rose-950/50'
            }`}>
              {isResolved ? (
                <>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  <span>AUTONOMOUSLY RESOLVED</span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                  <span>{scenario.severity.replace('_', ' ')}</span>
                </>
              )}
            </span>

            {/* Incident ID */}
            <span className="px-2.5 py-1 rounded-md text-xs font-mono text-slate-400 bg-slate-900/80 border border-slate-800">
              {task.incidentId}
            </span>

            {/* Provider & Region */}
            <span className="px-2.5 py-1 rounded-md text-xs font-mono text-cyan-300 bg-cyan-950/50 border border-cyan-800/50 flex items-center space-x-1">
              <Server className="w-3 h-3 text-cyan-400" />
              <span>{task.cloudProvider} • {task.region}</span>
            </span>
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              {task.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              {task.description}
            </p>
          </div>

          {/* Affected Services Tags */}
          <div className="flex items-center gap-1.5 flex-wrap pt-1">
            <span className="text-[11px] font-mono text-slate-400">Affected Topology:</span>
            {task.affectedServices.map((svc) => (
              <span
                key={svc}
                className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-700/70"
              >
                {svc}
              </span>
            ))}
          </div>
        </div>

        {/* Blast Radius & Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4">
          {/* Blast Radius Gauge Card */}
          <div className="w-full sm:w-auto min-w-[220px] p-3 rounded-xl bg-slate-950/60 border border-slate-800/90 flex flex-col justify-between">
            <div className="flex items-center justify-between text-xs font-mono mb-1.5">
              <span className="text-slate-400">Blast Radius Impact:</span>
              <span className={`font-bold ${isResolved ? 'text-emerald-400' : 'text-rose-400'}`}>
                {task.blastRadiusPercentage.toFixed(1)}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2.5 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
              <div
                className={`h-full transition-all duration-700 ease-out rounded-full ${
                  isResolved
                    ? 'bg-emerald-500 w-0'
                    : 'bg-gradient-to-r from-amber-500 via-rose-500 to-rose-600'
                }`}
                style={{ width: `${task.blastRadiusPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-1">
              <span>0% (Isolated)</span>
              <span>100% (Critical)</span>
            </div>
          </div>

          {/* Action Trigger Buttons */}
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {!isResolved ? (
              <button
                id="btn-trigger-remediation"
                onClick={onTriggerRemediation}
                disabled={isRemediating}
                className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs text-white transition-all duration-300 flex items-center justify-center space-x-2 shadow-xl ${
                  isRemediating
                    ? 'bg-slate-800 cursor-not-allowed text-slate-400 border border-slate-700'
                    : 'bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 shadow-cyan-500/25 active:scale-95 border border-cyan-400/40'
                }`}
              >
                {isRemediating ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin" />
                    <span>Executing ReAct Cycle...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-cyan-300 text-cyan-300 animate-pulse" />
                    <span>⚡ Trigger Autonomous Remediation</span>
                  </>
                )}
              </button>
            ) : (
              <button
                id="btn-reset-incident"
                onClick={onReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 transition-all flex items-center justify-center space-x-2"
              >
                <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                <span>Reset Simulation</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Status Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">HTTP 5xx Error Rate</span>
          <span className={`text-base font-extrabold font-mono ${task.metrics.errorRate > 5 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {task.metrics.errorRate.toFixed(2)}%
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">P99 Latency SLA</span>
          <span className={`text-base font-extrabold font-mono ${task.metrics.p99LatencyMs > 500 ? 'text-amber-400' : 'text-cyan-400'}`}>
            {task.metrics.p99LatencyMs} ms
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">CPU Saturation</span>
          <span className="text-base font-extrabold font-mono text-slate-200">
            {task.metrics.cpuSaturation.toFixed(1)}%
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800/60">
          <span className="text-[10px] font-mono text-slate-400 uppercase block">Healthy Pod Replicas</span>
          <span className={`text-base font-extrabold font-mono ${isResolved ? 'text-emerald-400' : 'text-slate-300'}`}>
            {task.metrics.healthyReplicas}
          </span>
        </div>
      </div>
    </div>
  );
};
