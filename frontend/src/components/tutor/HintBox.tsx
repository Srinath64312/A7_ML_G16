import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';

interface HintBoxProps {
  hint: string;
  onUseHint: () => void;
  hintsUsed: number;
}

export const HintBox: React.FC<HintBoxProps> = ({ hint, onUseHint, hintsUsed }) => {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true);
      onUseHint();
    }
  };

  // Keyboard shortcut H to reveal hint
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if ((e.key === 'h' || e.key === 'H') && !revealed) {
        handleReveal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [revealed]);

  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-500/5 p-4 transition-all">
      {!revealed ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                Need Scaffolding or Guided Help?
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400/80">
                Revealing this hint assists understanding with a minor engagement calibration penalty.
              </p>
            </div>
          </div>
          <button
            onClick={handleReveal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-medium border border-amber-500/40 transition-all hover:scale-105 active:scale-95"
          >
            <span>Reveal AI Hint</span>
            <kbd className="hidden sm:inline-block text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/30 text-amber-900 dark:text-amber-200">
              H
            </kbd>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 text-xs font-bold">
            <Lightbulb className="w-4 h-4 text-amber-500 animate-pulse" />
            <span>AI Scaffolding Prompt (Hints Used: {hintsUsed})</span>
          </div>
          <p className="text-xs text-amber-950 dark:text-amber-100 bg-amber-100/80 dark:bg-amber-950/40 p-3 rounded-lg border border-amber-500/30 leading-relaxed font-mono">
            {hint}
          </p>
        </div>
      )}
    </div>
  );
};
