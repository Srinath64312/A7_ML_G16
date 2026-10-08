import React, { useState } from 'react';
import { GlassCard } from '../layout/GlassCard';
import { QuestionHistoryItem } from './SeriesStepper';
import { 
  Trophy, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  RotateCcw, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  BrainCircuit,
  Download,
  Share2
} from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface SeriesReportProps {
  topic: string;
  policy: string;
  history: QuestionHistoryItem[];
  initialMastery: number;
  finalMastery: number;
  onRestartSeries: () => void;
  onChooseNewTopic: () => void;
}

export const SeriesReport: React.FC<SeriesReportProps> = ({
  topic,
  policy,
  history,
  initialMastery,
  finalMastery,
  onRestartSeries,
  onChooseNewTopic,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const { showToast } = useToast();

  const total = history.length;
  const correctCount = history.filter((h) => h.isCorrect).length;
  const accuracy = Math.round((correctCount / (total || 1)) * 100);
  const masteryGain = Math.round((finalMastery - initialMastery) * 100);

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  const handleExportMarkdown = () => {
    const lines = [
      `# Adaptive AI Tutor - Session Study Report`,
      `**Topic:** ${topic}`,
      `**Reinforcement Learning Policy:** ${policy}`,
      `**Date:** ${new Date().toLocaleString()}`,
      ``,
      `## Summary Performance`,
      `- **Accuracy:** ${accuracy}% (${correctCount}/${total})`,
      `- **Initial Bayesian Mastery $P(L_0)$:** ${Math.round(initialMastery * 100)}%`,
      `- **Final Bayesian Mastery $P(L_T)$:** ${Math.round(finalMastery * 100)}%`,
      `- **Mastery Delta $\\Delta P(L)$:** ${masteryGain >= 0 ? `+${masteryGain}%` : `${masteryGain}%`}`,
      `- **Scaffolding Hints Used:** ${history.reduce((a, b) => a + b.hintsUsed, 0)}`,
      ``,
      `## Problem-by-Problem Diagnostics`,
    ];

    history.forEach((h, idx) => {
      lines.push(`### Question ${idx + 1} (Difficulty ${h.difficulty}/5)`);
      lines.push(`**Prompt:** ${h.question}`);
      lines.push(`- **Your Answer:** ${h.selectedAnswer} (${h.isCorrect ? 'Correct ✅' : 'Incorrect ❌'})`);
      lines.push(`- **Correct Answer:** ${h.correctAnswer}`);
      lines.push(`- **Hints Used:** ${h.hintsUsed}`);
      lines.push(`- **Explanation:** ${h.explanation}`);
      lines.push(`- **Mastery Transition:** ${Math.round(h.oldMastery * 100)}% → ${Math.round(h.newMastery * 100)}%`);
      lines.push(``);
    });

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `ai_tutor_report_${topic.toLowerCase().replace(/\s+/g, '_')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast({
      type: 'success',
      title: 'Report Exported',
      message: 'Markdown study session report downloaded successfully.',
    });
  };

  return (
    <GlassCard className="p-6 md:p-8 space-y-6 animate-fadeIn" glow="primary">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Question Series Completed!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cognitive Performance &amp; Reinforcement Learning Summary for <strong>{topic}</strong>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Policy badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-xs font-mono text-cyan-600 dark:text-cyan-300">
            <BrainCircuit className="w-4 h-4 text-cyan-500" />
            <span>Policy: {policy}</span>
          </div>

          {/* Export Button */}
          <button
            onClick={handleExportMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-xs font-semibold transition-all shadow-sm"
            title="Download formatted Markdown study summary"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Notes</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Score Card */}
        <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-1">
          <span className="text-xs text-indigo-700 dark:text-indigo-300 font-semibold block">Series Accuracy</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">{accuracy}%</span>
            <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400">({correctCount}/{total})</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Empirical Correctness Rate</p>
        </div>

        {/* Latent Mastery Delta */}
        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 space-y-1">
          <span className="text-xs text-cyan-700 dark:text-cyan-300 font-semibold block">Mastery Gain \(\Delta P(L)\)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {masteryGain >= 0 ? `+${masteryGain}%` : `${masteryGain}%`}
            </span>
            <span className="text-xs font-mono text-cyan-600 dark:text-cyan-400">
              ({Math.round(initialMastery * 100)}% → {Math.round(finalMastery * 100)}%)
            </span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Bayesian Posterior Progression</p>
        </div>

        {/* Scaffolding Efficiency */}
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <span className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold block">Scaffolding Used</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
              {history.reduce((acc, curr) => acc + curr.hintsUsed, 0)}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400">Total Hints</span>
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">Guided Explanations Requested</p>
        </div>

        {/* Difficulty Adaptation */}
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 space-y-1">
          <span className="text-xs text-amber-700 dark:text-amber-300 font-semibold block">Difficulty Range</span>
          <div className="flex items-baseline gap-1.5 font-mono text-sm font-bold text-amber-800 dark:text-amber-200">
            {history.map((h, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-amber-500/20">
                L{h.difficulty}
              </span>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">RL Difficulty Trajectory</p>
        </div>
      </div>

      {/* Detailed Question Review List */}
      <div className="space-y-3 pt-2">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <span>Question-by-Question Diagnostic Review</span>
        </h3>

        <div className="space-y-2">
          {history.map((item, idx) => {
            const isExpanded = expandedIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-slate-900/60 overflow-hidden transition-all"
              >
                {/* Accordion Row Header */}
                <div
                  onClick={() => toggleExpand(idx)}
                  className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        item.isCorrect
                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-700 dark:text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.isCorrect ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                      Q{item.questionNumber}
                    </span>
                    <span className="text-xs text-slate-800 dark:text-slate-200 line-clamp-1 max-w-md font-medium">
                      {item.question}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-slate-300 dark:border-white/5">
                      Diff {item.difficulty}/5
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-slate-200 dark:border-white/5 bg-white dark:bg-slate-950/40 space-y-3 text-xs font-sans animate-fadeIn">
                    <div>
                      <span className="text-slate-500 font-mono text-[11px] block">Full Problem:</span>
                      <p className="text-slate-800 dark:text-slate-100 font-medium">{item.question}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-[11px]">
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                        <span className="text-slate-500 block text-[10px]">Your Answer:</span>
                        <span className={item.isCorrect ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                          {item.selectedAnswer}
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/5">
                        <span className="text-slate-500 block text-[10px]">Correct Answer:</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">{item.correctAnswer}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/20 text-indigo-950 dark:text-indigo-200 leading-relaxed text-[11px]">
                      <strong>Pedagogical Explanation:</strong> {item.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-white/10">
        <button
          onClick={onChooseNewTopic}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
        >
          Change Curriculum Topic
        </button>

        <button
          onClick={onRestartSeries}
          className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-lg shadow-indigo-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Start Another Series</span>
        </button>
      </div>
    </GlassCard>
  );
};
