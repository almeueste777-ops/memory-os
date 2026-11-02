import React, { useState } from 'react';
import { db, type Memory } from '../db';
import { 
  Search, 
  Grid, 
  List, 
  Heart, 
  Pin, 
  Trash2, 
  Sparkles
} from 'lucide-react';

interface VaultAppProps {
  memories: Memory[];
  onOpenViewer: (memory: Memory) => void;
  onRefresh: () => void;
}

export const VaultApp: React.FC<VaultAppProps> = ({
  memories,
  onOpenViewer,
  onRefresh
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'importance'>('date-desc');

  const filteredMemories = memories
    .filter((m) => {
      const matchSearch =
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchCategory = selectedCategory === 'all' || m.category === selectedCategory;
      const matchFav = !onlyFavorites || m.favorite;
      const matchPin = !onlyPinned || m.pinned;

      return matchSearch && matchCategory && matchFav && matchPin;
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;

      if (sortBy === 'importance') {
        return (b.importance || 0) - (a.importance || 0);
      }
      if (sortBy === 'date-asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const handleToggleFavorite = async (e: React.MouseEvent, m: Memory) => {
    e.stopPropagation();
    if (!m.id) return;
    await db.memories.update(m.id, { favorite: !m.favorite });
    onRefresh();
  };

  const handleTogglePin = async (e: React.MouseEvent, m: Memory) => {
    e.stopPropagation();
    if (!m.id) return;
    await db.memories.update(m.id, { pinned: !m.pinned });
    onRefresh();
  };

  const handleDelete = async (e: React.MouseEvent, m: Memory) => {
    e.stopPropagation();
    if (!m.id) return;
    if (confirm(`Ești sigur că vrei să ștergi amintirea "${m.title}"?`)) {
      await db.memories.delete(m.id);
      onRefresh();
    }
  };

  return (
    <div className="flex flex-col h-full text-slate-200">
      {/* Top Filter & Toolbar Bar */}
      <div className="p-4 border-b border-white/10 glass-panel shrink-0 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search Box */}
          <div className="flex items-center space-x-2 glass-input px-3 py-1.5 rounded-xl w-72">
            <Search size={16} className="text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Caută în seif..."
              className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                onlyFavorites
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Heart size={14} className={onlyFavorites ? 'fill-rose-400 text-rose-400' : ''} />
              <span>Favorite</span>
            </button>

            <button
              onClick={() => setOnlyPinned(!onlyPinned)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border transition-all ${
                onlyPinned
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-white/[0.04] border-white/10 text-slate-400 hover:text-white'
              }`}
            >
              <Pin size={14} className={onlyPinned ? 'fill-amber-400 text-amber-400' : ''} />
              <span>Fixate</span>
            </button>

            {/* Sort Switch */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="glass-input text-xs px-2.5 py-1.5 rounded-xl text-slate-300 focus:outline-none"
            >
              <option value="date-desc">Cele mai noi</option>
              <option value="date-asc">Cele mai vechi</option>
              <option value="importance">După importanță</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-white/[0.04] border border-white/10 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'grid' ? 'bg-indigo-600/50 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Vedere Grilă"
              >
                <Grid size={15} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg ${
                  viewMode === 'list' ? 'bg-indigo-600/50 text-white' : 'text-slate-400 hover:text-white'
                }`}
                title="Vedere Listă"
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] mr-1">Categorie:</span>
          {['all', 'thought', 'idea', 'experience', 'learning', 'quote', 'person'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg capitalize whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white font-medium shadow-sm'
                  : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              {cat === 'all' ? 'Toate' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5">
        {filteredMemories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400 space-y-3">
            <Sparkles size={36} className="text-indigo-400/60 animate-pulse" />
            <p className="text-sm font-medium">Nicio amintire găsită conform filtrelor.</p>
            <p className="text-xs text-slate-500">Adaugă una nouă din aplicația Journal sau elimină filtrele.</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMemories.map((m) => (
              <div
                key={m.id}
                onClick={() => onOpenViewer(m)}
                className="glass-card glass-card-hover rounded-2xl p-4 cursor-pointer flex flex-col justify-between group relative border border-white/10"
              >
                {/* Pin indicator */}
                {m.pinned && (
                  <div className="absolute top-3 right-3 text-amber-400" title="Amintire fixată">
                    <Pin size={14} className="fill-amber-400" />
                  </div>
                )}

                <div>
                  <div className="flex items-center space-x-2 text-[10px] text-slate-400 mb-2">
                    <span className="uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-white/[0.06] text-indigo-300">
                      {m.category}
                    </span>
                    <span>•</span>
                    <span>{new Date(m.date).toLocaleDateString('ro-RO')}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-indigo-300 transition-colors line-clamp-1">
                    {m.title}
                  </h3>

                  <p className="text-xs text-slate-300 line-clamp-3 mb-3 leading-relaxed">
                    {m.content}
                  </p>

                  {m.mediaUrl && (
                    <div className="mb-3 h-28 rounded-xl overflow-hidden border border-white/10">
                      <img src={m.mediaUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  {/* Tag chips */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {m.tags.slice(0, 3).map((t) => (
                      <span key={t} className="text-[10px] bg-white/[0.06] px-1.5 py-0.5 rounded text-slate-300">
                        #{t}
                      </span>
                    ))}
                    {m.tags.length > 3 && (
                      <span className="text-[10px] text-slate-400">+{m.tags.length - 3}</span>
                    )}
                  </div>

                  {/* Footer actions */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/[0.08] text-xs text-slate-400">
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: m.importance || 3 }).map((_, i) => (
                        <span key={i} className="text-amber-400 text-[10px]">★</span>
                      ))}
                    </div>

                    <div className="flex items-center space-x-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleToggleFavorite(e, m)}
                        className="hover:text-rose-400 p-1"
                        title="Favorit"
                      >
                        <Heart size={14} className={m.favorite ? 'fill-rose-400 text-rose-400' : ''} />
                      </button>
                      <button
                        onClick={(e) => handleTogglePin(e, m)}
                        className="hover:text-amber-400 p-1"
                        title="Fixează pe Desktop"
                      >
                        <Pin size={14} className={m.pinned ? 'fill-amber-400 text-amber-400' : ''} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, m)}
                        className="hover:text-rose-400 p-1"
                        title="Șterge"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List Mode */
          <div className="space-y-2">
            {filteredMemories.map((m) => (
              <div
                key={m.id}
                onClick={() => onOpenViewer(m)}
                className="glass-card hover:bg-white/[0.08] p-3 rounded-xl flex items-center justify-between cursor-pointer border border-white/5 transition-all"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                    {m.category === 'quote' ? '✍️' : m.category === 'idea' ? '💡' : '💭'}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white truncate">{m.title}</span>
                      {m.pinned && <Pin size={11} className="text-amber-400 fill-amber-400 shrink-0" />}
                      {m.favorite && <Heart size={11} className="text-rose-400 fill-rose-400 shrink-0" />}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate max-w-md">{m.content}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4 shrink-0 text-xs text-slate-400">
                  <span className="text-[10px]">{new Date(m.date).toLocaleDateString('ro-RO')}</span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleDelete(e, m)}
                      className="hover:text-rose-400 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
