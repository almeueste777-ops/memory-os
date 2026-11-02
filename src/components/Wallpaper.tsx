import React from 'react';

interface WallpaperProps {
  type: string;
}

export const Wallpaper: React.FC<WallpaperProps> = ({ type }) => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none select-none transition-colors duration-700">
      {type === 'aurora' && (
        <div className="absolute inset-0 bg-[#070b14]">
          <div className="absolute -top-[20%] -left-[10%] w-[60vw] h-[60vw] rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/25 to-pink-500/10 blur-[130px] animate-pulse-slow" />
          <div className="absolute top-[40%] -right-[15%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-bl from-cyan-600/25 via-blue-700/20 to-teal-500/10 blur-[140px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-[20%] left-[25%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-t from-violet-700/25 via-indigo-900/30 to-transparent blur-[120px]" />
        </div>
      )}

      {type === 'deep-cosmos' && (
        <div className="absolute inset-0 bg-[#04060d]">
          <div className="absolute top-[10%] left-[20%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-fuchsia-600/25 via-purple-900/30 to-blue-900/10 blur-[140px]" />
          <div className="absolute bottom-[5%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-indigo-500/20 via-sky-800/15 to-transparent blur-[130px]" />
          {/* Subtle star speckles */}
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:36px_36px] opacity-15" />
        </div>
      )}

      {type === 'cyberpunk' && (
        <div className="absolute inset-0 bg-[#090915]">
          <div className="absolute -top-[10%] right-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-b from-pink-600/30 via-rose-700/20 to-transparent blur-[140px]" />
          <div className="absolute bottom-[0%] -left-[10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-tr from-cyan-500/30 via-teal-700/15 to-transparent blur-[130px]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px]" />
        </div>
      )}

      {type === 'emerald' && (
        <div className="absolute inset-0 bg-[#05110d]">
          <div className="absolute top-[5%] left-[10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-br from-emerald-600/25 via-teal-800/20 to-transparent blur-[130px]" />
          <div className="absolute bottom-[10%] right-[15%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-tl from-cyan-600/20 via-teal-900/25 to-transparent blur-[140px]" />
        </div>
      )}

      {type === 'minimal-slate' && (
        <div className="absolute inset-0 bg-[#0c121e]">
          <div className="absolute top-[20%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-slate-700/15 blur-[120px]" />
        </div>
      )}

      {/* Global noise texture for realistic frosted glass refractions */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/[0.04] via-transparent to-black/40 pointer-events-none" />
    </div>
  );
};
