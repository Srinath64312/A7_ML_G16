import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { SimulationApiResponse, PolicyType } from '../../types/api';
import { useTheme } from '../../hooks/useTheme';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface SimulationChartProps {
  data: SimulationApiResponse | null;
}

export const SimulationChart: React.FC<SimulationChartProps> = ({ data }) => {
  const { resolvedTheme } = useTheme();
  const [metric, setMetric] = useState<'reward' | 'learning_gain' | 'correctness' | 'engagement'>('reward');

  const isDark = resolvedTheme === 'dark';

  if (!data || !data.data) {
    return (
      <div className="p-8 text-center text-slate-500 font-mono text-xs">
        No simulation data loaded. Run the 8,000-interaction benchmark to view comparative policy curves.
      </div>
    );
  }

  const policies: PolicyType[] = ['DQN', 'Q-Learning', 'Rule-Based', 'Random', 'Fixed-Difficulty'];
  
  const colors: Record<PolicyType, { border: string; bg: string }> = {
    'DQN': { border: '#6366f1', bg: isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.1)' },
    'Q-Learning': { border: '#06b6d4', bg: isDark ? 'rgba(6, 182, 212, 0.15)' : 'rgba(6, 182, 212, 0.1)' },
    'Rule-Based': { border: '#10b981', bg: isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(16, 185, 129, 0.1)' },
    'Random': { border: '#f43f5e', bg: isDark ? 'rgba(244, 63, 94, 0.15)' : 'rgba(244, 63, 94, 0.1)' },
    'Fixed-Difficulty': { border: '#f59e0b', bg: isDark ? 'rgba(245, 158, 11, 0.15)' : 'rgba(245, 158, 11, 0.1)' },
  };

  const samplePolicy = policies.find((p) => data.data[p] && data.data[p].length > 0) || 'DQN';
  const labels = (data.data[samplePolicy] || []).map((item) => `Epoch ${item.epoch}`);

  const datasets = policies
    .filter((p) => data.data[p] && data.data[p].length > 0)
    .map((p) => ({
      label: p,
      data: data.data[p].map((d) => (d as any)[metric]),
      borderColor: colors[p].border,
      backgroundColor: colors[p].bg,
      tension: 0.35,
      borderWidth: p === 'DQN' || p === 'Q-Learning' ? 2.5 : 1.5,
      pointRadius: 2,
    }));

  const chartData = {
    labels,
    datasets,
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: isDark ? '#cbd5e1' : '#334155',
          font: { family: 'Outfit', size: 12 },
        },
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
      },
      y: {
        grid: { color: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)' },
        ticks: { color: isDark ? '#94a3b8' : '#64748b', font: { family: 'JetBrains Mono', size: 10 } },
      },
    },
  };

  return (
    <div className="space-y-4">
      {/* Metric Selector Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
          Convergence Trajectory (8,000 Interactions / 200 Synthetic Students)
        </span>

        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-lg border border-slate-200 dark:border-white/5">
          {(['reward', 'learning_gain', 'correctness', 'engagement'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMetric(m)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition-all ${
                metric === m
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {m.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Chart container */}
      <div className="h-[340px] w-full">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};
