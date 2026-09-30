'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { 
  Cpu, 
  Zap, 
  Terminal, 
  LogOut, 
  UserCheck, 
  ChevronDown,
  Database
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

export const Navbar: React.FC<{ onOpenJudgeHud?: () => void }> = ({ onOpenJudgeHud }) => {
  const { user, isDemo, role, isSupabaseLive, loginWithJudgeDemo, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-slate-950/70 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-violet-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
                <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 opacity-30 blur-sm pointer-events-none" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  AETHER<span className="text-cyan-400">OPS</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-mono bg-violet-950/80 text-violet-300 border border-violet-800/60 font-semibold tracking-wide">
                  AI v2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                Autonomous Cloud Incident Remediation Engine • ReAct Core
              </p>
            </div>
          </div>

          {/* Engine Status & System Info */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs font-mono">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="text-slate-300">ReAct Cycle:</span>
              <span className="text-cyan-400 font-semibold">ACTIVE</span>
            </div>

            {/* Supabase Status Pill */}
            <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-900/60 border border-slate-800 text-[11px] font-mono text-slate-400">
              <Database className={`w-3 h-3 ${isSupabaseLive ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span>Supabase:</span>
              <span className={isSupabaseLive ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                {isSupabaseLive ? 'Live JWT' : 'Demo Fallback'}
              </span>
            </div>
          </div>

          {/* Actions & Judge Demo Switch */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Demo Mode Trigger Button */}
            {!user ? (
              <button
                id="btn-nav-one-click-demo"
                onClick={loginWithJudgeDemo}
                className="relative group overflow-hidden px-3.5 py-1.5 rounded-lg text-xs font-medium text-white transition-all duration-300 bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-500 hover:shadow-lg hover:shadow-cyan-500/25 active:scale-95 flex items-center space-x-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-cyan-200 fill-cyan-200 animate-bounce" />
                <span className="font-semibold tracking-wide">⚡ One-Click Judge Demo</span>
              </button>
            ) : isDemo ? (
              <div className="flex items-center space-x-2">
                <button
                  id="btn-nav-judge-badge"
                  onClick={onOpenJudgeHud}
                  className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-amber-500/20 to-violet-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-amber-500/10"
                >
                  <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span>JUDGE DEMO MODE</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-amber-400/20 text-amber-200 uppercase">Active</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-mono">
                <UserCheck className="w-3 h-3" />
                <span>Supabase Auth</span>
              </div>
            )}

            {/* Auth Dropdown / Button */}
            {!user ? (
              <button
                id="btn-nav-login"
                onClick={() => setAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 transition-colors"
              >
                Sign In
              </button>
            ) : (
              <div className="relative">
                <button
                  id="btn-nav-user-menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {user.email.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate hidden sm:inline-block font-mono text-[11px]">
                    {user.fullName || user.email}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-panel rounded-xl border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white">{user.fullName || 'Evaluator'}</p>
                      <p className="text-[11px] font-mono text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-violet-900/60 text-violet-300 border border-violet-700/50">
                          {role}
                        </span>
                        {isDemo && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                            Demo Mode
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="py-1">
                      {onOpenJudgeHud && (
                        <button
                          onClick={() => {
                            setUserMenuOpen(false);
                            onOpenJudgeHud();
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs text-cyan-300 hover:bg-slate-800/60 flex items-center space-x-2"
                        >
                          <Terminal className="w-3.5 h-3.5" />
                          <span>Open Judge HUD Console</span>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setAuthModalOpen(true);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-300 hover:bg-slate-800/60 flex items-center space-x-2"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Switch Auth Mode</span>
                      </button>
                      <button
                        id="btn-nav-logout"
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Exit Session / Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal (Normal Supabase vs One-Click Demo Mode) */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
