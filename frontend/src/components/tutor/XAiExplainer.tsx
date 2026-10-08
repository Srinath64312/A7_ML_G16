import React from 'react';
import { Brain, Cpu, Zap, Activity, Info, BarChart3, ChevronDown, ChevronUp } from 'lucide-react';
import { PolicyType } from '../../types/api';

interface XAiExplainerProps {
  policy: PolicyType;
  mastery: number;
  oldMastery?: number;
  difficulty: number;
  betaEstimate?: number;
  qValues?: number[];
  zpdAlignment?: number;
  isOpen: boolean;
  onToggle: () => void;
}

export const XAiExplainer: React.FC<XAiExplainerProps> = ({
  policy,
  mastery,
  oldMastery,
  difficulty,
  betaEstimate = 0.0,
  qValues = [0.2, 0.4, 0.8, 0.5, 0.3],
  zpdAlignment = 0.95,
  isOpen,
  onToggle,
}) => {
  const masteryDelta = oldMastery !== undefined ? (mastery - oldMastery) * 100 : 0;
  const maxQ = Math.max(...qValues);
  const minQ = Math.min(...qValues);
  const qRange = Math.max(0.1, maxQ - minQ);

  return (
    <div className="rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-slate-900/90 via-[#0c1322] to-slate-950 text-white overflow-hidden shadow-xl shadow-indigo-950/20 transition-all">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 px-5 hover:bg-white/5 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-cyan-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                Explainable AI (XAI) Decision Core
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                {policy} Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Real-time policy Q-values, 3-PL IRT item difficulty &amp; Bayesian posterior math
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <span className="hidden sm:inline font-mono">
            ZPD Alignment: {(zpdAlignment * 100).toFixed(0)}%
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Accordion Content */}
      {isOpen && (
        <div className="p-5 pt-2 border-t border-white/5 space-y-5 animate-fadeIn">
          {/* Top 3 KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* ZPD Gauge */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Activity className="w-3.5 h-3.5 text-cyan-400" />
                  ZPD Alignment
                </span>
                <span className="font-mono font-bold text-cyan-400">{(zpdAlignment * 100).toFixed(1)}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full"
                  style={{ width: `${Math.min(100, zpdAlignment * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400">
                Optimal cognitive difficulty without boredom or overload.
              </p>
            </div>

            {/* IRT Rasch β */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                  1-PL IRT Difficulty (β)
                </span>
                <span className="font-mono font-bold text-indigo-300">{betaEstimate >= 0 ? `+${betaEstimate.toFixed(2)}` : betaEstimate.toFixed(2)}</span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                Item Level {difficulty} / 5
              </p>
              <p className="text-[10px] text-slate-400">
                Logistic calibration: P(θ) = 1 / (1 + e^-(θ - β))
              </p>
            </div>

            {/* BKT Mastery Delta */}
            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Brain className="w-3.5 h-3.5 text-emerald-400" />
                  BKT Posterior Update
                </span>
                <span className={`font-mono font-bold ${masteryDelta >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {masteryDelta >= 0 ? `+${masteryDelta.toFixed(1)}%` : `${masteryDelta.toFixed(1)}%`}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-mono">
                P(L_t) = {(mastery * 100).toFixed(1)}%
              </p>
              <p className="text-[10px] text-slate-400">
                Kalman-like recursive update conditioning on Slip &amp; Guess.
              </p>
            </div>
          </div>

          {/* Q-Value Bar Distribution */}
          <div className="space-y-2 p-3.5 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                RL Policy Action Expected Values Q(s, a)
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Optimal Action: Level {difficulty}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 pt-1">
              {qValues.map((qVal, idx) => {
                const isSelected = idx + 1 === difficulty;
                const normalizedHeight = Math.max(15, Math.min(100, ((qVal - minQ) / qRange) * 100));
                return (
                  <div
                    key={idx}
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-400/50 shadow-md shadow-indigo-500/20'
                        : 'bg-white/[0.02] border-white/5 opacity-70'
                    }`}
                  >
                    <span className="text-[10px] font-mono text-slate-400">Lvl {idx + 1}</span>
                    <div className="w-full h-12 flex items-end justify-center py-0.5">
                      <div
                        className={`w-full max-w-[24px] rounded-t transition-all duration-500 ${
                          isSelected
                            ? 'bg-gradient-to-t from-indigo-500 to-cyan-400'
                            : 'bg-slate-700'
                        }`}
                        style={{ height: `${normalizedHeight}%` }}
                      />
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${isSelected ? 'text-cyan-300' : 'text-slate-400'}`}>
                      {qVal.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
