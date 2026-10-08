import React, { useState, useEffect } from 'react';
import { fetchTopics } from '../services/api';
import { TopicsApiResponse } from '../types/api';
import { GlassCard } from '../components/layout/GlassCard';
import { BookOpen, Award, CheckCircle, ArrowRight, Code, Calculator } from 'lucide-react';

interface StudyViewProps {
  onSelectTopicForTutor: (topic: string) => void;
}

export const StudyView: React.FC<StudyViewProps> = ({ onSelectTopicForTutor }) => {
  const [topicsData, setTopicsData] = useState<TopicsApiResponse | null>(null);
  const [activeTrack, setActiveTrack] = useState<'math' | 'cs'>('math');

  useEffect(() => {
    fetchTopics().then(setTopicsData).catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Track Selector Header */}
      <GlassCard className="p-6 md:p-8 space-y-4" glow="primary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Curriculum Tracks &amp; Knowledge Graphs
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select an empirical curriculum track calibrated through Item Response Theory and Deep Knowledge Tracing.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-200 dark:border-white/5">
            <button
              onClick={() => setActiveTrack('math')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTrack === 'math'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>ASSISTments Math</span>
            </button>

            <button
              onClick={() => setActiveTrack('cs')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTrack === 'cs'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Code className="w-4 h-4" />
              <span>Computer Science</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Topics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {topicsData?.tracks[activeTrack]?.topics.map((topic, index) => (
          <GlassCard
            key={topic}
            className="p-5 flex flex-col justify-between space-y-4 hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            onClick={() => onSelectTopicForTutor(topic)}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                  Skill #{index + 1}
                </span>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">5 Difficulty Tiers</span>
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">
                {topic}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                Empirical mastery tracking with Bayesian belief updates and RL difficulty adaptation.
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-white/5 text-xs text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-cyan-400 font-semibold">
              <span>Launch Tutor</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
