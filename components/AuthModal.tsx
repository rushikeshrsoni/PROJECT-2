'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Zap, 
  Lock, 
  Mail, 
  User, 
  X, 
  AlertCircle, 
  Database,
  ArrowRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, defaultTab = 'signin' }) => {
  const { loginWithJudgeDemo, loginWithSupabase, signUpWithSupabase, isSupabaseLive, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'signin' | 'signup'>(defaultTab);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleJudgeFastPass = () => {
    loginWithJudgeDemo();
    onClose();
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email) {
      setErrorMsg('Please provide a valid email address');
      return;
    }

    const res = await loginWithSupabase(email, password || undefined);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to authenticate');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password || !fullName) {
      setErrorMsg('Please fill in all fields (Full Name, Email, and Password)');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters');
      return;
    }

    const res = await signUpWithSupabase(email, password, fullName);
    if (res.success) {
      onClose();
    } else {
      setErrorMsg(res.error || 'Failed to create account');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25 }}
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
        <div className="mb-5">
          <div className="flex items-center space-x-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono tracking-wider text-cyan-400 uppercase font-semibold">
              AetherOps AI Access Gateway
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Autonomous Incident Engine Access
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Authenticate to deploy autonomous ReAct remediations across your cloud topology.
          </p>
        </div>

        {/* PROMINENT PRIMARY ACTION: JUDGE / EVALUATOR INSTANT FAST-PASS */}
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-violet-950/40 to-cyan-950/40 border border-amber-500/50 shadow-lg shadow-amber-950/30">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                Evaluator Instant Fast-Pass
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-500/40 font-semibold uppercase">
              No Auth Required
            </span>
          </div>
          <p className="text-xs text-slate-300 mb-3 leading-relaxed">
            One-click evaluator access for hackathon judges & tech reviewers. Injects an instant persistent demo session with full administrative privileges.
          </p>
          <button
            id="btn-judge-fast-pass"
            type="button"
            onClick={handleJudgeFastPass}
            className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 hover:from-amber-400 hover:to-cyan-400 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current text-white animate-pulse" />
            <span>⚡ Judge / Evaluator Instant Fast-Pass</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center mb-4">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-4 text-[10px] font-mono uppercase tracking-wider text-slate-500">
            or standard cloud auth
          </span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Mode Selector Tabs (Sign In vs Sign Up) */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-950/70 border border-slate-800 mb-5">
          <button
            type="button"
            onClick={() => { setActiveTab('signin'); setErrorMsg(null); }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'signin'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sign In</span>
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab('signup'); setErrorMsg(null); }}
            className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'signup'
                ? 'bg-slate-800 text-white shadow-md border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5 text-violet-400" />
            <span>Create Account</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: SIGN IN */}
        {activeTab === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Cloud Ops Email:
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="engineer@company.com"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Password:
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
              id="btn-submit-signin"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Sign In via Supabase</span>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: SIGN UP */}
        {activeTab === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Full Name / SRE Lead:
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Work Email:
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@cloudops.internal"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1">
                Password (min 6 characters):
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>

            <button
              id="btn-submit-signup"
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-violet-600 hover:bg-violet-500 border border-violet-500 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-lg shadow-violet-600/25"
            >
              {isLoading ? (
                <span className="inline-block w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Register SRE Engineer Profile</span>
              )}
            </button>
          </form>
        )}

        {/* Footer info */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
          <div className="flex items-center space-x-1.5">
            <Database className={`w-3 h-3 ${isSupabaseLive ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span>Supabase Auth: {isSupabaseLive ? 'Production Live' : 'Demo Fallback'}</span>
          </div>
          <span>AetherOps AI Security v2.4</span>
        </div>
      </motion.div>
    </div>
  );
};
