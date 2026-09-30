'use client';

import React from 'react';
import { DemoScenario } from '@/types/ops';
import { DEMO_SCENARIOS } from '@/lib/demoScenarios';
import { ChevronRight, Server } from 'lucide-react';

interface ScenarioPickerProps {
  activeScenarioId: string;
  onSelectScenario: (scenario: DemoScenario) => void;
  disabled: boolean;
}

export const ScenarioPicker: React.FC<ScenarioPickerProps> = ({
  activeScenarioId,
  onSelectScenario,
  disabled,
}) => {
  return (
    <div className="space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-2">
          <Server className="w-4 h-4 text-cyan-400" />
          <span>Simulated Cloud Incident Scenarios</span>
        </h3>
        <span className="text-xs font-mono text-slate-400">
          3 Real-World Production Outages
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {DEMO_SCENARIOS.map((scenario) => {
          const isActive = scenario.id === activeScenarioId;

          return (
            <button
              key={scenario.id}
              disabled={disabled}
              onClick={() => onSelectScenario(scenario)}
              className={`text-left p-4 rounded-xl transition-all duration-200 border relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-slate-900/90 border-cyan-400/80 shadow-lg shadow-cyan-500/10 ring-1 ring-cyan-400/40'
                  : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700/90 hover:bg-slate-900/40'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Top Accent Strip if active */}
              {isActive && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 via-cyan-400 to-violet-500" />
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    scenario.severity.includes('P0')
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800/80'
                  }`}>
                    {scenario.severity.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-mono text-cyan-300">
                    {scenario.cloudProvider}
                  </span>
                </div>

                <h4 className="text-xs font-bold text-white line-clamp-1">
                  {scenario.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                  {scenario.summary}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Blast: <strong className="text-rose-400">{scenario.initialBlastRadius}%</strong></span>
                <span className="flex items-center space-x-1 text-cyan-400">
                  <span>{isActive ? 'Active Target' : 'Load Outage'}</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
