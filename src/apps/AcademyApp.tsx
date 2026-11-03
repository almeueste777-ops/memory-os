import React, { useState } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Hash, 
  UserCheck, 
  Compass, 
  Clock, 
  Sparkles, 
  Zap,
  CheckCircle2
} from 'lucide-react';

interface AcademyAppProps {
  onOpenJournalWithTemplate?: (title: string, content: string, tags: string[]) => void;
}

const MAJOR_SYSTEM_RULES: { digit: string; sounds: string; mnemonic: string; examples: string }[] = [
  { digit: '0', sounds: 'S, Z', mnemonic: 'Zero începe cu Z/S', examples: 'Sos, Zid, Sac' },
  { digit: '1', sounds: 'T, D', mnemonic: 'T are o linie verticală; D dental', examples: 'Tu, Tei, Data' },
  { digit: '2', sounds: 'N', mnemonic: 'n are 2 picioare verticale', examples: 'Nor, Nas, Nucă' },
  { digit: '3', sounds: 'M', mnemonic: 'm are 3 picioare; 3 rotit', examples: 'Mar, Mac, Munte' },
  { digit: '4', sounds: 'R', mnemonic: 'patRu are sunet pregnant R', examples: 'Râu, Roi, Raza' },
  { digit: '5', sounds: 'L', mnemonic: 'L este 50 în cifre romane', examples: 'Leu, Lac, Luna' },
  { digit: '6', sounds: 'J, Ș, Ce/Ci/Ge/Gi', mnemonic: '6 seamănă cu J rotit', examples: 'Joc, Șir, Ceas' },
  { digit: '7', sounds: 'C, K, G (tare)', mnemonic: 'Două cifre de 7 formează K', examples: 'Cal, Coș, Gard' },
  { digit: '8', sounds: 'F, V', mnemonic: '8 scris de mână are bucle ca f', examples: 'Foc, Vin, Fată' },
  { digit: '9', sounds: 'P, B', mnemonic: 'P este oglindirea lui 9; b este 9 inversat', examples: 'Pui, Pas, Brad' },
];

export const AcademyApp: React.FC<AcademyAppProps> = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'numbers' | 'names' | 'loci' | 'stages'>('text');

  // Interactive Trainer 1: First-Letter Verbatim
  const [verbatimInput, setVerbatimInput] = useState(
    'Toate ființele umane se nasc libere și egale în demnitate și în drepturi.'
  );

  // Interactive Trainer 2: Major System Converter / Helper
  const [numberInput, setNumberInput] = useState('32');

  const getFirstLetters = (text: string) => {
    return text.replace(/\b([a-zăîâșțA-ZĂÎÂȘȚ])/g, '$1').split(/\s+/).map(w => {
      const match = w.match(/^([a-zăîâșțA-ZĂÎÂȘȚ])(.*)$/);
      if (!match) return w;
      const punctuation = w.replace(/[a-zăîâșțA-ZĂÎÂȘȚ0-9]/gi, '');
      return match[1] + punctuation;
    }).join(' ');
  };

  const getMajorExplanation = (numStr: string) => {
    const digits = numStr.replace(/[^0-9]/g, '').split('');
    if (digits.length === 0) return [];
    return digits.map(d => MAJOR_SYSTEM_RULES.find(r => r.digit === d)).filter(Boolean);
  };

  return (
    <div className="flex h-full text-slate-200">
      {/* Sidebar Navigation */}
      <div className="w-56 border-r border-white/10 p-3 space-y-1.5 shrink-0 bg-white/[0.02]">
        <div className="px-3 py-2 mb-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
            <GraduationCap size={18} />
            <span>Mnemonic Codex</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-0.5">Arta și Știința Memorării</p>
        </div>

        <button
          onClick={() => setActiveTab('text')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'text'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <BookOpen size={15} />
          <span>1. Texte & Discursuri</span>
        </button>

        <button
          onClick={() => setActiveTab('numbers')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'numbers'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Hash size={15} />
          <span>2. Numere (Major System)</span>
        </button>

        <button
          onClick={() => setActiveTab('names')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'names'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <UserCheck size={15} />
          <span>3. Nume & Fețe</span>
        </button>

        <button
          onClick={() => setActiveTab('loci')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'loci'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Compass size={15} />
          <span>4. Palatul Memoriei</span>
        </button>

        <div className="h-[1px] bg-white/10 my-2" />

        <button
          onClick={() => setActiveTab('stages')}
          className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-all ${
            activeTab === 'stages'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
          }`}
        >
          <Clock size={15} />
          <span>5. Etapele Învățării (Spaced)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {/* TAB 1: TEXTE */}
        {activeTab === 'text' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <BookOpen size={14} /> Tehnica 1: Structură & Verbatim
              </div>
              <h2 className="text-xl font-bold text-white">Cum se memorează textele și discursurile</h2>
              <p className="text-xs text-slate-400 mt-1">
                Trecerea de la memorarea mecanică pasivă la extragerea cuvintelor de ancoră și codificare vizuală.
              </p>
            </div>

            {/* Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Zap size={14} className="text-amber-400" />
                  Metoda Cuvintelor-Cheie (Anchor)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Nu memora fiecare cuvânt dintr-un paragraf. Extrage <strong>1-2 substantive de ancoră</strong> per idee. Convertește substantivul într-o imagine absurdă și plaseaz-o în succesiune logică.
                </p>
              </div>

              <div className="glass-card rounded-2xl p-4 border border-white/10 space-y-2">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-indigo-400" />
                  Metoda Primei Litere (Verbatim)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Pentru memorarea exactă (poezii, legi, citate): transcrie doar prima literă a fiecărui cuvânt. Recită privind doar literele pentru a forța recuperarea activă (Active Recall).
                </p>
              </div>
            </div>

            {/* Interactive Verbatim Trainer */}
            <div className="glass-card rounded-2xl p-5 border border-indigo-500/20 bg-indigo-950/20 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <GraduationCap size={16} /> Antrenor Interactiv: Metoda Primei Litere
                </span>
                <span className="text-[10px] text-slate-400">Scrie sau lipește orice text mai jos:</span>
              </div>

              <textarea
                rows={2}
                value={verbatimInput}
                onChange={(e) => setVerbatimInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl glass-input text-xs text-white focus:outline-none"
                placeholder="Introdu textul pe care vrei să îl înveți..."
              />

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10 space-y-1.5">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Modelul tău de testare (Recită uitându-te doar aici):
                </div>
                <div className="text-sm font-mono text-emerald-400 font-bold tracking-wider leading-relaxed">
                  {getFirstLetters(verbatimInput)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: NUMERE */}
        {activeTab === 'numbers' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Hash size={14} /> Tehnica 2: Cifre & Coduri
              </div>
              <h2 className="text-xl font-bold text-white">Sistemul Major Fonetic (The Major System)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Transformă cifrele reci în consoane, cuvinte concrete și scene dinamice memorabile.
              </p>
            </div>

            {/* Rules Table */}
            <div className="glass-card rounded-2xl overflow-hidden border border-white/10">
              <table className="w-full text-xs text-left">
                <thead className="bg-white/[0.04] text-slate-300 font-semibold border-b border-white/10">
                  <tr>
                    <th className="p-2.5 text-center">Cifră</th>
                    <th className="p-2.5">Sunet / Consoană</th>
                    <th className="p-2.5">Cum ții minte</th>
                    <th className="p-2.5">Exemple de cuvinte</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06] text-slate-300">
                  {MAJOR_SYSTEM_RULES.map((rule) => (
                    <tr key={rule.digit} className="hover:bg-white/[0.02]">
                      <td className="p-2 text-center font-bold font-mono text-indigo-400 text-sm">
                        {rule.digit}
                      </td>
                      <td className="p-2 font-semibold text-white">{rule.sounds}</td>
                      <td className="p-2 text-slate-400 text-[11px]">{rule.mnemonic}</td>
                      <td className="p-2 text-emerald-300 font-mono text-[11px]">{rule.examples}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Interactive Number Decoder */}
            <div className="glass-card rounded-2xl p-5 border border-purple-500/20 bg-purple-950/20 space-y-4">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={16} /> Decodificator Interactiv de Numere
              </span>

              <div className="flex items-center gap-3">
                <input
                  type="text"
                  maxLength={6}
                  value={numberInput}
                  onChange={(e) => setNumberInput(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Scrie orice număr (ex: 32, 14, 720)..."
                  className="px-3.5 py-2 rounded-xl glass-input text-base font-mono font-bold text-white w-44 text-center focus:outline-none"
                />
                <span className="text-xs text-slate-400">
                  Introdu un PIN, o dată sau un cod pentru a vedea consoanele corespondente.
                </span>
              </div>

              {numberInput && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {getMajorExplanation(numberInput).map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-xs">
                      <div className="text-[10px] text-slate-400 uppercase">Cifra {item?.digit}</div>
                      <div className="font-bold text-purple-300 text-sm">{item?.sounds}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{item?.examples}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: NUME & FEȚE */}
        {activeTab === 'names' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <UserCheck size={14} /> Tehnica 3: Interacțiune Socială
              </div>
              <h2 className="text-xl font-bold text-white">Algoritmul în 4 Pași pentru Nume și Fețe</h2>
              <p className="text-xs text-slate-400 mt-1">
                Nu mai uita niciodată numele unei persoane la câteva secunde după ce s-a prezentat.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  step: 'Pasul 1',
                  title: 'Atenție & Repetare Imediată',
                  desc: 'Privește persoana în ochi și rostește-i numele cu voce tare în prima secundă: „Încântat de cunoștință, Adrian!”.',
                  color: 'border-blue-500/30 text-blue-300',
                },
                {
                  step: 'Pasul 2',
                  title: 'Scanarea Ancorei Faciale',
                  desc: 'Găsește trăsătura unică a feței: sprâncene arcuite, ochelari speciali, zâmbet larg, aluniță, bărbie proeminentă.',
                  color: 'border-purple-500/30 text-purple-300',
                },
                {
                  step: 'Pasul 3',
                  title: 'Conversia Numelui în Imagine',
                  desc: 'Transformă numele într-o imagine fizică: Radu = Radar; Alexandru = Alexandru cel Mare; Elena = Măr de aur; Otilia = Floare de tei.',
                  color: 'border-pink-500/30 text-pink-300',
                },
                {
                  step: 'Pasul 4',
                  title: 'Fuziunea Bizară',
                  desc: 'Lipește imaginea de ancora feței: Imaginează-ți antene radar rotindu-se pe lentilele ochelarilor lui Radu.',
                  color: 'border-emerald-500/30 text-emerald-300',
                },
              ].map((card) => (
                <div key={card.step} className={`glass-card rounded-2xl p-4 border ${card.color} space-y-2`}>
                  <div className="text-[10px] font-bold uppercase tracking-wider">{card.step}</div>
                  <h3 className="text-sm font-bold text-white">{card.title}</h3>
                  <p className="text-xs text-slate-300 leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LOCURI / PALATUL MEMORIEI */}
        {activeTab === 'loci' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Compass size={14} /> Tehnica 4: Navigație Spațială
              </div>
              <h2 className="text-xl font-bold text-white">Palatul Memoriei (Metoda Loci)</h2>
              <p className="text-xs text-slate-400 mt-1">
                Metoda folosită de campionii mondiali de memorie pentru a ancora sute de concepte într-un spațiu arhitectural imaginar.
              </p>
            </div>

            <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4 text-xs text-slate-300 leading-relaxed">
              <h3 className="text-sm font-bold text-white">Cum îți construiești primul Palat Mental în 4 reguli:</h3>
              <ol className="list-decimal list-inside space-y-2.5">
                <li>
                  <strong className="text-white">Alege un loc ultra-familiar:</strong> Apartamentul tău, casa copilăriei sau drumul de la metrou la birou. Nu folosi locuri imaginate la început.
                </li>
                <li>
                  <strong className="text-white">Stabilește un traseu fără bucle:</strong> Traseul trebuie să aibă o direcție unică (de regulă în sensul acelor de ceasornic) fără să se intersecteze cu sine.
                </li>
                <li>
                  <strong className="text-white">Marchează 5-10 stații fixe (Micro-Loci):</strong>
                  <ul className="list-disc list-inside ml-5 mt-1 text-slate-400 space-y-1">
                    <li>Stația 1: Ușa de intrare</li>
                    <li>Stația 2: Cuierul de haine</li>
                    <li>Stația 3: Oglinda din hol</li>
                    <li>Stația 4: Canapeaua din sufragerie</li>
                    <li>Stația 5: Masa de lucru / Biroul</li>
                  </ul>
                </li>
                <li>
                  <strong className="text-white">Depozitează acțiuni vii:</strong> Când așezi o informație pe o stație, fă-o să interacționeze fizic cu mobila (ex: pe cuier atârnă un ceas care curge ca în tablourile lui Dali).
                </li>
              </ol>
            </div>
          </div>
        )}

        {/* TAB 5: ETAPELE ÎNVĂȚĂRII */}
        {activeTab === 'stages' && (
          <div className="space-y-6 max-w-3xl">
            <div>
              <div className="flex items-center gap-2 text-purple-400 text-xs font-semibold uppercase tracking-wider mb-1">
                <Clock size={14} /> Metodologie Neurobiologică
              </div>
              <h2 className="text-xl font-bold text-white">Etapele Învățării Propriu-Zise &amp; Spaced Repetition</h2>
              <p className="text-xs text-slate-400 mt-1">
                Cum se produce retenția sinaptică permanentă de la prima expunere până la memoria de lungă durată (LTP).
              </p>
            </div>

            {/* Stages Timeline */}
            <div className="space-y-3">
              {[
                {
                  phase: 'Etapa 1',
                  name: 'Decodificare & Înțelegere (Tehnica Feynman)',
                  detail: 'Niciodată nu memora ce nu ai înțeles. Explică conceptul simplu, în cuvinte proprii, fără jargon tehnic.',
                  badge: 'Înțelegere 100%',
                },
                {
                  phase: 'Etapa 2',
                  name: 'Codificare Mnemotehnică',
                  detail: 'Transformă abstracțiile în imagini senzoriale, colorate, kinetice și absurde prin Principiul V.A.E.',
                  badge: 'Transmutare Vizuală',
                },
                {
                  phase: 'Etapa 3',
                  name: 'Externalizare în Memory OS',
                  detail: 'Scrie gândul în Journal, setează emoția dominantă și leagă-l în Synapse Graph de alte amintiri conexe.',
                  badge: 'Second Brain',
                },
                {
                  phase: 'Etapa 4',
                  name: 'Evocare Activă (Active Recall)',
                  detail: 'Nu reciti pasiv! Închide ecranul și forțează-te să reconstitui ideea din minte. Efortul sinaptic generează mielinizare.',
                  badge: 'Testare Activă',
                },
                {
                  phase: 'Etapa 5',
                  name: 'Protocolul Repetiției Spațiate (R1 - R5)',
                  detail: 'Repetă la: 20 minute (R1) -> 24 ore (R2) -> 3 zile (R3) -> 7 zile (R4) -> 30 zile (R5). Folosește aplicația Recall Engine!',
                  badge: 'Curba Ebbinghaus',
                },
              ].map((st, i) => (
                <div key={st.phase} className="glass-card rounded-2xl p-4 border border-white/10 flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-purple-600/30 border border-purple-400/40 text-purple-300 font-bold flex items-center justify-center shrink-0 text-xs">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white">{st.name}</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/30">
                        {st.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{st.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily Routine Summary */}
            <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/20 text-xs text-emerald-200 space-y-1.5">
              <div className="font-bold text-sm text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 size={16} /> Rutina zilnică optimă în Memory OS (15 minute/zi):
              </div>
              <p>• <strong>Dimineața (5 min):</strong> Deschide <em>Recall Engine</em> și rezolvă cele 5 carduri zilnice.</p>
              <p>• <strong>În timpul zilei (5 min):</strong> Notează în <em>Journal</em> un gând sau o persoană nouă cu tehnica V.A.E.</p>
              <p>• <strong>Seara (5 min):</strong> Explorează conexiunile în <em>Synapse Graph</em> pentru a vizualiza creșterea rețelei tale cognitive.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
