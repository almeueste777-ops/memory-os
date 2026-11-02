import React, { useState } from 'react';
import { db, type Memory } from '../db';
import { 
  Calendar, 
  Tag as TagIcon, 
  Share2, 
  Download, 
  Edit3, 
  Check
} from 'lucide-react';

interface MemoryViewerAppProps {
  memory: Memory;
  allMemories: Memory[];
  onSelectAnotherMemory: (memory: Memory) => void;
  onMemoryUpdated: () => void;
}

export const MemoryViewerApp: React.FC<MemoryViewerAppProps> = ({
  memory,
  allMemories,
  onSelectAnotherMemory,
  onMemoryUpdated
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(memory.title);
  const [content, setContent] = useState(memory.content);

  const handleSaveEdit = async () => {
    if (!memory.id) return;
    await db.memories.update(memory.id, {
      title,
      content,
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
    onMemoryUpdated();
  };

  const handleExportMarkdown = () => {
    const md = `# ${memory.title}

*Data:* ${new Date(memory.date).toLocaleDateString('ro-RO')}
*Categorie:* ${memory.category}
*Etichete:* ${memory.tags.map(t => `#${t}`).join(', ')}
*Importanță:* ${memory.importance}/5

---

${memory.content}
`;
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${memory.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const connectedMemories = (memory.connectedMemoryIds || [])
    .map((id) => allMemories.find((m) => m.id === id))
    .filter(Boolean) as Memory[];

  return (
    <div className="p-6 max-w-2xl mx-auto text-slate-200 space-y-5">
      {/* Top action bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center space-x-2 text-xs text-slate-400">
          <span className="uppercase font-semibold tracking-wider text-indigo-400 bg-white/[0.06] px-2.5 py-0.5 rounded-full">
            {memory.category}
          </span>
          <span>•</span>
          <div className="flex items-center space-x-1">
            <Calendar size={13} />
            <span>{new Date(memory.date).toLocaleDateString('ro-RO')}</span>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-slate-300 hover:text-white transition-colors"
          >
            <Edit3 size={13} />
            <span>{isEditing ? 'Anulează' : 'Editează'}</span>
          </button>
          <button
            onClick={handleExportMarkdown}
            className="flex items-center space-x-1 px-3 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.12] text-xs text-slate-300 hover:text-white transition-colors"
            title="Exportă ca Markdown"
          >
            <Download size={13} />
            <span>Export .md</span>
          </button>
        </div>
      </div>

      {/* Title & Content */}
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-base font-bold text-white focus:outline-none"
          />
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 rounded-xl glass-input text-xs text-slate-200 focus:outline-none resize-y"
          />
          <button
            onClick={handleSaveEdit}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 shadow-md"
          >
            <Check size={14} />
            <span>Salvează Modificările</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <h1 className="text-xl font-bold text-white leading-snug">{memory.title}</h1>

          {memory.mediaUrl && (
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-lg max-h-72">
              <img src={memory.mediaUrl} alt="Memory Visual" className="w-full h-full object-cover" />
            </div>
          )}

          <div className="glass-card rounded-2xl p-5 border border-white/5">
            <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line font-normal">
              {memory.content}
            </p>
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="flex flex-wrap gap-1.5 items-center pt-2">
        <TagIcon size={13} className="text-slate-400 mr-1" />
        {memory.tags.map((t) => (
          <span
            key={t}
            className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2.5 py-0.5 rounded-lg"
          >
            #{t}
          </span>
        ))}
      </div>

      {/* Synaptic Connections Links */}
      {connectedMemories.length > 0 && (
        <div className="pt-4 border-t border-white/10">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Share2 size={13} className="text-indigo-400" />
            Amintiri Conectate ({connectedMemories.length})
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {connectedMemories.map((cm) => (
              <button
                key={cm.id}
                onClick={() => onSelectAnotherMemory(cm)}
                className="glass-card hover:bg-white/[0.08] p-2.5 rounded-xl border border-white/10 text-left transition-all group"
              >
                <div className="text-xs font-semibold text-white group-hover:text-indigo-300 truncate">
                  {cm.title}
                </div>
                <div className="text-[10px] text-slate-400 truncate">{cm.content}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
