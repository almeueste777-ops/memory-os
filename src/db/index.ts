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

export interface LocusStation {
  id: string;
  order: number;
  name: string;
  room: string;
  position: [number, number, number];
  color: string;
  memoryId?: number;
  customTitle?: string;
  mnemonicScene?: string;
  updatedAt?: string;
}

export class MemoryOSDatabase extends Dexie {
  memories!: Table<Memory, number>;
  settings!: Table<OSSettings, string>;
  loci!: Table<LocusStation, string>;

  constructor() {
    super('MemoryOS_DB');
    this.version(1).stores({
      memories: '++id, title, category, *tags, date, pinned, favorite, importance, emotion, createdAt',
      settings: 'id'
    });
    this.version(2).stores({
      memories: '++id, title, category, *tags, date, pinned, favorite, importance, emotion, createdAt',
      settings: 'id',
      loci: 'id, order, memoryId, room'
    });
  }
}

export const db = new MemoryOSDatabase();

export const INITIAL_LOCI_STATIONS: LocusStation[] = [
  {
    id: 'locus-1',
    order: 1,
    name: 'Poarta de Obsidian',
    room: 'Atriumul de Intrare',
    position: [0, 1.2, 8],
    color: '#818cf8',
    customTitle: 'Geneza Memory OS',
    mnemonicScene: 'O cheie uriașă de ametist care plutește și descuie o poartă din sticlă neagră prin care luminează circuite neuronale.',
  },
  {
    id: 'locus-2',
    order: 2,
    name: 'Fântâna Sinapselor',
    room: 'Piațeta Luminii',
    position: [-6, 1.2, 4],
    color: '#38bdf8',
    customTitle: 'Relația Dintre Gânduri și Neuron',
    mnemonicScene: 'Apa fântânii este compusă din raze de lumină fosforescentă ce formează o rețea de sinapse vii.',
  },
  {
    id: 'locus-3',
    order: 3,
    name: 'Masa Alchimistului',
    room: 'Laboratorul Ideilor',
    position: [-7, 1.2, -3],
    color: '#fbbf24',
    customTitle: 'Proiecte & Revelații',
    mnemonicScene: 'O călimară fermecată din care cerneala de aur se ridică în aer și se așază singură în formule de cod.',
  },
  {
    id: 'locus-4',
    order: 4,
    name: 'Globul Telescopic',
    room: 'Observatorul Astral',
    position: [-3, 1.5, -8],
    color: '#c084fc',
    customTitle: 'Perspectiva Macro & Viziune',
    mnemonicScene: 'O sferă rotativă uriașă în care se văd constelațiile gândurilor arhivate în timp.',
  },
  {
    id: 'locus-5',
    order: 5,
    name: 'Altarul Cristalului',
    room: 'Sanctuarul Revelațiilor',
    position: [3, 1.5, -8],
    color: '#f472b6',
    customTitle: 'Citat Seneca: Valoarea Timpului',
    mnemonicScene: 'O clepsidră masivă de diamant în care nisipul urcă în loc să coboare, sfidând trecerea timpului.',
  },
  {
    id: 'locus-6',
    order: 6,
    name: 'Bonsaiul Milenar',
    room: 'Grădina Zen',
    position: [7, 1.2, -3],
    color: '#34d399',
    customTitle: 'Lecția de Calm & Echilibru',
    mnemonicScene: 'Frunzele bonsaiului sunt mici bucăți de jad verde care șoptesc cuvinte de liniște când bate vântul.',
  },
  {
    id: 'locus-7',
    order: 7,
    name: 'Oglinda Reflecției',
    room: 'Galeria Memoriei',
    position: [6, 1.2, 4],
    color: '#f87171',
    customTitle: 'Cine eram acum un an?',
    mnemonicScene: 'Oglinda nu îți reflectă corpul, ci un film panoramic al momentelor tale decisive din trecut.',
  },
  {
    id: 'locus-8',
    order: 8,
    name: 'Monolitul Zenit',
    room: 'Turnul Înțelepciunii',
    position: [0, 2.0, 0],
    color: '#a78bfa',
    customTitle: 'Sinteza Învățării (Second Brain)',
    mnemonicScene: 'Un monolit plutitor de cuarț violet care emite un puls de claritate ce leagă toate celelalte 7 stații.',
  },
];

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

  const lociCount = await db.loci.count();
  if (lociCount === 0) {
    await db.loci.bulkAdd(INITIAL_LOCI_STATIONS);
  }
}
