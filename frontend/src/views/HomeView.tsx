import React from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { ActiveTab } from '../components/layout/Header';
import { 
  Sparkles, 
  LineChart, 
  BookOpen, 
  CreditCard, 
  ArrowRight, 
  GraduationCap, 
  Cpu, 
  Activity, 
  Brain, 
  Target, 
  Zap, 
  CheckCircle2, 
  TrendingUp, 
  Award,
  Flame
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
  xp: number;
  level: number;
  streak: number;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, xp, level, streak }) => {
  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-12">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden border border-indigo-500/20 bg-gradient-to-b from-indigo-50 via-white to-slate-50 dark:from-[#0e1628] dark:via-[#0d121e] dark:to-[#07090e] p-8 md:p-12 lg:p-16 shadow-2xl shadow-indigo-950/10 dark:shadow-indigo-950/40 transition-colors">
        {/* Background glow accents */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-cyan-500/20 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold tracking-wide shadow-sm">
              <Award className="w-4 h-4 text-amber-500 animate-bounce" />
              <span>State Level Machine Learning Project Expo 2026 Showcase</span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>RL + DKT GRU + Socratic LLM</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Effective Personalized AI Tutors <br />
            <span className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 dark:from-cyan-400 dark:via-indigo-300 dark:to-indigo-500 bg-clip-text text-transparent">
              via LLM-Guided Reinforcement Learning
            </span>
          </h1>

          <p className="text-slate-600 dark:text-slate-300 text-base sm:text-lg leading-relaxed max-w-3xl font-normal">
            An end-to-end intelligent cognitive sequencing architecture. The system models latent student knowledge using 
            <strong> Deep Knowledge Tracing (DKT GRU RNN)</strong> and <strong>Bayesian Knowledge Tracing (BKT)</strong>, 
            calibrates question items with <strong>1-PL Item Response Theory (IRT)</strong>, and learns pedagogical sequencing policies via 
            <strong> Deep Q-Networks (DQN)</strong> and <strong>Tabular Q-Learning</strong> with Boltzmann exploration.
          </p>

          {/* Key Metrics Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">DKT Test AUC</span>
              <p className="text-xl font-black text-cyan-500 font-mono">0.842</p>
              <span className="text-[10px] text-emerald-500 font-medium">+5.3% vs BKT</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Learning Gain</span>
              <p className="text-xl font-black text-indigo-500 font-mono">+41.8%</p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Over Random Policy</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Interactions</span>
              <p className="text-xl font-black text-emerald-500 font-mono">8,000</p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">200 Cohort Students</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/80 dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 shadow-sm space-y-1">
              <span className="text-[10px] uppercase font-mono text-slate-500 dark:text-slate-400">Curriculum Nodes</span>
              <p className="text-xl font-black text-amber-500 font-mono">14 Topics</p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">ASSISTments + CS</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onNavigate('tutor')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-semibold text-sm shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-200" />
              <span>Start Interactive Tutor</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigate('dashboard')}
              className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-semibold text-sm shadow-md hover:border-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <LineChart className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Explore State Expo Lab</span>
            </button>
          </div>

          {/* Feature Badges */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> 1-PL Item Response Theory (IRT)
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500" /> Bayesian Knowledge Tracing (BKT)
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Deep Q-Network &amp; Q-Learning
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3 py-1 rounded-lg border border-slate-200 dark:border-white/5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" /> Socratic AI Speech Coach
            </span>
          </div>
        </div>
      </div>

      {/* Quick Access Grid - 4 Main Pillars */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">System Modules</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Jump directly into any part of the intelligent tutoring platform</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: AI Tutor */}
          <GlassCard 
            className="p-6 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            glow="primary"
            onClick={() => onNavigate('tutor')}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 dark:bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-500 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-indigo-600 dark:text-cyan-400" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-cyan-300 transition-colors">
                  Adaptive AI Tutor
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Interactive problem solving with real-time RL difficulty selection, instant feedback, and multi-tier Socratic hints.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 text-xs text-indigo-600 dark:text-indigo-400 font-semibold">
              <span>Launch Session</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>

          {/* Card 2: Research Lab */}
          <GlassCard 
            className="p-6 flex flex-col justify-between space-y-4 hover:border-cyan-500/50 hover:shadow-lg hover:shadow-cyan-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            glow="secondary"
            onClick={() => onNavigate('dashboard')}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 dark:bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400 group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6 text-cyan-600 dark:text-cyan-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors">
                  Research &amp; RL Lab
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Train RL agents, run 200+ simulated student cohorts, analyze convergence curves, and evaluate DKT test AUC.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
              <span>View Benchmarks</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>

          {/* Card 3: Curriculum Tracks */}
          <GlassCard 
            className="p-6 flex flex-col justify-between space-y-4 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            glow="success"
            onClick={() => onNavigate('study')}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 dark:bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
                <BookOpen className="w-6 h-6 text-emerald-600 dark:text-emerald-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  Curriculum Tracks
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Explore calibrated knowledge components across ASSISTments Math skills and Core Computer Science subjects.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
              <span>Browse Syllabus</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>

          {/* Card 4: Flashcards */}
          <GlassCard 
            className="p-6 flex flex-col justify-between space-y-4 hover:border-amber-500/50 hover:shadow-lg hover:shadow-amber-500/10 hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
            glow="warning"
            onClick={() => onNavigate('flashcards')}
          >
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors">
                  Spaced Flashcards
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  Active recall flashcards utilizing SuperMemo SM-2 interval scheduling to reinforce long-term memory retention.
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-white/5 text-xs text-amber-600 dark:text-amber-400 font-semibold">
              <span>Review Cards</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </GlassCard>
        </div>
      </div>

      {/* How It Works: Pipeline Flowchart */}
      <GlassCard className="p-6 md:p-8 space-y-6" glow="primary">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
              Adaptive Closed-Loop Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            How the Reinforcement Learning agent and psychometric models work together in each interaction
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {/* Step 1 */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                01. STATE
              </span>
              <Brain className="w-4 h-4 text-indigo-500" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Knowledge Tracing</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              BKT &amp; DKT infer hidden student mastery probability P(L_t) from interaction history.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded">
                02. ACTION
              </span>
              <Target className="w-4 h-4 text-cyan-500" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">RL Policy Selection</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Q-Learning / DQN selects optimal difficulty tier (1–5) targeting the Zone of Proximal Development.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                03. ITEM
              </span>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">IRT Item Sampling</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Problem generated matching 1-PL IRT calibrated discrimination and difficulty parameters.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                04. SOLVE
              </span>
              <GraduationCap className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Student Response</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Student attempts problem with progressive Socratic hints and instant explanatory feedback.
            </p>
          </div>

          {/* Step 5 */}
          <div className="bg-slate-50 dark:bg-slate-900/80 p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded">
                05. REWARD
              </span>
              <TrendingUp className="w-4 h-4 text-rose-500" />
            </div>
            <h4 className="font-bold text-sm text-slate-800 dark:text-slate-200">Bellman Update</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Composite reward (gain + engagement + correctness) updates Q-values for future recommendations.
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Overview & Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Your Learning Stats */}
        <GlassCard className="p-6 space-y-4" glow="secondary">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-500" />
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Your Progress</h3>
            </div>
            <span className="text-xs font-mono text-cyan-700 dark:text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded font-semibold">
              Active Profile
            </span>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Level</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 font-mono">Lvl {level}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Total XP</span>
              <span className="text-xl font-bold text-cyan-600 dark:text-cyan-400 font-mono">{xp}</span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/90 p-3 rounded-xl border border-slate-200 dark:border-white/5 text-center">
              <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Streak</span>
              <span className="text-xl font-bold text-amber-500 font-mono flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-500/40 text-amber-500" /> {streak}
              </span>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('tutor')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" /> Continue Practice Session
            </button>
          </div>
        </GlassCard>

        {/* Middle & Right: System Specifications & Benchmarks */}
        <GlassCard className="p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Algorithm &amp; Benchmark Specifications</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">ASSISTments Benchmark Dataset</div>
              <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Trained on 100,000+ student interaction trials calibrating empirical guess, slip, and transition parameters.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">1-PL Item Response Theory (IRT)</div>
              <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Continuous logistic difficulty modeling: P(correct) = sigmoid(ability - difficulty) calibrated per skill.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">Reinforcement Learning Policy</div>
              <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Tabular Q-Learning and Deep Q-Network (DQN) with Replay Buffer optimizing multi-objective pedagogical rewards.
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-white/5 space-y-1">
              <div className="font-semibold text-slate-800 dark:text-slate-200">Deep Knowledge Tracing (DKT)</div>
              <div className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Recurrent Neural Network with BPTT evaluating student correctness sequences across 8 fundamental math skills.
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
