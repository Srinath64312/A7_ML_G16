import React from 'react';
import { QTableResponse } from '../../types/api';
import { useTheme } from '../../hooks/useTheme';

interface QTableHeatmapProps {
  data: QTableResponse | null;
}

export const QTableHeatmap: React.FC<QTableHeatmapProps> = ({ data }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (!data || !data.q_table) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No Q-table weights loaded. Run the simulation to train the tabular Q-learning agent.
      </div>
    );
  }

  const qTable = data.q_table;
  const states = [
    '[0.0 - 0.1)', '[0.1 - 0.2)', '[0.2 - 0.3)', '[0.3 - 0.4)', '[0.4 - 0.5)',
    '[0.5 - 0.6)', '[0.6 - 0.7)', '[0.7 - 0.8)', '[0.8 - 0.9)', '[0.9 - 1.0]'
  ];
  const actions = ['Diff 1', 'Diff 2', 'Diff 3', 'Diff 4', 'Diff 5'];

  // Compute min and max for heatmap normalization
  let minVal = Infinity;
  let maxVal = -Infinity;
  qTable.forEach((row) => {
    row.forEach((v) => {
      if (v < minVal) minVal = v;
      if (v > maxVal) maxVal = v;
    });
  });

  if (minVal === maxVal) {
    minVal = 0;
    maxVal = 1;
  }

  const getHeatmapColor = (val: number) => {
    const norm = (val - minVal) / (maxVal - minVal || 1);
    if (isDark) {
      if (norm > 0.7) return 'bg-indigo-600/80 text-white font-bold';
      if (norm > 0.4) return 'bg-cyan-700/60 text-cyan-100';
      if (norm > 0.2) return 'bg-slate-800/80 text-slate-300';
      return 'bg-slate-900/90 text-slate-500';
    } else {
      if (norm > 0.7) return 'bg-indigo-600 text-white font-bold shadow-sm';
      if (norm > 0.4) return 'bg-indigo-100 text-indigo-900 font-semibold';
      if (norm > 0.2) return 'bg-slate-100 text-slate-700';
      return 'bg-slate-50 text-slate-400';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
        <div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Learned Q-Value Matrix \(Q(s, a)\)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Mapping student latent mastery state bins (0.0 to 1.0) to action difficulty selection (Levels 1 to 5).
          </p>
        </div>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${data.is_trained ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'}`}>
          {data.is_trained ? 'Trained Policy' : 'Initial Policy'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-center text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400">
              <th className="p-2 text-left">Mastery State</th>
              {actions.map((act) => (
                <th key={act} className="p-2">{act}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {qTable.map((row, sIdx) => {
              const maxInRow = Math.max(...row);
              return (
                <tr key={sIdx} className="border-b border-slate-200/60 dark:border-white/5">
                  <td className="p-2 text-left font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    {states[sIdx] || `State ${sIdx}`}
                  </td>
                  {row.map((val, aIdx) => {
                    const isOptimal = val === maxInRow && val !== 0;
                    return (
                      <td key={aIdx} className="p-1.5">
                        <div
                          className={`p-2 rounded-lg transition-all ${getHeatmapColor(val)} ${
                            isOptimal ? 'ring-2 ring-cyan-500 shadow-sm font-bold' : ''
                          }`}
                        >
                          {val.toFixed(2)}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
