import React from 'react';
import { Line } from 'react-chartjs-2';
import { DktEvaluationData } from '../../types/api';
import { Brain, Award, TrendingUp, CheckCircle, Cpu } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface DktMetricsProps {
  data: DktEvaluationData | null;
  onEvaluate: () => void;
  isLoading: boolean;
}

export const DktMetrics: React.FC<DktMetricsProps> = ({ data, onEvaluate, isLoading }) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  if (!data) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Train and evaluate the Recurrent Neural Network (RNN) Deep Knowledge Tracing model on sequential interactions.
        </p>
        <button
          onClick={onEvaluate}
          disabled={isLoading}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 transition-all"
        >
          {isLoading ? 'Training Pure NumPy RNN DKT...' : 'Train & Evaluate DKT Model'}
        </button>
      </div>
    );
  }

  const lossChartData = {
    labels: data.loss_history.map((_, i) => `Ep ${i + 1}`),
    datasets: [
      {
        label: 'DKT Binary Cross-Entropy Loss',
        data: data.loss_history,
        borderColor: '#06b6d4',
        backgroundColor: isDark ? 'rgba(6, 182, 212, 0.1)' : 'rgba(6, 182, 212, 0.08)',
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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

  const dktAuc = (data.dkt_metrics.auc * 100).toFixed(1);
  const bktAuc = (data.bkt_baseline.auc * 100).toFixed(1);
  const dktAcc = (data.dkt_metrics.accuracy * 100).toFixed(1);
  const bktAcc = (data.bkt_baseline.accuracy * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* DKT AUC */}
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-indigo-700 dark:text-indigo-300 font-semibold">
            <span>DKT Model AUC</span>
            <Award className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{dktAuc}%</p>
          <p className="text-[10px] text-indigo-600 dark:text-indigo-400/80">Recurrent Hidden State Tracking</p>
        </div>

        {/* BKT Baseline AUC */}
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-cyan-700 dark:text-cyan-300 font-semibold">
            <span>Classical BKT AUC</span>
            <Brain className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{bktAuc}%</p>
          <p className="text-[10px] text-cyan-600 dark:text-cyan-400/80">Independent Skill Markov Chain</p>
        </div>

        {/* DKT Accuracy */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300 font-semibold">
            <span>DKT Accuracy</span>
            <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{dktAcc}%</p>
          <p className="text-[10px] text-emerald-600 dark:text-emerald-400/80">Next-Question Correctness</p>
        </div>

        {/* Sequences */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-semibold">
            <span>Student Sequences</span>
            <Cpu className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{data.num_student_sequences}</p>
          <p className="text-[10px] text-amber-600 dark:text-amber-400/80">Over {data.num_skills} Calibrated Skills</p>
        </div>
      </div>

      {/* Loss convergence curve */}
      <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            DKT RNN Training Loss Convergence (Binary Cross-Entropy)
          </span>
          <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">
            Final Loss: {data.dkt_metrics.bce_loss.toFixed(4)}
          </span>
        </div>
        <div className="h-[220px]">
          <Line data={lossChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};
