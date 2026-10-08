import React from 'react';
import { Check, X, Circle, Sparkles } from 'lucide-react';

export interface QuestionHistoryItem {
  questionNumber: number;
  question: string;
  difficulty: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation: string;
  hintsUsed: number;
  oldMastery: number;
  newMastery: number;
}

interface SeriesStepperProps {
  seriesLength: number | 'infinite';
  currentIndex: number; // 1-indexed
  history: QuestionHistoryItem[];
}

export const SeriesStepper: React.FC<SeriesStepperProps> = ({
  seriesLength,
  currentIndex,
  history,
}) => {
  if (seriesLength === 'infinite') {
    return (
      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900/60 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-mono">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-500" />
          <span className="text-slate-700 dark:text-slate-300 font-semibold">Continuous Adaptive Series</span>
        </div>
        <span className="text-indigo-600 dark:text-indigo-300 font-bold">Question #{currentIndex}</span>
      </div>
    );
  }

  const total = Number(seriesLength);
  const percentage = Math.min(100, Math.round(((currentIndex - 1) / total) * 100));

  return (
    <div className="bg-slate-100 dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-3">
      {/* Header text */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-800 dark:text-slate-200">Question Series Progress</span>
          <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold">
            ({currentIndex} of {total})
          </span>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px]">
          <span className="text-emerald-600 dark:text-emerald-400">
            {history.filter((h) => h.isCorrect).length} Correct
          </span>
          <span className="text-slate-400 dark:text-slate-600">•</span>
          <span className="text-rose-600 dark:text-rose-400">
            {history.filter((h) => !h.isCorrect).length} Incorrect
          </span>
        </div>
      </div>

      {/* Stepper pills */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1">
        {Array.from({ length: total }, (_, i) => {
          const qNum = i + 1;
          const histItem = history.find((h) => h.questionNumber === qNum);
          const isCurrent = qNum === currentIndex;

          let bgStyle = 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400';
          let icon = <span className="text-[11px] font-mono font-semibold">{qNum}</span>;

          if (histItem) {
            if (histItem.isCorrect) {
              bgStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
              icon = <Check className="w-3.5 h-3.5 stroke-[2.5]" />;
            } else {
              bgStyle = 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
              icon = <X className="w-3.5 h-3.5 stroke-[2.5]" />;
            }
          } else if (isCurrent) {
            bgStyle = 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.35)] scale-105';
            icon = <span className="text-[11px] font-mono font-bold">{qNum}</span>;
          }

          return (
            <div
              key={qNum}
              className={`flex-1 min-w-[34px] max-w-[48px] h-8 rounded-lg border flex items-center justify-center transition-all ${bgStyle}`}
              title={`Question ${qNum}`}
            >
              {icon}
            </div>
          );
        })}
      </div>

      {/* Mini Progress line */}
      <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
