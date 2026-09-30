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
  History,
  Activity,
  Menu,
  X,
  LayoutDashboard
} from 'lucide-react';
import { AuthModal } from '@/components/AuthModal';

interface NavbarProps {
  currentView: 'landing' | 'dashboard';
  onChangeView: (view: 'landing' | 'dashboard') => void;
  onOpenHistory: () => void;
  onOpenApiStatus: () => void;
  onOpenJudgeHud?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onChangeView,
  onOpenHistory,
  onOpenApiStatus,
  onOpenJudgeHud
}) => {
  const { user, isDemo, role, loginWithJudgeDemo, logout } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 w-full backdrop-blur-2xl bg-slate-950/80 border-b border-slate-800/80 shadow-2xl">
        <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Left: Logo & Branding */}
          <div className="flex items-center space-x-3.5">
            <button
              onClick={() => onChangeView('landing')}
              className="flex items-center space-x-3.5 text-left cursor-pointer group"
            >
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-cyan-400 p-[1.5px] shadow-lg shadow-violet-500/20 group-hover:shadow-cyan-500/30 transition-all">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-lg tracking-wider text-white">
                    AETHER<span className="text-cyan-400">OPS</span>
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-violet-950/90 text-violet-300 border border-violet-800/60 uppercase">
                    AI v2.4
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono tracking-tight hidden lg:block">
                  Autonomous Cloud Infrastructure Incident Remediation Engine
                </p>
              </div>
            </button>
          </div>

          {/* Center: Live Status Badge */}
          <div className="hidden xl:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 shadow-lg shadow-emerald-950/40 text-xs font-mono">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold tracking-wider text-emerald-400 text-xs">
              AETHEROPS AGENT ONLINE · 99.98% AUTO-REMEDIATION RATE
            </span>
          </div>

          {/* Right Navigation Links (Desktop) */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3">
            <button
              onClick={() => onChangeView(currentView === 'dashboard' ? 'landing' : 'dashboard')}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-700/80 shadow-md shadow-cyan-950/50'
                  : 'text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{currentView === 'dashboard' ? 'Command Center' : 'Dashboard'}</span>
            </button>

            <button
              id="btn-nav-incident-logs"
              onClick={onOpenHistory}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <History className="w-3.5 h-3.5 text-violet-400" />
              <span>Incident Logs</span>
            </button>

            <button
              id="btn-nav-api-status"
              onClick={onOpenApiStatus}
              className="px-3 py-1.5 rounded-xl text-xs font-mono font-medium text-slate-300 hover:text-white hover:bg-slate-900/80 border border-transparent hover:border-slate-800 transition-all flex items-center space-x-1.5 cursor-pointer"
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>API Status</span>
            </button>

            {/* Judge Fast-Pass Quick Trigger Pill */}
            {!user ? (
              <button
                id="btn-nav-one-click-demo"
                onClick={loginWithJudgeDemo}
                className="relative group overflow-hidden px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-white transition-all duration-300 bg-gradient-to-r from-amber-500 via-violet-600 to-cyan-500 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95 flex items-center space-x-1.5 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5 text-amber-200 fill-amber-200 animate-pulse" />
                <span>⚡ Judge Fast-Pass</span>
              </button>
            ) : isDemo ? (
              <button
                id="btn-nav-judge-badge"
                onClick={onOpenJudgeHud}
                className="px-3 py-1.5 rounded-xl text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:border-amber-400 transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm shadow-amber-500/10"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>JUDGE EVALUATOR</span>
              </button>
            ) : null}

            {/* Auth Dropdown / Button */}
            {!user ? (
              <button
                id="btn-nav-login"
                onClick={() => setAuthModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer"
              >
                Sign In
              </button>
            ) : (
              <div className="relative">
                <button
                  id="btn-nav-user-menu"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-200 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-violet-500 to-cyan-400 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                    {user.email.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate hidden lg:inline-block font-mono text-[11px]">
                    {user.fullName || user.email.split('@')[0]}
                  </span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-panel rounded-2xl border border-slate-700/80 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3.5 py-2.5 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white">{user.fullName || 'Evaluator'}</p>
                      <p className="text-[11px] font-mono text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1.5 flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-violet-900/60 text-violet-300 border border-violet-700/50">
                          {role}
                        </span>
                        {isDemo && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-800/60">
                            Fast-Pass
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
                          className="w-full text-left px-3.5 py-2 text-xs text-cyan-300 hover:bg-slate-800/60 flex items-center space-x-2"
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
                        className="w-full text-left px-3.5 py-2 text-xs text-slate-300 hover:bg-slate-800/60 flex items-center space-x-2"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Switch Auth Credentials</span>
                      </button>
                      <button
                        id="btn-nav-logout"
                        onClick={async () => {
                          setUserMenuOpen(false);
                          await logout();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center space-x-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out of Session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex md:hidden items-center space-x-2">
            {!user && (
              <button
                onClick={loginWithJudgeDemo}
                className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40"
              >
                ⚡ Fast-Pass
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950/95 backdrop-blur-2xl p-4 space-y-3 animate-in slide-in-from-top duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => {
                  onChangeView('dashboard');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-cyan-300 flex items-center space-x-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Command Center</span>
              </button>

              <button
                onClick={() => {
                  onChangeView('landing');
                  setMobileMenuOpen(false);
                }}
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 flex items-center space-x-2"
              >
                <Cpu className="w-4 h-4" />
                <span>Landing Page</span>
              </button>
            </div>

            <div className="space-y-1 pt-2 border-t border-slate-800/80 text-xs">
              <button
                onClick={() => {
                  onOpenHistory();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg text-slate-300 hover:bg-slate-900 flex items-center space-x-2"
              >
                <History className="w-4 h-4 text-violet-400" />
                <span>Incident Logs & Audit</span>
              </button>

              <button
                onClick={() => {
                  onOpenApiStatus();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left p-2 rounded-lg text-slate-300 hover:bg-slate-900 flex items-center space-x-2"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                <span>API Gateway Health</span>
              </button>

              {user ? (
                <button
                  onClick={async () => {
                    await logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-lg text-rose-400 hover:bg-rose-950/40 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out ({user.email})</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-lg text-cyan-300 hover:bg-slate-900 flex items-center space-x-2"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
};
