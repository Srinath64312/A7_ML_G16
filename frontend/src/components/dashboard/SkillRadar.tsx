import React, { useState } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useTheme } from '../../hooks/useTheme';
import { Brain, Sliders, Target, Sparkles, CheckCircle2 } from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface SkillRadarProps {
  skills?: string[];
}

const DEFAULT_SKILLS = [
  'Addition/Subtraction Fractions',
  'Linear Equations Graphs',
  'Percent Calculations',
  'Area of Parallelograms',
  'Binary Search Trees',
  'Dynamic Programming',
  'Dijkstra Graph Search',
  'Paging & Virtual Memory',
];

export const SkillRadar: React.FC<SkillRadarProps> = ({ skills = DEFAULT_SKILLS }) => {
  const { resolvedTheme } = useTheme();
  const [simulatedTheta, setSimulatedTheta] = useState<number>(0.5);

  const isDark = resolvedTheme === 'dark';

  // Calculate synthetic skill masteries based on simulated ability theta (-3 to +3)
  const masteries = skills.map((_, idx) => {
    // Each skill has varied intrinsic difficulty beta (-1.5 to +1.5)
    const beta = ((idx % 5) - 2) * 0.6;
    const prob = 1 / (1 + Math.exp(-(simulatedTheta - beta)));
    return Math.round(prob * 100);
  });

  const chartData = {
    labels: skills,
    datasets: [
      {
        label: `Calibrated Skill Mastery at θ = ${simulatedTheta.toFixed(2)}`,
        data: masteries,
        backgroundColor: isDark ? 'rgba(99, 102, 241, 0.25)' : 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        pointBackgroundColor: '#06b6d4',
        pointBorderColor: isDark ? '#fff' : '#0f172a',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1',
        borderWidth: 2,
      },
      {
        label: 'Zone of Proximal Development Target (75%)',
        data: skills.map(() => 75),
        backgroundColor: 'transparent',
        borderColor: isDark ? 'rgba(245, 158, 11, 0.6)' : 'rgba(217, 119, 6, 0.7)',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
      }
    ],
  };

  const chartOptions = {
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
        callbacks: {
          label: (context: any) => ` ${context.dataset.label}: ${context.raw}%`,
        },
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 25,
          color: isDark ? '#94a3b8' : '#64748b',
          backdropColor: 'transparent',
          font: { family: 'JetBrains Mono', size: 9 },
        },
        grid: {
          color: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        },
        angleLines: {
          color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        pointLabels: {
          color: isDark ? '#cbd5e1' : '#1e293b',
          font: { family: 'Outfit', size: 11, weight: 600 as const },
        },
      },
    },
  };

  const avgMastery = Math.round(masteries.reduce((a, b) => a + b, 0) / masteries.length);

  return (
    <div className="space-y-6">
      {/* Ability Slider Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-white/5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-500" />
            <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Interactive Latent Ability Parameter Simulator \(\theta\)
            </h4>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Slide ability level \(\theta \in [-3.0, +3.0]\) to visualize dynamic knowledge frontier projection.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <input
            type="range"
            min="-3"
            max="3"
            step="0.1"
            value={simulatedTheta}
            onChange={(e) => setSimulatedTheta(parseFloat(e.target.value))}
            className="w-full sm:w-40 accent-indigo-600 cursor-pointer"
          />
          <span className="font-mono text-xs font-bold px-2 py-1 rounded bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/30 min-w-[60px] text-center">
            {simulatedTheta > 0 ? `+${simulatedTheta.toFixed(1)}` : simulatedTheta.toFixed(1)}
          </span>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="h-[350px] w-full">
        <Radar data={chartData} options={chartOptions} />
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 dark:bg-slate-900/60 p-3.5 rounded-xl border border-slate-200 dark:border-white/5 text-xs font-mono">
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Average Mastery</span>
          <span className="font-bold text-indigo-600 dark:text-indigo-400 text-sm">{avgMastery}%</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">ZPD Readiness</span>
          <span className={`font-bold text-sm ${avgMastery >= 60 && avgMastery <= 85 ? 'text-emerald-500' : 'text-amber-500'}`}>
            {avgMastery >= 60 && avgMastery <= 85 ? 'Optimal ZPD' : 'Calibrating'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Skills Calibrated</span>
          <span className="font-bold text-cyan-600 dark:text-cyan-400 text-sm">{skills.length} Areas</span>
        </div>
        <div>
          <span className="text-slate-500 dark:text-slate-400 block text-[10px]">Sequencing Action</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
            {simulatedTheta > 1 ? 'Mastery Olympiad' : simulatedTheta < -0.5 ? 'Scaffolded Base' : 'Adaptive ZPD'}
          </span>
        </div>
      </div>
    </div>
  );
};
