import React from 'react';
import type { AppId } from '../types/os';
import { OSIcon } from './OSIcon';

interface DockItem {
  id: AppId;
  title: string;
  icon: string;
  gradient: string;
}

const DOCK_ITEMS: DockItem[] = [
  {
    id: 'academy',
    title: 'Manual & Academie',
    icon: 'academy',
    gradient: 'from-emerald-600 to-teal-700',
  },
  {
    id: 'journal',
    title: 'Memory Journal',
    icon: 'journal',
    gradient: 'from-blue-500 to-indigo-600',
  },
  {
    id: 'graph',
    title: 'Synapse Graph',
    icon: 'graph',
    gradient: 'from-purple-500 to-pink-600',
  },
  {
    id: 'vault',
    title: 'Memory Vault',
    icon: 'vault',
    gradient: 'from-amber-500 to-orange-600',
  },
  {
    id: 'recall',
    title: 'Recall Engine',
    icon: 'recall',
    gradient: 'from-cyan-500 to-blue-600',
  },
  {
    id: 'settings',
    title: 'Setări & Backup',
    icon: 'settings',
    gradient: 'from-slate-600 to-slate-800',
  },
];

interface DockProps {
  openAppIds: string[];
  activeAppId?: string;
  onAppClick: (appId: AppId) => void;
}

export const Dock: React.FC<DockProps> = ({
  openAppIds,
  activeAppId,
  onAppClick,
}) => {
  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40">
      <div className="px-3.5 py-2.5 rounded-2xl glass-panel shadow-glass flex items-center space-x-3.5 border border-white/20 transition-all duration-300 hover:border-white/30">
        {DOCK_ITEMS.map((item) => {
          const isOpen = openAppIds.includes(item.id);
          const isActive = activeAppId === item.id;

          return (
            <div key={item.id} className="relative group flex flex-col items-center">
              {/* Tooltip Label */}
              <div className="absolute -top-10 px-2.5 py-1 rounded-lg bg-slate-900/90 text-white text-[11px] font-medium opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none whitespace-nowrap shadow-xl border border-white/10 -translate-y-1 group-hover:translate-y-0">
                {item.title}
              </div>

              {/* Icon Button */}
              <button
                onClick={() => onAppClick(item.id)}
                className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${item.gradient} p-0.5 shadow-lg transform transition-all duration-200 group-hover:-translate-y-2 group-hover:scale-110 active:scale-95 flex items-center justify-center relative overflow-hidden`}
              >
                {/* Glass reflection top glaze */}
                <div className="absolute inset-x-0 top-0 h-1/2 bg-white/25 rounded-t-[10px] pointer-events-none" />
                <div className="w-full h-full rounded-[10px] flex items-center justify-center text-white bg-black/10">
                  <OSIcon name={item.icon} size={24} className="drop-shadow" />
                </div>
              </button>

              {/* Active / Open indicator dot */}
              <div className="h-1 mt-1 flex items-center justify-center">
                {isOpen && (
                  <span
                    className={`rounded-full transition-all duration-200 ${
                      isActive
                        ? 'w-2 h-1 bg-white shadow-[0_0_8px_white]'
                        : 'w-1 h-1 bg-white/60'
                    }`}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
