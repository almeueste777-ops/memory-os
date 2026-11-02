import React, { useState, useEffect } from 'react';
import { db, type Memory } from '../db';
import confetti from 'canvas-confetti';
import { Sparkles, Brain, Eye, Award } from 'lucide-react';

interface RecallAppProps {
  memories: Memory[];
  onRefresh: () => void;
}

export const RecallApp: React.FC<RecallAppProps> = ({ memories, onRefresh }) => {
  const [sessionCards, setSessionCards] = useState<Memory[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  const startSession = () => {
    if (memories.length === 0) return;
    const sorted = [...memories].sort((a, b) => {
      const aCount = a.recallCount || 0;
      const bCount = b.recallCount || 0;
      return aCount - bCount;
    });
    setSessionCards(sorted.slice(0, 5));
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompletedCount(0);
  };

  useEffect(() => {
    startSession();
  }, [memories.length]);

  const currentMemory = sessionCards[currentIndex];
  const isFinished = sessionCards.length > 0 && currentIndex >= sessionCards.length;

  const handleScore = async (scoreLevel: 'forgotten' | 'vague' | 'sharp') => {
    if (!currentMemory || !currentMemory.id) return;

    const currentCount = currentMemory.recallCount || 0;
    const addCount = scoreLevel === 'sharp' ? 2 : scoreLevel === 'vague' ? 1 : 0;

    await db.memories.update(currentMemory.id, {
      recallCount: currentCount + addCount,
      lastRecalledAt: new Date().toISOString(),
    });

    setIsFlipped(false);
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setCompletedCount((prev) => prev + 1);

    if (nextIdx >= sessionCards.length) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (err) {
        // ignore
      }
    }

    onRefresh();
  };

  return (
    <div className="p-6 h-full flex flex-col items-center justify-center text-slate-200 select-none">
      {/* Session Header */}
      <div className="w-full max-w-md text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Sparkles className="text-amber-400" size={20} />
          <h2 className="text-lg font-bold text-white">Recall Engine — Sesiune de Reflecție</h2>
        </div>
        <p className="text-xs text-slate-400">
          Reconsolidează conexiunile neuronale prin reamintire activă (Spaced Repetition).
        </p>

        {sessionCards.length > 0 && !isFinished && (
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-4">
            <div
              className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-300"
              style={{ width: `${(currentIndex / sessionCards.length) * 100}%` }}
            />
          </div>
        )}
      </div>

      {/* Main Flashcard Body */}
      {memories.length === 0 ? (
        <div className="text-center p-8 glass-card rounded-2xl max-w-md border border-white/10">
          <Brain size={40} className="mx-auto text-indigo-400 mb-3 opacity-60" />
          <p className="text-sm font-semibold text-white mb-1">Nu ai nicio amintire înregistrată încă.</p>
          <p className="text-xs text-slate-400">Deschide Memory Journal pentru a adăuga primele gânduri.</p>
        </div>
      ) : isFinished ? (
        <div className="text-center p-8 glass-window rounded-3xl max-w-md border border-white/20 animate-scale-up space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg">
            <Award size={36} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Sesiune Finalizată!</h3>
            <p className="text-xs text-slate-300">
              Ai reîmprospătat cu succes {completedCount} amintiri cheie. Circuitele tale sinaptice sunt mai puternice astăzi.
            </p>
          </div>
          <button
            onClick={startSession}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg transition-all"
          >
            Pornește o altă sesiune
          </button>
        </div>
      ) : currentMemory ? (
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Flip Container */}
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="w-full h-80 cursor-pointer perspective-1000 group relative"
          >
            <div
              className={`w-full h-full rounded-3xl glass-window p-6 flex flex-col justify-between border border-white/20 shadow-2xl transition-all duration-500 transform ${
                isFlipped ? 'bg-indigo-950/40 border-indigo-500/40' : 'hover:scale-[1.01]'
              }`}
            >
              {/* Front Side */}
              {!isFlipped ? (
                <>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="uppercase tracking-wider font-semibold text-indigo-400">
                      {currentMemory.category}
                    </span>
                    <span>Ancorată: {new Date(currentMemory.date).toLocaleDateString('ro-RO')}</span>
                  </div>

                  <div className="text-center my-auto px-4">
                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-widest font-mono">
                      Subiect / Titlu
                    </p>
                    <h3 className="text-xl font-extrabold text-white leading-snug mb-3">
                      {currentMemory.title}
                    </h3>
                    <div className="flex justify-center gap-1.5">
                      {currentMemory.tags.map((t) => (
                        <span key={t} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-indigo-300">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-center text-[11px] text-slate-400 flex items-center justify-center gap-1.5 opacity-70 group-hover:opacity-100">
                    <Eye size={14} />
                    <span>Apasă pentru a întoarce cardul și a citi amintirea completă</span>
                  </div>
                </>
              ) : (
                /* Back Side */
                <>
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/10 pb-2">
                    <span className="font-semibold text-white truncate max-w-[200px]">
                      {currentMemory.title}
                    </span>
                    <span className="text-amber-400 font-mono text-[11px]">
                      Recitită de: {currentMemory.recallCount || 0} ori
                    </span>
                  </div>

                  <div className="overflow-y-auto max-h-48 my-auto pr-1">
                    <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                      {currentMemory.content}
                    </p>
                    {currentMemory.mediaUrl && (
                      <div className="mt-3 rounded-lg overflow-hidden border border-white/10 h-24">
                        <img src={currentMemory.mediaUrl} alt="Memory Attachment" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>

                  <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-white/10">
                    Evaluează starea reamintirii mai jos:
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Action rating buttons */}
          <div className="flex items-center gap-2 mt-6 w-full justify-between">
            <button
              onClick={() => handleScore('forgotten')}
              className="flex-1 py-2 px-3 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all"
            >
              Uitată
            </button>
            <button
              onClick={() => handleScore('vague')}
              className="flex-1 py-2 px-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-semibold transition-all"
            >
              Vagă
            </button>
            <button
              onClick={() => handleScore('sharp')}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold transition-all"
            >
              Clar în minte
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
