import React, { useState } from 'react';
import { db } from '../db';
import { 
  Download, 
  Upload, 
  Palette, 
  Smartphone, 
  ShieldCheck, 
  Cloud,
  HardDrive
} from 'lucide-react';

interface SettingsAppProps {
  currentWallpaper: string;
  onWallpaperChange: (wp: string) => void;
  onRefreshAll: () => void;
  deferredPrompt?: any;
}

const WALLPAPERS = [
  { id: 'aurora', name: 'Aurora Glass', gradient: 'from-indigo-600 via-purple-600 to-pink-500' },
  { id: 'deep-cosmos', name: 'Deep Cosmos', gradient: 'from-fuchsia-600 via-purple-900 to-blue-900' },
  { id: 'cyberpunk', name: 'Cyberpunk Pulse', gradient: 'from-pink-600 via-rose-700 to-cyan-500' },
  { id: 'emerald', name: 'Emerald Neural', gradient: 'from-emerald-600 via-teal-800 to-cyan-700' },
  { id: 'minimal-slate', name: 'Minimal Slate', gradient: 'from-slate-700 to-slate-900' },
];

export const SettingsApp: React.FC<SettingsAppProps> = ({
  currentWallpaper,
  onWallpaperChange,
  onRefreshAll,
  deferredPrompt,
}) => {
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'appearance' | 'data' | 'deploy'>('appearance');

  const handleExportData = async () => {
    const memories = await db.memories.toArray();
    const settings = await db.settings.toArray();
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      memories,
      settings,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `memory-os-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const json = JSON.parse(reader.result as string);
        if (Array.isArray(json.memories)) {
          await db.memories.clear();
          await db.memories.bulkAdd(json.memories);
        }
        if (Array.isArray(json.settings) && json.settings.length > 0) {
          await db.settings.clear();
          await db.settings.bulkAdd(json.settings);
        }
        setImportSuccess(true);
        setTimeout(() => setImportSuccess(false), 3000);
        onRefreshAll();
      } catch (err) {
        alert('Fișier JSON invalid pentru restaurare.');
      }
    };
    reader.readAsText(file);
  };

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User prompt outcome: ${outcome}`);
    } else {
      alert('Aplicația PWA este deja instalată sau browserul tău nu suportă instalarea automată directă (folosește opțiunea "Install Memory OS" din meniul browserului).');
    }
  };

  return (
    <div className="flex h-full text-slate-200">
      {/* Sidebar Tabs */}
      <div className="w-48 border-r border-white/10 p-3 space-y-1.5 shrink-0 bg-white/[0.02]">
        <button
          onClick={() => setActiveTab('appearance')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'appearance'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Palette size={15} />
          <span>Aspect & Teme</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'data'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <HardDrive size={15} />
          <span>Date & PWA</span>
        </button>

        <button
          onClick={() => setActiveTab('deploy')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'deploy'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Cloud size={15} />
          <span>GitHub & Cloudflare</span>
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Fundal Desktop & Atmosferă</h3>
              <p className="text-xs text-slate-400">
                Alege fundalul cromatic pentru reflexiile de sticlă ale interfeței Glassmorphism.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {WALLPAPERS.map((wp) => (
                <button
                  key={wp.id}
                  onClick={() => onWallpaperChange(wp.id)}
                  className={`p-3.5 rounded-2xl border text-left flex items-center space-x-3.5 transition-all ${
                    currentWallpaper === wp.id
                      ? 'border-indigo-400 bg-indigo-500/20 ring-2 ring-indigo-500/40'
                      : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.08]'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${wp.gradient} shadow-md shrink-0`} />
                  <div>
                    <div className="text-xs font-bold text-white">{wp.name}</div>
                    <div className="text-[11px] text-slate-400">
                      {currentWallpaper === wp.id ? 'Activ acum' : 'Apasă pentru activare'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Gestionare Date & Portabilitate</h3>
              <p className="text-xs text-slate-400">
                Toate datele tale sunt stocate 100% local în browser (IndexedDB). Nicio informație nu părăsește dispozitivul tău.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Exportă Baza de Date Completă</h4>
                  <p className="text-[11px] text-slate-400">
                    Descarcă o copie de siguranță JSON cu toate amintirile, sinapsele și setările.
                  </p>
                </div>
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-medium text-white flex items-center space-x-1.5 shadow-md"
                >
                  <Download size={14} />
                  <span>{exportSuccess ? 'Exportat cu succes!' : 'Exportă JSON'}</span>
                </button>
              </div>

              <div className="h-[1px] bg-white/10" />

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white">Restaurează din Backup</h4>
                  <p className="text-[11px] text-slate-400">
                    Încarcă un fișier JSON exportat anterior pentru a restaura amintirile.
                  </p>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 rounded-xl text-xs font-medium text-white flex items-center space-x-1.5 transition-colors">
                  <Upload size={14} />
                  <span>{importSuccess ? 'Restaurat!' : 'Alege fișier'}</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportData}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* PWA Section */}
            <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Smartphone size={14} className="text-emerald-400" />
                    Instalare ca Aplicație Nativă (PWA)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Instalează Memory OS pe Windows, Mac, iPad sau telefon pentru a rula în fereastră proprie, fără bara browserului.
                  </p>
                </div>
                <button
                  onClick={handleInstallPWA}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-medium text-white flex items-center space-x-1.5 shadow-md"
                >
                  <Smartphone size={14} />
                  <span>Instalează PWA</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'deploy' && (
          <div className="space-y-5">
            <div>
              <h3 className="text-base font-bold text-white mb-1">Ghid Publicare pe GitHub & Cloudflare</h3>
              <p className="text-xs text-slate-400">
                Fiind o aplicație 100% client-side (fără backend API sau chei secrete), poate fi găzduită gratuit și ultra-rapid pe Cloudflare Pages!
              </p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="glass-card rounded-xl p-3.5 border border-white/10">
                <div className="font-semibold text-indigo-300 mb-1 flex items-center gap-1.5">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                  <span>Pasul 1: Salvează pe GitHub</span>
                </div>
                <pre className="p-2.5 rounded-lg bg-black/40 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`git init
git add .
git commit -m "Initial Memory OS release"
git branch -M main
git remote add origin https://github.com/UTILIZATOR/memory-os.git
git push -u origin main`}
                </pre>
              </div>

              <div className="glass-card rounded-xl p-3.5 border border-white/10">
                <div className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Cloud size={14} /> Pasul 2: Conectează la Cloudflare Pages
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-300">
                  <li>Intră în contul tău <strong>Cloudflare Dashboard</strong> &gt; <strong>Workers &amp; Pages</strong>.</li>
                  <li>Apasă pe <strong>Create application</strong> &gt; fila <strong>Pages</strong> &gt; <strong>Connect to Git</strong>.</li>
                  <li>Selectează repository-ul tău GitHub <code>memory-os</code>.</li>
                  <li>Configurație de build:
                    <ul className="list-disc list-inside ml-4 text-slate-400 mt-1">
                      <li>Framework preset: <strong className="text-white">Vite</strong></li>
                      <li>Build command: <code className="text-indigo-300">npm run build</code></li>
                      <li>Build output directory: <code className="text-indigo-300">dist</code></li>
                    </ul>
                  </li>
                  <li>Apasă <strong>Save and Deploy</strong>. Cloudflare îți va oferi un domeniu instant (ex: <code>memory-os.pages.dev</code>).</li>
                </ol>
              </div>

              <div className="glass-card rounded-xl p-3 border border-emerald-500/30 bg-emerald-500/10 text-emerald-200">
                <p className="flex items-center gap-1.5 font-medium">
                  <ShieldCheck size={16} /> 0 Costuri • 0 API externe • 100% Securitate &amp; Confidențialitate
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
