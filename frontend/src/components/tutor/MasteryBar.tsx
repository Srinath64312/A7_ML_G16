import React from 'react';
import { Activity } from 'lucide-react';

interface MasteryBarProps {
  mastery: number;
  oldMastery?: number;
}

export const MasteryBar: React.FC<MasteryBarProps> = ({ mastery, oldMastery }) => {
  const percentage = Math.min(100, Math.max(0, Math.round(mastery * 100)));
  const gain = oldMastery !== undefined ? Math.round((mastery - oldMastery) * 100) : 0;

  const getStatusColor = (val: number) => {
    if (val >= 0.8) return { bg: 'from-emerald-500 to-teal-400', text: 'text-emerald-600 dark:text-emerald-400' };
    if (val >= 0.5) return { bg: 'from-cyan-500 to-indigo-500', text: 'text-cyan-600 dark:text-cyan-400' };
    if (val >= 0.3) return { bg: 'from-amber-500 to-yellow-400', text: 'text-amber-600 dark:text-amber-400' };
    return { bg: 'from-rose-500 to-orange-400', text: 'text-rose-600 dark:text-rose-400' };
  };

  const status = getStatusColor(mastery);

  return (
    <div className="bg-slate-100 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-2 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            Bayesian Latent Mastery \(P(L_t)\)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {gain !== 0 && (
            <span
              className={`text-xs font-mono font-bold px-1.5 py-0.5 rounded ${
                gain > 0
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-300'
              }`}
            >
              {gain > 0 ? `+${gain}%` : `${gain}%`}
            </span>
          )}
          <span className={`text-sm font-mono font-bold ${status.text}`}>
            {percentage}%
          </span>
        </div>
      </div>

      <div className="h-2.5 w-full bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-300 dark:border-white/5">
        <div
          className={`h-full bg-gradient-to-r ${status.bg} rounded-full transition-all duration-700 ease-out shadow-sm`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 font-mono">
        <span>Novice (0%)</span>
        <span>ZPD Target (60–80%)</span>
        <span>Mastery (100%)</span>
      </div>
    </div>
  );
};
