import React from 'react';
import { Cpu, TrendingUp, TrendingDown, Minus, BrainCircuit } from 'lucide-react';
import { PolicyType } from '../../types/api';

interface PolicyBadgeProps {
  difficulty: number;
  policy: PolicyType;
  direction?: 'increased' | 'decreased' | 'maintained';
  betaEstimate?: number;
}

export const PolicyBadge: React.FC<PolicyBadgeProps> = ({
  difficulty,
  policy,
  direction,
  betaEstimate,
}) => {
  const getDiffLabel = (diff: number) => {
    switch (diff) {
      case 1: return { label: 'Introductory / Scaffolding', color: 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30' };
      case 2: return { label: 'Foundational', color: 'text-teal-700 dark:text-teal-400 bg-teal-500/10 border-teal-500/30' };
      case 3: return { label: 'Intermediate (ZPD Baseline)', color: 'text-cyan-700 dark:text-cyan-400 bg-cyan-500/10 border-cyan-500/30' };
      case 4: return { label: 'Advanced Application', color: 'text-indigo-700 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/30' };
      case 5: return { label: 'Challenge / Mastery Olympiad', color: 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/30' };
      default: return { label: 'Standard', color: 'text-slate-700 dark:text-slate-400 bg-slate-500/10 border-slate-500/30' };
    }
  };

  const diffInfo = getDiffLabel(difficulty);

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {/* Policy Name */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 font-medium">
        <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
        <span>Policy: <strong className="text-slate-900 dark:text-white">{policy}</strong></span>
      </div>

      {/* Difficulty Level */}
      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border font-semibold ${diffInfo.color}`}>
        <Cpu className="w-3.5 h-3.5" />
        <span>Difficulty Level {difficulty}/5: {diffInfo.label}</span>
      </div>

      {/* Beta parameter estimate */}
      {betaEstimate !== undefined && (
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
          <span>IRT \(\beta\):</span>
          <span className="font-bold text-cyan-600 dark:text-cyan-300">{betaEstimate > 0 ? `+${betaEstimate}` : betaEstimate}</span>
        </div>
      )}

      {/* Direction change badge */}
      {direction && (
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border ${
            direction === 'increased'
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300'
              : direction === 'decreased'
              ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-700 dark:text-cyan-300'
              : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400'
          }`}
        >
          {direction === 'increased' && <TrendingUp className="w-3 h-3 text-amber-500" />}
          {direction === 'decreased' && <TrendingDown className="w-3 h-3 text-cyan-500" />}
          {direction === 'maintained' && <Minus className="w-3 h-3 text-slate-400" />}
          <span className="capitalize">{direction}</span>
        </div>
      )}
    </div>
  );
};
