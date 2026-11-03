import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, seedInitialMemoriesIfEmpty, type Memory } from './db';
import type { AppId, WindowState } from './types/os';
import { Wallpaper } from './components/Wallpaper';
import { TopBar } from './components/TopBar';
import { Dock } from './components/Dock';
import { DesktopIcons } from './components/DesktopIcons';
import { OSWindow } from './components/OSWindow';
import { Spotlight } from './components/Spotlight';

// Apps
import { LociWorldApp } from './apps/LociWorldApp';
import { AcademyApp } from './apps/AcademyApp';
import { JournalApp } from './apps/JournalApp';
import { GraphApp } from './apps/GraphApp';
import { VaultApp } from './apps/VaultApp';
import { RecallApp } from './apps/RecallApp';
import { SettingsApp } from './apps/SettingsApp';
import { MemoryViewerApp } from './apps/MemoryViewerApp';

const DEFAULT_WINDOWS: Record<AppId, Omit<WindowState, 'id' | 'zIndex' | 'isOpen' | 'isMinimized' | 'isMaximized'>> = {
  'loci-world': {
    appId: 'loci-world',
    title: 'Palatul Virtual Loci — Lume 3D Interactivă',
    iconName: 'loci-world',
    x: 65,
    y: 45,
    width: 920,
    height: 630,
  },
  academy: {
    appId: 'academy',
    title: 'Manual de Mnemotehnică & Academie',
    iconName: 'academy',
    x: 100,
    y: 60,
    width: 860,
    height: 590,
  },
  journal: {
    appId: 'journal',
    title: 'Memory Journal & Stream',
    iconName: 'journal',
    x: 120,
    y: 70,
    width: 780,
    height: 580,
  },
  graph: {
    appId: 'graph',
    title: 'Synapse Graph — Rețea Mentală',
    iconName: 'graph',
    x: 140,
    y: 80,
    width: 860,
    height: 600,
  },
  vault: {
    appId: 'vault',
    title: 'Memory Vault — Seif & Arhivă',
    iconName: 'vault',
    x: 110,
    y: 70,
    width: 820,
    height: 560,
  },
  recall: {
    appId: 'recall',
    title: 'Recall Engine — Reflecție Zilnică',
    iconName: 'recall',
    x: 180,
    y: 90,
    width: 700,
    height: 540,
  },
  settings: {
    appId: 'settings',
    title: 'Configurare OS & Cloudflare',
    iconName: 'settings',
    x: 200,
    y: 100,
    width: 720,
    height: 520,
  },
  'memory-viewer': {
    appId: 'memory-viewer',
    title: 'Vizualizator Amintire',
    iconName: 'brain',
    x: 160,
    y: 75,
    width: 680,
    height: 540,
  },
};

export function App() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string>('loci-world');
  const [wallpaper, setWallpaper] = useState<string>('aurora');
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [topZ, setTopZ] = useState(10);

  // Live queries to Dexie
  const memories = useLiveQuery(() => db.memories.toArray(), []) || [];
  const settings = useLiveQuery(() => db.settings.get('system'), []);

  // Initialize DB & Seed Data
  useEffect(() => {
    seedInitialMemoriesIfEmpty();

    // Listen for PWA install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // Initial default window: Loci World 3D open by default!
    setWindows([
      {
        id: 'loci-world',
        ...DEFAULT_WINDOWS['loci-world'],
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: 10,
      },
    ]);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  // Sync wallpaper if loaded from settings
  useEffect(() => {
    if (settings?.wallpaper) {
      setWallpaper(settings.wallpaper);
    }
  }, [settings?.wallpaper]);

  // Global Keyboard Shortcuts (Ctrl+K / Cmd+K for Spotlight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Window Focus / Bring to front
  const focusWindow = (id: string) => {
    setActiveWindowId(id);
    const newZ = topZ + 1;
    setTopZ(newZ);
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: newZ, isMinimized: false } : w))
    );
  };

  // Open App or restore
  const handleOpenApp = (appId: AppId, payload?: any) => {
    const existing = windows.find((w) => w.id === appId);

    if (existing) {
      if (!existing.isOpen || existing.isMinimized) {
        setWindows((prev) =>
          prev.map((w) =>
            w.id === appId
              ? { ...w, isOpen: true, isMinimized: false, zIndex: topZ + 1, payload: payload || w.payload }
              : w
          )
        );
      }
      focusWindow(appId);
    } else {
      const template = DEFAULT_WINDOWS[appId] || DEFAULT_WINDOWS.journal;
      const newZ = topZ + 1;
      setTopZ(newZ);

      const offset = (windows.length % 5) * 24;

      const newWin: WindowState = {
        id: appId,
        ...template,
        x: Math.min(window.innerWidth - template.width - 20, template.x + offset),
        y: Math.min(window.innerHeight - template.height - 70, template.y + offset),
        isOpen: true,
        isMinimized: false,
        isMaximized: false,
        zIndex: newZ,
        payload,
      };

      setWindows((prev) => [...prev, newWin]);
      setActiveWindowId(appId);
    }
  };

  // Open specific Memory in a dedicated viewer window
  const handleOpenMemoryViewer = (memory: Memory) => {
    const viewerId = 'memory-viewer';
    const existing = windows.find((w) => w.id === viewerId);
    const newZ = topZ + 1;
    setTopZ(newZ);

    if (existing) {
      setWindows((prev) =>
        prev.map((w) =>
          w.id === viewerId
            ? {
                ...w,
                isOpen: true,
                isMinimized: false,
                zIndex: newZ,
                title: memory.title,
                payload: memory,
              }
            : w
        )
      );
    } else {
      const template = DEFAULT_WINDOWS['memory-viewer'];
      setWindows((prev) => [
        ...prev,
        {
          id: viewerId,
          ...template,
          title: memory.title,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          zIndex: newZ,
          payload: memory,
        },
      ]);
    }
    setActiveWindowId(viewerId);
  };

  // Window Controls
  const handleCloseWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isOpen: false } : w)));
  };

  const handleMinimizeWindow = (id: string) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w)));
  };

  const handleMaximizeWindow = (id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
  };

  const handleUpdatePosition = (id: string, x: number, y: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, x, y } : w)));
  };

  const handleUpdateSize = (id: string, width: number, height: number) => {
    setWindows((prev) => prev.map((w) => (w.id === id ? { ...w, width, height } : w)));
  };

  // Change Wallpaper & Persist
  const handleWallpaperChange = async (newWp: string) => {
    setWallpaper(newWp);
    await db.settings.put({
      id: 'system',
      wallpaper: newWp,
      theme: 'dark',
      userName: 'Navigator Cognitiv',
      soundEnabled: true,
      dockPosition: 'bottom',
    });
  };

  // Compute metrics
  const totalConnections = memories.reduce((acc, m) => acc + (m.connectedMemoryIds?.length || 0), 0);
  const activeWindow = windows.find((w) => w.id === activeWindowId && w.isOpen && !w.isMinimized);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none">
      {/* 1. Dynamic Wallpaper Layer */}
      <Wallpaper type={wallpaper} />

      {/* 2. Top System Bar */}
      <TopBar
        activeTitle={activeWindow ? activeWindow.title : 'Desktop'}
        totalMemories={memories.length}
        totalConnections={totalConnections}
        onOpenSpotlight={() => setIsSpotlightOpen(true)}
        onOpenApp={(id) => handleOpenApp(id)}
      />

      {/* 3. Desktop Surface Icons */}
      <DesktopIcons onOpenApp={handleOpenApp} />

      {/* 4. Draggable / Resizable Windows */}
      {windows.map((win) => (
        <OSWindow
          key={win.id}
          window={win}
          onClose={handleCloseWindow}
          onMinimize={handleMinimizeWindow}
          onMaximize={handleMaximizeWindow}
          onFocus={focusWindow}
          onUpdatePosition={handleUpdatePosition}
          onUpdateSize={handleUpdateSize}
        >
          {win.appId === 'loci-world' && (
            <LociWorldApp onOpenViewer={handleOpenMemoryViewer} />
          )}

          {win.appId === 'academy' && (
            <AcademyApp />
          )}

          {win.appId === 'journal' && (
            <JournalApp
              allMemories={memories}
              onMemoryCreated={() => {}}
              onOpenViewer={handleOpenMemoryViewer}
            />
          )}

          {win.appId === 'graph' && (
            <GraphApp
              memories={memories}
              onSelectMemory={handleOpenMemoryViewer}
            />
          )}

          {win.appId === 'vault' && (
            <VaultApp
              memories={memories}
              onOpenViewer={handleOpenMemoryViewer}
              onRefresh={() => {}}
            />
          )}

          {win.appId === 'recall' && (
            <RecallApp
              memories={memories}
              onRefresh={() => {}}
            />
          )}

          {win.appId === 'settings' && (
            <SettingsApp
              currentWallpaper={wallpaper}
              onWallpaperChange={handleWallpaperChange}
              onRefreshAll={() => {}}
              deferredPrompt={deferredPrompt}
            />
          )}

          {win.appId === 'memory-viewer' && win.payload && (
            <MemoryViewerApp
              memory={win.payload}
              allMemories={memories}
              onSelectAnotherMemory={handleOpenMemoryViewer}
              onMemoryUpdated={() => {}}
            />
          )}
        </OSWindow>
      ))}

      {/* 5. Spotlight Search Modal */}
      <Spotlight
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
        memories={memories}
        onOpenApp={handleOpenApp}
        onOpenMemory={handleOpenMemoryViewer}
      />

      {/* 6. Frosted Glass Bottom Dock */}
      <Dock
        openAppIds={windows.filter((w) => w.isOpen && !w.isMinimized).map((w) => w.appId)}
        activeAppId={activeWindow?.appId}
        onAppClick={handleOpenApp}
      />
    </div>
  );
}

export default App;
