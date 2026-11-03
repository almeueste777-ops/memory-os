import React, { useState, useEffect } from 'react';
import type { AppId } from '../types/os';
import { Brain, Search, Wifi, WifiOff, Sparkles } from 'lucide-react';

interface TopBarProps {
  activeTitle?: string;
  totalMemories: number;
  totalConnections: number;
  onOpenSpotlight: () => void;
  onOpenApp: (appId: AppId) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTitle = 'Desktop',
  totalMemories,
  totalConnections,
  onOpenSpotlight,
  onOpenApp
}) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('ro-RO', {
          hour: '2-digit',
          minute: '2-digit'
        })
      );
      setDate(
        now.toLocaleDateString('ro-RO', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        })
      );
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="h-9 w-full bg-slate-950/60 backdrop-blur-md border-b border-white/[0.08] px-3 flex items-center justify-between text-xs text-slate-200 select-none z-50 fixed top-0 left-0 right-0">
      {/* Left Menu & System Identification */}
      <div className="flex items-center space-x-3">
        {/* Apple/OS Logo trigger */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex items-center space-x-1.5 font-bold hover:text-white px-2 py-1 rounded hover:bg-white/10 transition-colors"
          >
            <div className="w-5 h-5 rounded-md bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-sm">
              <Brain size={13} />
            </div>
            <span className="font-semibold tracking-wide">Memory OS</span>
          </button>

          {isMenuOpen && (
            <div
              className="absolute left-0 mt-1 w-60 rounded-xl glass-window py-1.5 shadow-2xl z-50 text-slate-200 animate-scale-up"
              onMouseLeave={() => setIsMenuOpen(false)}
            >
              <div className="px-3 py-1.5 border-b border-white/10 mb-1">
                <p className="font-semibold text-white text-[13px]">Memory OS 2.0</p>
                <p className="text-[10px] text-slate-400">PWA Glassmorphism Edition</p>
              </div>
              <button
                onClick={() => {
                  onOpenApp('academy');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-emerald-600/30 flex items-center justify-between text-emerald-300"
              >
                <span>Manual Mnemotehnică</span>
                <span className="text-[10px] text-slate-400">M</span>
              </button>
              <button
                onClick={() => {
                  onOpenApp('journal');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-600/30 flex items-center justify-between"
              >
                <span>Scrie o amintire</span>
                <span className="text-[10px] text-slate-400">J</span>
              </button>
              <button
                onClick={() => {
                  onOpenApp('graph');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-600/30 flex items-center justify-between"
              >
                <span>Deschide Graf Sinapse</span>
                <span className="text-[10px] text-slate-400">G</span>
              </button>
              <button
                onClick={() => {
                  onOpenApp('vault');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-600/30 flex items-center justify-between"
              >
                <span>Arhiva Vault</span>
                <span className="text-[10px] text-slate-400">V</span>
              </button>
              <button
                onClick={() => {
                  onOpenApp('recall');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-600/30 flex items-center justify-between"
              >
                <span>Reflecție Zilnică</span>
                <span className="text-[10px] text-slate-400">R</span>
              </button>
              <div className="h-[1px] bg-white/10 my-1" />
              <button
                onClick={() => {
                  onOpenApp('settings');
                  setIsMenuOpen(false);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-indigo-600/30 text-slate-300"
              >
                Configurare & Backup Cloudflare
              </button>
            </div>
          )}
        </div>

        <div className="h-4 w-[1px] bg-white/10" />

        <span className="font-medium text-slate-300 hidden sm:inline-block">
          {activeTitle}
        </span>
      </div>

      {/* Center: Cognitive Stats Pill */}
      <div className="hidden md:flex items-center space-x-2 bg-white/[0.04] border border-white/[0.08] px-3 py-0.5 rounded-full text-[11px]">
        <div className="flex items-center space-x-1 text-indigo-300">
          <Brain size={12} />
          <span>{totalMemories} amintiri</span>
        </div>
        <span className="text-slate-500">•</span>
        <div className="flex items-center space-x-1 text-purple-300">
          <Sparkles size={12} />
          <span>{totalConnections} sinapse</span>
        </div>
        <span className="text-slate-500">•</span>
        <span className="text-emerald-400 flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Offline-first
        </span>
      </div>

      {/* Right: Quick Search + Network + Clock */}
      <div className="flex items-center space-x-2.5">
        {/* Spotlight Trigger */}
        <button
          onClick={onOpenSpotlight}
          className="flex items-center space-x-1.5 bg-white/[0.08] hover:bg-white/[0.14] border border-white/[0.1] px-2.5 py-0.5 rounded-lg text-slate-300 hover:text-white transition-all shadow-sm"
          title="Căutare universală (Ctrl + K)"
        >
          <Search size={12} />
          <span className="hidden sm:inline text-[11px]">Căutare</span>
          <kbd className="text-[10px] bg-black/30 px-1 py-0.2 rounded border border-white/10 text-slate-400 font-mono">
            ⌘K
          </kbd>
        </button>

        <div className="flex items-center space-x-1 text-slate-400 px-1">
          {isOnline ? (
            <span title="Online">
              <Wifi size={13} className="text-emerald-400" />
            </span>
          ) : (
            <span title="Offline (PWA Cache activ)">
              <WifiOff size={13} className="text-amber-400" />
            </span>
          )}
        </div>

        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />

        {/* Date and Time */}
        <div className="flex items-center space-x-2 text-slate-300 font-medium tracking-tight">
          <span className="hidden sm:inline text-[11px] text-slate-400">{date}</span>
          <span className="font-semibold text-[12px]">{time}</span>
        </div>
      </div>
    </div>
  );
};
