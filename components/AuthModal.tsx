'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Zap, 
  Lock, 
  Mail, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  ShieldCheck,
  Database
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { loginWithJudgeDemo, loginWithSupabase, isSupabaseLive, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'demo' | 'supabase'>('demo');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJudgeDemoClick = () => {
    loginWithJudgeDemo();
    onClose();
  };

  const handleSupabaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email) {
      setErrorMsg('Please provide a valid email address');
      return;
    }

    const res = await loginWithSupabase(email, password || undefined);
    if (res.success) {
      setSuccessMsg('Authentication authenticated successfully.');
      setTimeout(() => {
        onClose();
      }, 700);
    } else {
      setErrorMsg(res.error || 'Failed to authenticate with Supabase');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
      <div 
        className="relative w-full max-w-lg glass-card rounded-2xl border border-slate-700/80 p-6 sm:p-8 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Neon Accent Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-600 via-cyan-400 to-violet-600" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono tracking-wider text-cyan-400 uppercase font-semibold">
              AetherOps AI Access Gateway
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Select Authentication Protocol
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Choose instant evaluation demo access or authenticate using Supabase JWT.
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/70 border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'demo'
                ? 'bg-gradient-to-r from-violet-600/90 to-purple-600/90 text-white shadow-md shadow-violet-500/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-cyan-300" />
            <span>⚡ Judge Demo Mode</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'supabase'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Supabase JWT Auth</span>
          </button>
        </div>

        {/* TAB 1: ONE-CLICK JUDGE DEMO MODE */}
        {activeTab === 'demo' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-800/40 text-left">
              <div className="flex items-start space-x-3">
                <div className="p-2 rounded-lg bg-violet-900/50 text-violet-300 border border-violet-700/50">
                  <Sparkles className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Instant Evaluator Access</h4>
                  <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                    Designed for hackathon judges & tech evaluators. Grants full administrative privileges to trigger autonomous ReAct remediation cycles without filling credentials.
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-violet-900/40 grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                <div className="flex items-center space-x-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Role: <strong>Judge/Evaluator</strong></span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Session: <strong>Persistent Local</strong></span>
                </div>
              </div>
            </div>

            <button
              id="btn-modal-instant-judge"
              type="button"
              onClick={handleJudgeDemoClick}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 hover:from-violet-500 hover:to-cyan-400 transition-all duration-200 shadow-xl shadow-cyan-500/20 active:scale-[0.99] flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 fill-current text-cyan-200 animate-pulse" />
              <span>Enter as Judge/Evaluator (1-Click)</span>
            </button>
          </div>
        )}

        {/* TAB 2: SUPABASE AUTH */}
        {activeTab === 'supabase' && (
          <form onSubmit={handleSupabaseSubmit} className="space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between text-xs px-3 py-2 rounded-lg bg-slate-900/70 border border-slate-800">
              <span className="text-slate-400">Supabase Connection:</span>
              <span className={`font-mono font-medium ${isSupabaseLive ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isSupabaseLive ? 'Connected (Production)' : 'Fallback Mock Client'}
              </span>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Engineer / Ops Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sre.lead@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">
                Password <span className="text-slate-500">(Optional for Magic Link)</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <button
              id="btn-modal-supabase-submit"
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign In via Supabase JWT</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
