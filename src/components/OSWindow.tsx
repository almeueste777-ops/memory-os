import React, { useState, useRef, useEffect } from 'react';
import type { WindowState } from '../types/os';
import { OSIcon } from './OSIcon';

interface OSWindowProps {
  window: WindowState;
  onClose: (id: string) => void;
  onMinimize: (id: string) => void;
  onMaximize: (id: string) => void;
  onFocus: (id: string) => void;
  onUpdatePosition: (id: string, x: number, y: number) => void;
  onUpdateSize: (id: string, width: number, height: number) => void;
  children: React.ReactNode;
}

export const OSWindow: React.FC<OSWindowProps> = ({
  window: win,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  onUpdatePosition,
  onUpdateSize,
  children
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; winX: number; winY: number }>({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; width: number; height: number }>({ mouseX: 0, mouseY: 0, width: 0, height: 0 });

  // Handle Dragging
  const handleMouseDownHeader = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    onFocus(win.id);
    setIsDragging(true);
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: win.x,
      winY: win.y
    };
  };

  // Handle Resizing
  const handleMouseDownResize = (e: React.MouseEvent) => {
    if (win.isMaximized) return;
    e.stopPropagation();
    onFocus(win.id);
    setIsResizing(true);
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      width: win.width,
      height: win.height
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        const deltaX = e.clientX - dragStartRef.current.mouseX;
        const deltaY = e.clientY - dragStartRef.current.mouseY;
        const newX = Math.max(10, Math.min(window.innerWidth - 100, dragStartRef.current.winX + deltaX));
        const newY = Math.max(36, Math.min(window.innerHeight - 100, dragStartRef.current.winY + deltaY));
        onUpdatePosition(win.id, newX, newY);
      } else if (isResizing) {
        const deltaW = e.clientX - resizeStartRef.current.mouseX;
        const deltaH = e.clientY - resizeStartRef.current.mouseY;
        const newW = Math.max(380, Math.min(window.innerWidth - 40, resizeStartRef.current.width + deltaW));
        const newH = Math.max(280, Math.min(window.innerHeight - 90, resizeStartRef.current.height + deltaH));
        onUpdateSize(win.id, newW, newH);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, win.id, onUpdatePosition, onUpdateSize]);

  if (!win.isOpen || win.isMinimized) return null;

  const style: React.CSSProperties = win.isMaximized
    ? {
        position: 'fixed',
        top: '36px',
        left: '0px',
        right: '0px',
        bottom: '80px',
        width: '100%',
        height: 'calc(100vh - 116px)',
        zIndex: win.zIndex,
      }
    : {
        position: 'fixed',
        left: `${win.x}px`,
        top: `${win.y}px`,
        width: `${win.width}px`,
        height: `${win.height}px`,
        zIndex: win.zIndex,
      };

  return (
    <div
      style={style}
      onMouseDown={() => onFocus(win.id)}
      className={`glass-window rounded-2xl flex flex-col overflow-hidden transition-all duration-150 ${
        win.isMaximized ? 'rounded-none border-x-0' : 'animate-scale-up'
      }`}
    >
      {/* Titlebar Header */}
      <div
        onMouseDown={handleMouseDownHeader}
        onDoubleClick={() => onMaximize(win.id)}
        className="h-10 px-4 bg-white/[0.04] border-b border-white/[0.08] flex items-center justify-between cursor-move select-none shrink-0"
      >
        {/* Traffic Lights Buttons */}
        <div className="flex items-center space-x-2 group/lights">
          <button
            title="Închide fereastra"
            onClick={(e) => {
              e.stopPropagation();
              onClose(win.id);
            }}
            className="w-3.5 h-3.5 rounded-full bg-rose-500/80 hover:bg-rose-500 border border-rose-600/50 flex items-center justify-center text-[10px] text-rose-950 opacity-90 group-hover/lights:opacity-100 transition-colors shadow-sm"
          >
            <span className="opacity-0 group-hover/lights:opacity-100 font-bold leading-none">×</span>
          </button>
          <button
            title="Minimizează"
            onClick={(e) => {
              e.stopPropagation();
              onMinimize(win.id);
            }}
            className="w-3.5 h-3.5 rounded-full bg-amber-500/80 hover:bg-amber-500 border border-amber-600/50 flex items-center justify-center text-[10px] text-amber-950 opacity-90 group-hover/lights:opacity-100 transition-colors shadow-sm"
          >
            <span className="opacity-0 group-hover/lights:opacity-100 font-bold leading-none">−</span>
          </button>
          <button
            title="Maximizează / Restaurează"
            onClick={(e) => {
              e.stopPropagation();
              onMaximize(win.id);
            }}
            className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 hover:bg-emerald-500 border border-emerald-600/50 flex items-center justify-center text-[8px] text-emerald-950 opacity-90 group-hover/lights:opacity-100 transition-colors shadow-sm"
          >
            <span className="opacity-0 group-hover/lights:opacity-100 font-bold leading-none">⤢</span>
          </button>
        </div>

        {/* Window Title & Icon */}
        <div className="flex items-center space-x-2 text-xs font-medium text-slate-300 pointer-events-none truncate max-w-[60%]">
          <OSIcon name={win.iconName} size={14} className="text-indigo-400 shrink-0" />
          <span className="truncate">{win.title}</span>
        </div>

        {/* Right side placeholder for balance */}
        <div className="w-14 text-right">
          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase">OS</span>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 overflow-auto bg-slate-950/40 relative">
        {children}
      </div>

      {/* Resize Grip (Only when not maximized) */}
      {!win.isMaximized && (
        <div
          onMouseDown={handleMouseDownResize}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize flex items-end justify-end p-1 select-none opacity-40 hover:opacity-100 transition-opacity"
        >
          <div className="w-1.5 h-1.5 border-r-2 border-b-2 border-white/60" />
        </div>
      )}
    </div>
  );
};
