import React, { useState, useEffect, useRef } from 'react';
import type { Memory } from '../db';
import type { AppId } from '../types/os';
import { Search, Brain, BookOpen, Share2, Database, Sparkles, Settings, ArrowRight, X } from 'lucide-react';

interface SpotlightProps {
  isOpen: boolean;
  onClose: () => void;
  memories: Memory[];
  onOpenApp: (appId: AppId) => void;
  onOpenMemory: (memory: Memory) => void;
}

export const Spotlight: React.FC<SpotlightProps> = ({
  isOpen,
  onClose,
  memories,
  onOpenApp,
  onOpenMemory,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const filteredMemories = query.trim()
    ? memories.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.content.toLowerCase().includes(query.toLowerCase()) ||
          m.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5)
    : [];

  const appActions: { id: AppId; title: string; subtitle: string; icon: any }[] = [
    { id: 'journal', title: 'Memory Journal', subtitle: 'Scrie un gând sau o notiță nouă', icon: BookOpen },
    { id: 'graph', title: 'Synapse Graph', subtitle: 'Explorează harta sinaptică a memoriei', icon: Share2 },
    { id: 'vault', title: 'Memory Vault', subtitle: 'Caută și filtrează toate amintirile', icon: Database },
    { id: 'recall', title: 'Recall Engine', subtitle: 'Sesiune de reflecție și reactivare a memoriei', icon: Sparkles },
    { id: 'settings', title: 'Setări Sistem & Backup', subtitle: 'Teme, export Cloudflare, PWA offline', icon: Settings },
  ];

  const filteredApps = query.trim()
    ? appActions.filter((a) =>
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : appActions;

  // Flattened items for keyboard navigation
  const allResults = [
    ...filteredApps.map((a) => ({ type: 'app' as const, data: a })),
    ...filteredMemories.map((m) => ({ type: 'memory' as const, data: m })),
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, allResults.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + allResults.length) % Math.max(1, allResults.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = allResults[selectedIndex];
        if (selected) {
          if (selected.type === 'app') {
            onOpenApp(selected.data.id);
          } else {
            onOpenMemory(selected.data);
          }
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allResults, onClose, onOpenApp, onOpenMemory]);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-start justify-center pt-24 px-4 animate-fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl glass-window rounded-2xl shadow-2xl overflow-hidden border border-white/20 animate-scale-up"
      >
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-white/10 gap-3">
          <Search size={20} className="text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Ce vrei să găsești sau să faci în Memory OS? (ex: neuroștiință, jurnal, Seneca...)"
            className="w-full bg-transparent text-slate-100 placeholder-slate-400 text-sm focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-white p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {/* Applications & System Shortcuts */}
          {filteredApps.length > 0 && (
            <div className="mb-2">
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Aplicații & Comenzi
              </div>
              {filteredApps.map((app, index) => {
                const Icon = app.icon;
                const isSelected = selectedIndex === index;
                return (
                  <button
                    key={app.id}
                    onClick={() => {
                      onOpenApp(app.id);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-indigo-600/35 border border-indigo-500/40 text-white'
                        : 'hover:bg-white/[0.05] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center">
                        <Icon size={16} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{app.title}</div>
                        <div className="text-[11px] text-slate-400">{app.subtitle}</div>
                      </div>
                    </div>
                    <ArrowRight size={14} className="opacity-40" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Matched Memories */}
          {filteredMemories.length > 0 && (
            <div>
              <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Amintiri & Gânduri ({filteredMemories.length})
              </div>
              {filteredMemories.map((mem, i) => {
                const itemIndex = filteredApps.length + i;
                const isSelected = selectedIndex === itemIndex;
                return (
                  <button
                    key={mem.id}
                    onClick={() => {
                      onOpenMemory(mem);
                      onClose();
                    }}
                    onMouseEnter={() => setSelectedIndex(itemIndex)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? 'bg-purple-600/35 border border-purple-500/40 text-white'
                        : 'hover:bg-white/[0.05] text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0">
                        <Brain size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-semibold text-white truncate">{mem.title}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-sm">{mem.content}</div>
                        <div className="flex gap-1 mt-1">
                          {mem.tags.map((t) => (
                            <span key={t} className="text-[9px] bg-white/10 px-1.5 py-0.2 rounded text-slate-300">
                              #{t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(mem.date).toLocaleDateString('ro-RO')}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {allResults.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-xs">
              Niciun rezultat găsit pentru "{query}". Încearcă un alt cuvânt sau adaugă o amintire nouă.
            </div>
          )}
        </div>

        {/* Keyboard tips footer */}
        <div className="px-4 py-2 bg-white/[0.02] border-t border-white/[0.06] flex items-center justify-between text-[10px] text-slate-400">
          <div className="flex items-center space-x-3">
            <span>↑↓ pentru navigare</span>
            <span>↵ pentru selectare</span>
            <span>esc pentru închidere</span>
          </div>
          <span className="text-indigo-400 font-medium">Memory OS v2</span>
        </div>
      </div>
    </div>
  );
};
