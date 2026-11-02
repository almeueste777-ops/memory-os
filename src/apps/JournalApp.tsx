import React, { useState } from 'react';
import { db, type Memory, type MemoryCategory, type EmotionType } from '../db';
import { 
  Plus, 
  Image as ImageIcon, 
  Check
} from 'lucide-react';

interface JournalAppProps {
  onMemoryCreated?: () => void;
  onOpenViewer?: (memory: Memory) => void;
  allMemories: Memory[];
}

const CATEGORIES: { id: MemoryCategory; label: string; emoji: string }[] = [
  { id: 'thought', label: 'Gând / Reflecție', emoji: '💭' },
  { id: 'idea', label: 'Idee & Proiect', emoji: '💡' },
  { id: 'experience', label: 'Experiență de viață', emoji: '🌿' },
  { id: 'learning', label: 'Lecție / Cunoaștere', emoji: '📚' },
  { id: 'quote', label: 'Citat memorabil', emoji: '✍️' },
  { id: 'person', label: 'Om & Relație', emoji: '👤' },
];

const EMOTIONS: { id: EmotionType; label: string; color: string }[] = [
  { id: 'clarity', label: 'Claritate', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { id: 'insight', label: 'Revelație', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' },
  { id: 'calm', label: 'Liniște', color: 'bg-teal-500/20 text-teal-300 border-teal-500/40' },
  { id: 'energy', label: 'Energie', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'joy', label: 'Bucurie', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { id: 'melancholy', label: 'Melancolie', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 'neutral', label: 'Neutru', color: 'bg-slate-500/20 text-slate-300 border-slate-500/40' },
];

export const JournalApp: React.FC<JournalAppProps> = ({
  onMemoryCreated,
  allMemories,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<MemoryCategory>('thought');
  const [emotion, setEmotion] = useState<EmotionType>('clarity');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [importance, setImportance] = useState<number>(3);
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [selectedConnections, setSelectedConnections] = useState<number[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (!tags.includes(cleanTag)) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setMediaUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleConnection = (id: number) => {
    if (selectedConnections.includes(id)) {
      setSelectedConnections(selectedConnections.filter((c) => c !== id));
    } else {
      setSelectedConnections([...selectedConnections, id]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() && !content.trim()) return;

    const now = new Date().toISOString();
    const finalTitle = title.trim() || content.trim().slice(0, 40) + '...';

    const newId = await db.memories.add({
      title: finalTitle,
      content: content.trim(),
      category,
      tags,
      date: now,
      importance,
      emotion,
      mediaUrl: mediaUrl || undefined,
      connectedMemoryIds: selectedConnections,
      recallCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    // Bidirectionally update connections
    for (const connId of selectedConnections) {
      const target = await db.memories.get(connId);
      if (target) {
        const existing = target.connectedMemoryIds || [];
        if (!existing.includes(Number(newId))) {
          await db.memories.update(connId, {
            connectedMemoryIds: [...existing, Number(newId)],
          });
        }
      }
    }

    // Reset Form
    setTitle('');
    setContent('');
    setTags([]);
    setMediaUrl('');
    setSelectedConnections([]);
    setIsSuccess(true);
    setTimeout(() => setIsSuccess(false), 2500);

    if (onMemoryCreated) onMemoryCreated();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-slate-200">
      {/* Header Banner */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>📝</span> Memory Journal & Stream
          </h2>
          <p className="text-xs text-slate-400">
            Fixează gândurile efemere și conectează-le în rețeaua cognitivă a creierului tău digital.
          </p>
        </div>

        {isSuccess && (
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs animate-scale-up">
            <Check size={14} />
            <span>Memorie ancorată cu succes!</span>
          </div>
        )}
      </div>

      {/* Main Composer Card */}
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-5 space-y-4 border border-white/10">
        {/* Title Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Titlul sau Ideea Centrală
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Insight despre fluxul de atenție, Discuție inspirațională..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm focus:outline-none"
          />
        </div>

        {/* Content Body */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Conținut & Reflecție
          </label>
          <textarea
            rows={4}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Descrie contextul, sentimentele, lecția desprinsă sau detaliile pe care vrei să le ții minte..."
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-sm focus:outline-none resize-y"
          />
        </div>

        {/* Categories & Emotions Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Categorie
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  type="button"
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium text-left transition-all border ${
                    category === cat.id
                      ? 'bg-indigo-600/40 border-indigo-400 text-white shadow-sm'
                      : 'bg-white/[0.03] border-white/10 text-slate-400 hover:text-slate-200 hover:bg-white/[0.06]'
                  }`}
                >
                  <span className="mr-1">{cat.emoji}</span>
                  <span className="truncate">{cat.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Emotion */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Stare Emoțională
            </label>
            <div className="flex flex-wrap gap-1.5">
              {EMOTIONS.map((emo) => (
                <button
                  type="button"
                  key={emo.id}
                  onClick={() => setEmotion(emo.id)}
                  className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                    emotion === emo.id
                      ? `${emo.color} font-semibold ring-1 ring-white/30 scale-105`
                      : 'border-white/10 text-slate-400 hover:text-slate-200 bg-white/[0.02]'
                  }`}
                >
                  {emo.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tags and Importance */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Etichete / Concepte (Apasă Enter)
            </label>
            <div className="flex flex-wrap gap-1.5 items-center p-2 rounded-xl glass-input min-h-[42px]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-md text-xs flex items-center gap-1"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-400"
                  >
                    ×
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder={tags.length === 0 ? "Scrie etichete (#stoicism, #proiect)..." : ""}
                className="bg-transparent border-none text-xs text-white focus:outline-none flex-1 min-w-[120px]"
              />
            </div>
          </div>

          {/* Importance */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Importanță Cognitivă (1-5)
            </label>
            <div className="flex items-center space-x-2 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setImportance(star)}
                  className={`w-9 h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                    importance >= star
                      ? 'bg-amber-500/30 border border-amber-400 text-amber-300 shadow-sm'
                      : 'bg-white/[0.03] border border-white/10 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  ★
                </button>
              ))}
              <span className="text-xs text-slate-400 ml-2">
                {importance === 5 ? 'Semnificație maximă' : importance >= 3 ? 'Importantă' : 'Notă de fond'}
              </span>
            </div>
          </div>
        </div>

        {/* Media Upload & Cross Links Toggle */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <label className="cursor-pointer flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white px-3 py-1.5 rounded-lg bg-white/[0.05] border border-white/10 hover:bg-white/[0.1] transition-colors">
              <ImageIcon size={14} className="text-indigo-400" />
              <span>{mediaUrl ? 'Imagine atașată ✓' : 'Atașează imagine locală'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>

            {mediaUrl && (
              <button
                type="button"
                onClick={() => setMediaUrl('')}
                className="text-xs text-rose-400 hover:underline"
              >
                Șterge imaginea
              </button>
            )}
          </div>

          <button
            type="submit"
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium text-xs shadow-lg hover:shadow-indigo-500/25 transition-all"
          >
            <Plus size={16} />
            <span>Ancorează în Memorie</span>
          </button>
        </div>

        {mediaUrl && (
          <div className="relative w-36 h-24 rounded-lg overflow-hidden border border-white/20 mt-2">
            <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
        )}

        {/* Link to existing memories */}
        {allMemories.length > 0 && (
          <div className="pt-3 border-t border-white/10">
            <span className="text-xs text-slate-400 block mb-2 font-medium">
              Conectează sinaptic cu alte amintiri existente ({selectedConnections.length} selectate):
            </span>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {allMemories.slice(0, 10).map((m) => {
                const isSelected = selectedConnections.includes(m.id!);
                return (
                  <button
                    type="button"
                    key={m.id}
                    onClick={() => handleToggleConnection(m.id!)}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-all truncate max-w-xs ${
                      isSelected
                        ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                        : 'bg-white/[0.02] border-white/10 text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    🔗 {m.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
