'use client';

import React, { useRef, useEffect } from 'react';
import { AgentLog, ReActStepType } from '@/types/ops';
import { 
  BrainCircuit, 
  Terminal, 
  Eye, 
  Wrench, 
  CheckCircle2, 
  ChevronRight
} from 'lucide-react';

interface ReActConsoleProps {
  logs: AgentLog[];
  isRemediating: boolean;
}

const STEP_CONFIG: Record<ReActStepType, { label: string; icon: React.ElementType; color: string; badgeBg: string }> = {
  THOUGHT: {
    label: 'REASON / THOUGHT',
    icon: BrainCircuit,
    color: 'text-violet-400',
    badgeBg: 'bg-violet-950/80 border-violet-800 text-violet-300',
  },
  ACTION: {
    label: 'ACT / TOOL EXECUTION',
    icon: Terminal,
    color: 'text-cyan-400',
    badgeBg: 'bg-cyan-950/80 border-cyan-800 text-cyan-300',
  },
  OBSERVATION: {
    label: 'OBSERVE / TELEMETRY',
    icon: Eye,
    color: 'text-amber-400',
    badgeBg: 'bg-amber-950/80 border-amber-800 text-amber-300',
  },
  PATCH: {
    label: 'APPLY / HOT-PATCH',
    icon: Wrench,
    color: 'text-rose-400',
    badgeBg: 'bg-rose-950/80 border-rose-800 text-rose-300',
  },
  VERIFICATION: {
    label: 'VERIFY / SLA RECOVERY',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    badgeBg: 'bg-emerald-950/80 border-emerald-800 text-emerald-300',
  },
};

export const ReActConsole: React.FC<ReActConsoleProps> = ({ logs, isRemediating }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="glass-card rounded-2xl overflow-hidden border border-slate-800/80 shadow-2xl flex flex-col h-[600px]">
      {/* Console Top Header */}
      <div className="px-4 py-3 bg-slate-950/90 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
          </div>
          <span className="text-xs font-mono font-semibold text-slate-300 tracking-wider flex items-center space-x-1.5 pl-2">
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span>REACT_AUTONOMOUS_KERNEL://stream.live</span>
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {isRemediating && (
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800 text-[10px] font-mono text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>CYCLING</span>
            </span>
          )}
          <span className="text-[11px] font-mono text-slate-400">
            {logs.length} ReAct Cycles Logged
          </span>
        </div>
      </div>

      {/* Terminal Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 cyber-mono text-xs">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/60">
              <BrainCircuit className="w-10 h-10 text-slate-600 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-400">ReAct Engine Idle</p>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Trigger autonomous remediation above or select an incident scenario to observe the ReAct reasoning loops in real-time.
              </p>
            </div>
          </div>
        ) : (
          logs.map((log, index) => {
            const config = STEP_CONFIG[log.stepType] || STEP_CONFIG.THOUGHT;
            const Icon = config.icon;

            return (
              <div
                key={log.id || index}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700/80 transition-all space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                {/* Step Metadata Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold tracking-wider flex items-center space-x-1 ${config.badgeBg}`}>
                      <Icon className="w-3 h-3" />
                      <span>{config.label}</span>
                    </span>
                    <span className="text-[11px] font-semibold text-slate-200">
                      {log.title}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                    {log.confidenceScore && (
                      <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                        Confidence: {(log.confidenceScore * 100).toFixed(1)}%
                      </span>
                    )}
                    {log.latencyMs && <span>{log.latencyMs}ms</span>}
                  </div>
                </div>

                {/* Step Content / Reasoning */}
                <div className="text-slate-300 text-[11px] leading-relaxed pl-1">
                  {log.content}
                </div>

                {/* Tool Executed Command */}
                {log.toolExecuted && (
                  <div className="mt-2 p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-cyan-300 flex items-center space-x-2 overflow-x-auto">
                    <ChevronRight className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                    <span className="font-semibold text-slate-400">EXEC:</span>
                    <span className="text-cyan-200">{log.toolExecuted}</span>
                  </div>
                )}

                {/* Tool Output / Payload */}
                {log.commandOutput && (
                  <div className="mt-1.5 p-2 rounded-lg bg-black/60 border border-slate-800 text-[11px] text-slate-400 overflow-x-auto">
                    <pre className="whitespace-pre font-mono">{log.commandOutput}</pre>
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center space-x-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span>AetherOps Kernel: <strong>Zero Human Intervention Required</strong></span>
        </div>
        <span className="text-slate-500">Autonomous ReAct Loop Engine v2.4</span>
      </div>
    </div>
  );
};
