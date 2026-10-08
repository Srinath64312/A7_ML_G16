import React, { useState, useEffect } from 'react';
import { 
  runSimulation, 
  evaluateDkt, 
  getSkillParameters, 
  getQTable 
} from '../services/api';
import { 
  SimulationApiResponse, 
  DktEvaluationData, 
  SkillParametersResponse, 
  QTableResponse 
} from '../types/api';
import { GlassCard } from '../components/layout/GlassCard';
import { SimulationChart } from '../components/dashboard/SimulationChart';
import { DktMetrics } from '../components/dashboard/DktMetrics';
import { IccPlot } from '../components/dashboard/IccPlot';
import { QTableHeatmap } from '../components/dashboard/QTableHeatmap';
import { SkillRadar } from '../components/dashboard/SkillRadar';
import { PersonaSimulator } from '../components/dashboard/PersonaSimulator';
import { ExpoReportModal } from '../components/dashboard/ExpoReportModal';
import { 
  LineChart, 
  Play, 
  Sparkles, 
  BrainCircuit, 
  Layers, 
  Activity,
  CheckCircle2,
  Cpu,
  Radar,
  Users,
  Award,
  Download
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const DashboardView: React.FC = () => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'personas' | 'simulation' | 'radar' | 'dkt' | 'irt' | 'qtable'>('personas');
  const [simulationData, setSimulationData] = useState<SimulationApiResponse | null>(null);
  const [dktData, setDktData] = useState<DktEvaluationData | null>(null);
  const [skillParams, setSkillParams] = useState<SkillParametersResponse | null>(null);
  const [qTableData, setQTableData] = useState<QTableResponse | null>(null);

  const [isSimulating, setIsSimulating] = useState(false);
  const [isEvaluatingDkt, setIsEvaluatingDkt] = useState(false);
  const [showExpoDossier, setShowExpoDossier] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load initial skill parameters and Q-table if available
    getSkillParameters()
      .then(setSkillParams)
      .catch((e) => console.log('Skill params not yet ready:', e));

    getQTable()
      .then(setQTableData)
      .catch((e) => console.log('Q-Table not yet ready:', e));
  }, []);

  const handleRunSimulation = async () => {
    setIsSimulating(true);
    setError(null);
    try {
      const res = await runSimulation();
      setSimulationData(res);
      // Reload Q-table after simulation
      const qRes = await getQTable();
      setQTableData(qRes);
      showToast({
        type: 'success',
        title: 'Simulation Complete',
        message: '8,000 synthetic student interactions converged across 5 policies.',
      });
    } catch (err: any) {
      setError(err.message || 'Simulation execution failed');
      showToast({
        type: 'error',
        title: 'Simulation Failed',
        message: err.message || 'Could not connect to simulation worker.',
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const handleEvaluateDkt = async () => {
    setIsEvaluatingDkt(true);
    setError(null);
    try {
      const res = await evaluateDkt();
      setDktData(res.data);
      showToast({
        type: 'success',
        title: 'DKT Evaluation Complete',
        message: `RNN DKT Model evaluated with AUC ${((res.data.dkt_metrics.auc)*100).toFixed(1)}%.`,
      });
    } catch (err: any) {
      setError(err.message || 'DKT evaluation failed');
      showToast({
        type: 'error',
        title: 'DKT Evaluation Failed',
        message: err.message,
      });
    } finally {
      setIsEvaluatingDkt(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Banner */}
      <GlassCard className="p-6 md:p-8 space-y-4" glow="secondary">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-cyan-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Empirical Research &amp; Reinforcement Learning Lab
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-300 border border-amber-500/30 font-bold">
                State Expo 2026 Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Benchmark multi-objective RL tutoring against baselines, test live personas, inspect Deep Knowledge Tracing RNNs, and examine Rasch IRT calibration.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowExpoDossier(true)}
              className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-bold text-xs flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
            >
              <Award className="w-4 h-4 text-amber-500" />
              <span>Official Expo Dossier</span>
            </button>

            <button
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isSimulating ? 'Simulating 8,000 Steps...' : 'Run RL Benchmark'}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto border-t border-slate-200 dark:border-white/10 pt-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('personas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'personas'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md shadow-cyan-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900/60'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            <span>1-Click Persona Simulator (Judges Demo)</span>
          </button>

          <button
            onClick={() => setActiveTab('simulation')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'simulation'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900/60'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>5-Policy Simulation Trajectories</span>
          </button>

          <button
            onClick={() => setActiveTab('radar')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'radar'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Skill Radar (ZPD)</span>
          </button>

          <button
            onClick={() => setActiveTab('dkt')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'dkt'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900/60'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Deep Knowledge Tracing (RNN)</span>
          </button>

          <button
            onClick={() => setActiveTab('irt')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'irt'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1-PL Rasch IRT Curves</span>
          </button>

          <button
            onClick={() => setActiveTab('qtable')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              activeTab === 'qtable'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-900/60'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Learned Q-Table Heatmap</span>
          </button>
        </div>
      </GlassCard>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-200 text-xs">
          {error}
        </div>
      )}

      {/* Main View Area */}
      <GlassCard className="p-6 md:p-8" glow="primary">
        {activeTab === 'personas' && <PersonaSimulator />}
        {activeTab === 'simulation' && <SimulationChart data={simulationData} />}
        {activeTab === 'radar' && <SkillRadar />}
        {activeTab === 'dkt' && (
          <DktMetrics
            data={dktData}
            onEvaluate={handleEvaluateDkt}
            isLoading={isEvaluatingDkt}
          />
        )}
        {activeTab === 'irt' && <IccPlot data={skillParams} />}
        {activeTab === 'qtable' && <QTableHeatmap data={qTableData} />}
      </GlassCard>

      {/* Official Expo Dossier Modal */}
      <ExpoReportModal
        isOpen={showExpoDossier}
        onClose={() => setShowExpoDossier(false)}
      />
    </div>
  );
};
