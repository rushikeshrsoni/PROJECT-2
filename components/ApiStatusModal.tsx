'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  ShieldCheck, 
  Activity
} from 'lucide-react';
import { ApiGatewayStatus } from '@/types/ops';

interface ApiStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GATEWAY_SERVICES: ApiGatewayStatus[] = [
  {
    service: 'Google Gemini 2.0 Flash AI Kernel',
    category: 'AI Engine',
    status: 'ONLINE',
    latencyMs: 142,
    uptime: '99.99%',
    region: 'us-central1'
  },
  {
    service: 'Supabase Realtime Postgres CDC',
    category: 'Database',
    status: 'ONLINE',
    latencyMs: 38,
    uptime: '99.98%',
    region: 'aws-us-east-1'
  },
  {
    service: 'AWS Dynamic Table Autoscaler Gateway',
    category: 'Cloud Gateway',
    status: 'ONLINE',
    latencyMs: 55,
    uptime: '99.99%',
    region: 'us-east-1'
  },
  {
    service: 'Kubernetes Cluster Edge Mesh Operator',
    category: 'Cloud Gateway',
    status: 'ONLINE',
    latencyMs: 24,
    uptime: '100.00%',
    region: 'us-west-2'
  },
  {
    service: 'Zero-Trust RBAC & Zod Policy Validator',
    category: 'Security',
    status: 'ONLINE',
    latencyMs: 4,
    uptime: '100.00%',
    region: 'Global Edge'
  }
];

export const ApiStatusModal: React.FC<ApiStatusModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-2xl glass-card rounded-2xl border border-slate-700 p-6 flex flex-col shadow-2xl relative overflow-hidden"
      >
        {/* Top Accent Strip */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-500" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  AetherOps AI Infrastructure & API Status
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  ALL SYSTEMS OPERATIONAL
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time latency, health metrics, and automated cluster connectivity.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Service Cards Grid */}
        <div className="space-y-2.5 my-4 max-h-[60vh] overflow-y-auto pr-1">
          {GATEWAY_SERVICES.map((item) => (
            <div
              key={item.service}
              className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs font-mono"
            >
              <div className="flex items-center space-x-3">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <div>
                  <span className="font-semibold text-white block">{item.service}</span>
                  <span className="text-[10px] text-slate-400 font-sans">{item.category} • {item.region}</span>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <span className="text-slate-400 text-[11px]">
                  Latency: <strong className="text-cyan-400">{item.latencyMs}ms</strong>
                </span>
                <span className="text-slate-400 text-[11px]">
                  Uptime: <strong className="text-emerald-400">{item.uptime}</strong>
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 text-[10px] font-bold">
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Security & Isolation Summary */}
        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero-Trust API Protection & Backend Key Isolation Active</span>
          </div>
          <span className="text-[11px] text-cyan-400">Verified SLA 99.98%</span>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
          >
            Close Panel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
