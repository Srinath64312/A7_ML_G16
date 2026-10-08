import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Play, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Activity, 
  TrendingUp, 
  ArrowRight, 
  Cpu, 
  BrainCircuit, 
  Clock, 
  HelpCircle,
  RotateCcw,
  Loader2,
  Award
} from 'lucide-react';
import { getExpoScenarios, simulatePersona } from '../../services/api';
import { ExpoScenario, ExpoPersonaSimResult, PolicyType } from '../../types/api';
import { useToast } from '../../hooks/useToast';

export const PersonaSimulator: React.FC = () => {
  const { showToast } = useToast();
  const [scenarios, setScenarios] = useState<ExpoScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('developing');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('DQN');
  const [selectedTopic, setSelectedTopic] = useState<string>('DSA');
  const [simulationResult, setSimulationResult] = useState<ExpoPersonaSimResult | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  useEffect(() => {
    getExpoScenarios()
      .then((res) => {
        setScenarios(res.scenarios);
      })
      .catch((err) => console.error(err));
  }, []);

  const handleRunPersona = async () => {
    setIsRunning(true);
    setSimulationResult(null);
    setCurrentStepIndex(0);
    try {
      const res = await simulatePersona(selectedScenarioId, selectedPolicy, selectedTopic, 8);
      setSimulationResult(res);
      showToast({
        type: 'success',
        title: 'Expo Simulation Complete',
        message: `Simulated 8 adaptive interactions for ${res.persona_id} under ${selectedPolicy}.`,
      });

      // Animate step by step
      let step = 0;
      const interval = setInterval(() => {
        step += 1;
        setCurrentStepIndex(step);
        if (step >= res.trace.length) {
          clearInterval(interval);
        }
      }, 350);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Simulation Failed',
        message: err.message || 'Could not run persona trace.',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const selectedScenario = scenarios.find((s) => s.id === selectedScenarioId);

  return (
    <div className="space-y-6">
      {/* Header / Intro for Judges */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-900/40 via-indigo-950/20 to-slate-900/60 border border-indigo-500/30 shadow-xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-cyan-400">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-white tracking-tight">
                  State Expo 1-Click Interactive Persona Lab
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Judges Live Demo
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Select a simulated student persona and watch the Reinforcement Learning agent dynamically calibrate difficulty and scaffold mastery in real-time.
              </p>
            </div>
          </div>

          <button
            onClick={handleRunPersona}
            disabled={isRunning}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-500 to-indigo-600 text-white font-bold text-xs shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 transition-all cursor-pointer"
          >
            {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-white" />}
            <span>Execute Live Judge Trace</span>
          </button>
        </div>
      </div>

      {/* Persona Selection Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {scenarios.map((sc) => {
          const isSelected = selectedScenarioId === sc.id;
          return (
            <div
              key={sc.id}
              onClick={() => setSelectedScenarioId(sc.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-indigo-600/15 border-indigo-500 shadow-lg shadow-indigo-500/15 scale-[1.02]'
                  : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-white/5 hover:border-indigo-500/40 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {sc.name}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                  Init θ: {(sc.initial_skill * 100).toFixed(0)}%
                </span>
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium mb-2">
                {sc.tagline}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                {sc.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Control Panel: Policy & Topic */}
      <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-white/5 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">RL Policy:</span>
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['DQN', 'Q-Learning', 'Rule-Based', 'Random'] as PolicyType[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setSelectedPolicy(p)}
                  className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                    selectedPolicy === p
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Topic:</span>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-slate-200 font-medium focus:outline-none"
            >
              <option value="DSA">DSA (Data Structures)</option>
              <option value="DBMS">DBMS</option>
              <option value="Computer Networks">Computer Networks</option>
              <option value="Java">Java OOP</option>
              <option value="Operating Systems">Operating Systems</option>
              <option value="Linear Equations Graphs">Linear Equations Graphs (ASSISTments)</option>
              <option value="Probability of Independent Events">Probability (ASSISTments)</option>
            </select>
          </div>
        </div>

        {simulationResult && (
          <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300 font-mono text-xs">
            <span>
              Net Mastery Gain: <strong className="text-emerald-500">+{((simulationResult.net_gain) * 100).toFixed(1)}%</strong>
            </span>
          </div>
        )}
      </div>

      {/* Simulation Trace Table */}
      {simulationResult && (
        <div className="space-y-4 animate-fadeIn">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-slate-900/80 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-slate-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
                <Activity className="w-4 h-4 text-cyan-500" />
                <span>Live Interaction Sequence Trace (8 Steps)</span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                Persona: {simulationResult.persona_id.toUpperCase()} • Policy: {simulationResult.policy}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/5 text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <th className="py-3 px-4">Step</th>
                    <th className="py-3 px-4">Problem Difficulty</th>
                    <th className="py-3 px-4">IRT β</th>
                    <th className="py-3 px-4">Student Outcome</th>
                    <th className="py-3 px-4">Response Time</th>
                    <th className="py-3 px-4">BKT Prior → Posterior</th>
                    <th className="py-3 px-4">ZPD Fit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-white/5 font-mono">
                  {simulationResult.trace.slice(0, currentStepIndex).map((t, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors animate-fadeIn"
                    >
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        #{t.step}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold border border-indigo-500/20">
                          Level {t.difficulty}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {t.irt_beta >= 0 ? `+${t.irt_beta.toFixed(2)}` : t.irt_beta.toFixed(2)}
                      </td>
                      <td className="py-3 px-4">
                        {t.student_correct ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {t.response_time_sec}s
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-400">{(t.old_mastery * 100).toFixed(0)}%</span>
                        <span className="mx-1.5 text-slate-400">→</span>
                        <strong className={t.mastery_gain >= 0 ? 'text-emerald-500' : 'text-amber-500'}>
                          {(t.new_mastery * 100).toFixed(0)}%
                        </strong>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-semibold border border-cyan-500/20">
                          {(t.zpd_score * 100).toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
