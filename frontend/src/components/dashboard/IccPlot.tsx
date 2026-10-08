import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { SkillParametersResponse } from '../../types/api';
import { useTheme } from '../../hooks/useTheme';

interface IccPlotProps {
  data: SkillParametersResponse | null;
}

export const IccPlot: React.FC<IccPlotProps> = ({ data }) => {
  const { resolvedTheme } = useTheme();
  const [selectedSkill, setSelectedSkill] = useState<string>('Addition and Subtraction Fractions');

  const isDark = resolvedTheme === 'dark';

  if (!data || !data.icc_data) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        Item Characteristic Curves loading...
      </div>
    );
  }

  const skillNames = Object.keys(data.icc_data);
  const activeSkill = data.icc_data[selectedSkill] || data.icc_data[skillNames[0]];

  const chartData = {
    labels: data.theta_vals.map((t) => `θ = ${t}`),
    datasets: [
      {
        label: `${selectedSkill} 1-PL IRT Probability P(θ)`,
        data: activeSkill?.curve || [],
        borderColor: '#10b981',
        backgroundColor: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.08)',
        tension: 0.35,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: { color: isDark ? '#cbd5e1' : '#334155', font: { family: 'Outfit', size: 12 } },
      },
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        min: 0,
        max: 1,
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
        <div>
          <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
            Rasch Item Response Theory (1-PL IRT)
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Calibrated Item Characteristic Curves mapping student latent ability \(\theta\) to success probability.
          </p>
        </div>

        <select
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-xs text-slate-800 dark:text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
        >
          {skillNames.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="h-[280px] w-full">
        <Line data={chartData} options={chartOptions} />
      </div>

      {activeSkill && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-mono">
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Item Difficulty (\(\beta\))</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeSkill.beta}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Slip Probability \(P(S)\)</span>
            <span className="font-bold text-cyan-600 dark:text-cyan-400">{activeSkill.params.p_slip ?? 0.10}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Guess Probability \(P(G)\)</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">{activeSkill.params.p_guess ?? 0.18}</span>
          </div>
          <div>
            <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Transit Rate \(P(T)\)</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{activeSkill.params.p_transit ?? 0.15}</span>
          </div>
        </div>
      )}
    </div>
  );
};
