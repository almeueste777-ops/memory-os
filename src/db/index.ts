import Dexie, { type Table } from 'dexie';

export type MemoryCategory = 'thought' | 'experience' | 'idea' | 'learning' | 'quote' | 'person';
export type EmotionType = 'joy' | 'clarity' | 'calm' | 'insight' | 'melancholy' | 'energy' | 'neutral';

export interface Memory {
  id?: number;
  title: string;
  content: string;
  category: MemoryCategory;
  tags: string[];
  date: string; // ISO date string
  pinned?: boolean;
  favorite?: boolean;
  importance: number; // 1 to 5
  emotion: EmotionType;
  mediaUrl?: string; // Data URL or Image string
  connectedMemoryIds?: number[];
  recallCount?: number;
  lastRecalledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OSSettings {
  id: string; // 'system'
  wallpaper: string;
  theme: 'dark' | 'light';
  userName: string;
  soundEnabled: boolean;
  dockPosition: 'bottom' | 'left' | 'top';
}

export class MemoryOSDatabase extends Dexie {
  memories!: Table<Memory, number>;
  settings!: Table<OSSettings, string>;

  constructor() {
    super('MemoryOS_DB');
    this.version(1).stores({
      memories: '++id, title, category, *tags, date, pinned, favorite, importance, emotion, createdAt',
      settings: 'id'
    });
  }
}

export const db = new MemoryOSDatabase();

// Seed initial memory system if completely empty
export async function seedInitialMemoriesIfEmpty() {
  const count = await db.memories.count();
  if (count === 0) {
    const now = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const lastWeek = new Date(Date.now() - 86400000 * 7);
    const lastMonth = new Date(Date.now() - 86400000 * 30);

    const m1 = await db.memories.add({
      title: 'Geneza Memory OS: Al doilea creier digital',
      content: 'Astăzi am pornit sistemul de operare pentru memorie. Obiectivul: să externalizez gândurile fugitive, conexiunile neuronale și revelațiile fără a fi limitat de dosare rigide. Sistemul funcționează offline, 100% privat în browser.',
      category: 'idea',
      tags: ['antigravity', 'arhitectură', 'second-brain', 'pwa'],
      date: now.toISOString(),
      pinned: true,
      favorite: true,
      importance: 5,
      emotion: 'clarity',
      connectedMemoryIds: [],
      recallCount: 2,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    });

    const m2 = await db.memories.add({
      title: 'Despre memorie și sinapse cognitive',
      content: 'Memoria umană nu funcționează ca un hard-disk cu fișiere separate, ci ca o pânză asociativă. Un miros sau o melodie reactivează o rețea întreagă de stări și cunoștințe. De aceea vizualizarea prin Graf este esențială.',
      category: 'learning',
      tags: ['neuroștiință', 'sinapse', 'second-brain', 'cunoaștere'],
      date: yesterday.toISOString(),
      pinned: false,
      favorite: true,
      importance: 4,
      emotion: 'insight',
      connectedMemoryIds: [m1],
      recallCount: 1,
      createdAt: yesterday.toISOString(),
      updatedAt: yesterday.toISOString(),
    });

    const m3 = await db.memories.add({
      title: 'Plimbare de seară sub cerul senin',
      content: 'Aer rece, liniște deplină după o zi lungă de concentrare. Mi-am dat seama că cele mai bune idei de arhitectură software apar atunci când deconectez activ atenția conștientă.',
      category: 'experience',
      tags: ['reflecție', 'creativitate', 'echilibru'],
      date: lastWeek.toISOString(),
      pinned: false,
      favorite: false,
      importance: 3,
      emotion: 'calm',
      connectedMemoryIds: [m1, m2],
      recallCount: 0,
      createdAt: lastWeek.toISOString(),
      updatedAt: lastWeek.toISOString(),
    });

    await db.memories.add({
      title: 'Citat preferat: Seneca despre timp',
      content: '"Nu este că avem puțin timp, ci că pierdem mult din el. Viața este destul de lungă și ne-a fost dată o măsură generoasă pentru cele mai înalte realizări, dacă am investi-o bine."',
      category: 'quote',
      tags: ['filozofie', 'stoicism', 'timp'],
      date: lastMonth.toISOString(),
      pinned: true,
      favorite: true,
      importance: 5,
      emotion: 'insight',
      connectedMemoryIds: [m3],
      recallCount: 3,
      createdAt: lastMonth.toISOString(),
      updatedAt: lastMonth.toISOString(),
    });

    // Cross-link
    await db.memories.update(m1, { connectedMemoryIds: [m2, m3] });
  }

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'system',
      wallpaper: 'aurora',
      theme: 'dark',
      userName: 'Navigator Cognitiv',
      soundEnabled: true,
      dockPosition: 'bottom'
    });
  }
}
