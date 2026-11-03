import React from 'react';
import type { AppId } from '../types/os';
import { OSIcon } from './OSIcon';

interface DesktopIconsProps {
  onOpenApp: (appId: AppId) => void;
}

export const DesktopIcons: React.FC<DesktopIconsProps> = ({ onOpenApp }) => {
  const desktopApps: { id: AppId; name: string; icon: string; color: string }[] = [
    { id: 'loci-world', name: 'Palat Virtual 3D', icon: 'loci-world', color: 'bg-rose-500/20 text-rose-400 border-rose-500/30' },
    { id: 'academy', name: 'Manual Mnemotehnică', icon: 'academy', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'journal', name: 'Jurnal & Captură', icon: 'journal', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    { id: 'graph', name: 'Graf Sinapse', icon: 'graph', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    { id: 'vault', name: 'Seif Amintiri', icon: 'vault', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    { id: 'recall', name: 'Recall Engine', icon: 'recall', color: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
    { id: 'settings', name: 'Configurare OS', icon: 'settings', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  ];

  return (
    <div className="absolute top-12 left-6 p-2 flex flex-col space-y-3 select-none z-10">
      {desktopApps.map((app) => (
        <button
          key={app.id}
          onDoubleClick={() => onOpenApp(app.id)}
          onClick={(e) => {
            if (e.detail === 2) {
              onOpenApp(app.id);
            }
          }}
          className="group flex flex-col items-center w-24 p-1 rounded-xl hover:bg-white/[0.08] focus:bg-white/[0.12] transition-colors cursor-pointer text-center"
        >
          <div className={`w-13 h-13 rounded-2xl flex items-center justify-center border backdrop-blur-md shadow-md group-hover:scale-105 group-active:scale-95 transition-transform ${app.color}`}>
            <OSIcon name={app.icon} size={25} />
          </div>
          <span className="mt-1 text-xs font-medium text-slate-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] group-hover:text-white line-clamp-1">
            {app.name}
          </span>
        </button>
      ))}
    </div>
  );
};
