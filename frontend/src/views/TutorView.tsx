import React, { useState, useEffect, useRef } from 'react';
import { 
  fetchTopics, 
  startSession, 
  submitAnswer 
} from '../services/api';
import { 
  PolicyType, 
  StartSessionResponse, 
  SubmitAnswerResponse, 
  TopicsApiResponse 
} from '../types/api';
import { GlassCard } from '../components/layout/GlassCard';
import { MasteryBar } from '../components/tutor/MasteryBar';
import { PolicyBadge } from '../components/tutor/PolicyBadge';
import { HintBox } from '../components/tutor/HintBox';
import { QuestionCard } from '../components/tutor/QuestionCard';
import { SeriesStepper, QuestionHistoryItem } from '../components/tutor/SeriesStepper';
import { SeriesReport } from '../components/tutor/SeriesReport';
import { XAiExplainer } from '../components/tutor/XAiExplainer';
import { SocraticCoachModal } from '../components/tutor/SocraticCoachModal';
import { 
  Sparkles, 
  BrainCircuit, 
  RefreshCw, 
  AlertTriangle, 
  Layers, 
  BookOpen, 
  CheckSquare, 
  Zap, 
  Bot, 
  Volume2, 
  VolumeX,
  Cpu,
  Award
} from 'lucide-react';

interface TutorViewProps {
  onCorrectAnswer: (diff: number) => void;
  onWrongAnswer: (diff: number) => void;
  playCorrectSound: () => void;
  playWrongSound: () => void;
  playHintSound: () => void;
}

export type SeriesMode = '5' | '10' | 'infinite';

export const TutorView: React.FC<TutorViewProps> = ({
  onCorrectAnswer,
  onWrongAnswer,
  playCorrectSound,
  playWrongSound,
  playHintSound,
}) => {
  const [topicsData, setTopicsData] = useState<TopicsApiResponse | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string>('Linear Equations Graphs');
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType>('Q-Learning');
  const [seriesLength, setSeriesLength] = useState<SeriesMode>('5');

  const [session, setSession] = useState<StartSessionResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Question interaction state
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(1);
  const [hintsUsed, setHintsUsed] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  // Voice Narration (Text-to-Speech)
  const [isVoiceActive, setIsVoiceActive] = useState<boolean>(false);

  // Socratic Coach Modal & XAI Panel
  const [isCoachModalOpen, setIsCoachModalOpen] = useState<boolean>(false);
  const [isXAiOpen, setIsXAiOpen] = useState<boolean>(true);

  // Live Timer
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Series tracking & history
  const [initialMastery, setInitialMastery] = useState<number>(0.4);
  const [questionHistory, setQuestionHistory] = useState<QuestionHistoryItem[]>([]);
  const [isSeriesCompleted, setIsSeriesCompleted] = useState<boolean>(false);

  // Dynamic feedback & XAI metrics
  const [oldMastery, setOldMastery] = useState<number | undefined>(undefined);
  const [qValues, setQValues] = useState<number[] | undefined>(undefined);
  const [zpdAlignment, setZpdAlignment] = useState<number | undefined>(undefined);
  const [feedback, setFeedback] = useState<{
    submitted: boolean;
    correct: boolean;
    correctAnswer: string;
    explanation: string;
  } | null>(null);
  
  const [lastDirection, setLastDirection] = useState<'increased' | 'decreased' | 'maintained' | undefined>(undefined);
  const [betaEstimate, setBetaEstimate] = useState<number | undefined>(undefined);
  const [nextQuestionCache, setNextQuestionCache] = useState<SubmitAnswerResponse | null>(null);

  // Load available topics on mount
  useEffect(() => {
    fetchTopics()
      .then((data) => {
        setTopicsData(data);
        if (data.all_topics && data.all_topics.length > 0) {
          setSelectedTopic(data.all_topics[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Failed to load topic catalog from Flask backend.');
      });
  }, []);

  // Text to Speech helper
  const speakText = (text: string) => {
    if (!isVoiceActive || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/<[^>]*>?/gm, '').replace(/β/g, 'beta').replace(/θ/g, 'theta');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.log('Speech synthesis error:', e);
    }
  };

  // Timer ticker
  useEffect(() => {
    if (session && !feedback?.submitted && !isSeriesCompleted) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session, feedback, isSeriesCompleted]);

  const handleStartSession = async () => {
    setLoading(true);
    setError(null);
    setFeedback(null);
    setSelectedChoice(null);
    setHintsUsed(0);
    setQuestionCount(1);
    setQuestionHistory([]);
    setIsSeriesCompleted(false);
    setOldMastery(undefined);
    setLastDirection(undefined);
    setBetaEstimate(undefined);
    setQValues(undefined);
    setZpdAlignment(undefined);
    setTimerSeconds(0);

    try {
      const resp = await startSession(selectedTopic, selectedPolicy);
      setSession(resp);
      setInitialMastery(resp.mastery);
      if (isVoiceActive) {
        speakText(`Question 1. Level ${resp.difficulty}. ${resp.question}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initialize tutoring session.');
    } finally {
      setLoading(false);
    }
  };

  const handleUseHint = () => {
    setHintsUsed((prev) => prev + 1);
    playHintSound();
    if (isVoiceActive && session?.hint) {
      speakText(`Hint: ${session.hint}`);
    }
  };

  const handleSubmit = async () => {
    if (!session || !selectedChoice || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const resp: SubmitAnswerResponse = await submitAnswer(
        session.session_id,
        selectedChoice,
        timerSeconds,
        hintsUsed
      );

      // Play audio feedback
      if (resp.correct) {
        onCorrectAnswer(session.difficulty);
        playCorrectSound();
      } else {
        onWrongAnswer(session.difficulty);
        playWrongSound();
      }

      setOldMastery(session.mastery);
      setLastDirection(resp.difficulty_direction);
      setBetaEstimate(resp.beta_estimate);
      if (resp.q_values) setQValues(resp.q_values);
      if (resp.zpd_alignment !== undefined) setZpdAlignment(resp.zpd_alignment);

      // Speak feedback
      if (isVoiceActive) {
        speakText(resp.correct ? `Correct! ${resp.explanation}` : `Incorrect. ${resp.explanation}`);
      }

      // Save to question history
      const historyItem: QuestionHistoryItem = {
        questionNumber: questionCount,
        question: session.question,
        difficulty: session.difficulty,
        selectedAnswer: selectedChoice,
        correctAnswer: resp.correct_answer,
        isCorrect: resp.correct,
        explanation: resp.explanation,
        hintsUsed,
        oldMastery: session.mastery,
        newMastery: resp.new_mastery,
      };

      setQuestionHistory((prev) => [...prev, historyItem]);

      // Cache next question response
      setNextQuestionCache(resp);

      // Set immediate visual feedback
      setFeedback({
        submitted: true,
        correct: resp.correct,
        correctAnswer: resp.correct_answer,
        explanation: resp.explanation,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit answer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    if (!session || !nextQuestionCache) return;

    // Check if series is completed
    if (seriesLength !== 'infinite' && questionCount >= Number(seriesLength)) {
      setIsSeriesCompleted(true);
      return;
    }

    // Advance to next question
    const nextQ = nextQuestionCache.next_question;
    setSession({
      session_id: session.session_id,
      topic: selectedTopic,
      question: nextQ.question,
      choices: nextQ.choices,
      difficulty: nextQuestionCache.next_difficulty,
      hint: nextQ.hint,
      mastery: nextQuestionCache.new_mastery,
    });

    setQuestionCount((prev) => prev + 1);
    setSelectedChoice(null);
    setHintsUsed(0);
    setFeedback(null);
    setNextQuestionCache(null);
    setTimerSeconds(0);

    if (isVoiceActive) {
      speakText(`Question ${questionCount + 1}. Level ${nextQuestionCache.next_difficulty}. ${nextQ.question}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Session Configuration Card */}
      {!session || isSeriesCompleted ? (
        <GlassCard className="p-6 md:p-8 space-y-6" glow="primary">
          <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                  Configure Interactive Tutoring Session
                </h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                  State Expo 2026
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select your knowledge skill track, adaptive reinforcement learning policy, and question set length.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Topic Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Curriculum Skill</label>
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                {topicsData?.all_topics?.map((topic) => (
                  <option key={topic} value={topic}>
                    {topic}
                  </option>
                )) || <option>Loading curriculum tracks...</option>}
              </select>
            </div>

            {/* Policy Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">RL Policy</label>
              <select
                value={selectedPolicy}
                onChange={(e) => setSelectedPolicy(e.target.value as PolicyType)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="Q-Learning">Q-Learning (Tabular Boltzmann)</option>
                <option value="DQN">Deep Q-Network (Target Net + Replay)</option>
                <option value="Rule-Based">Rule-Based Heuristic (Baseline)</option>
                <option value="Random">Random Selector (Ablation)</option>
                <option value="Fixed-Difficulty">Fixed Difficulty (Level 3)</option>
              </select>
            </div>

            {/* Series Length */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Session Mode</label>
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-300 dark:border-white/10">
                {(['5', '10', 'infinite'] as SeriesMode[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setSeriesLength(mode)}
                    className={`py-1.5 text-xs font-semibold rounded-lg transition-all ${
                      seriesLength === mode
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {mode === 'infinite' ? '∞ Free' : `${mode} Items`}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsVoiceActive((prev) => !prev)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                  isVoiceActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-500 border-slate-200 dark:border-white/10 hover:text-slate-800'
                }`}
              >
                {isVoiceActive ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
                <span>{isVoiceActive ? 'Voice Tutor: Active' : 'Enable Voice Tutor'}</span>
              </button>
            </div>

            <button
              onClick={handleStartSession}
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <BrainCircuit className="w-4 h-4" />
              )}
              <span>{loading ? 'Initializing Agent...' : 'Launch Tutoring Session'}</span>
            </button>
          </div>
        </GlassCard>
      ) : null}

      {/* Series Completion Report */}
      {isSeriesCompleted && session && (
        <SeriesReport
          topic={selectedTopic}
          policy={selectedPolicy}
          initialMastery={initialMastery}
          finalMastery={session.mastery}
          history={questionHistory}
          onRestartSeries={handleStartSession}
          onChooseNewTopic={() => {
            setSession(null);
            setIsSeriesCompleted(false);
          }}
        />
      )}

      {/* Active Question Arena */}
      {session && !isSeriesCompleted && (
        <div className="space-y-6 animate-fadeIn">
          {/* Top Session Progress Bar & Controls */}
          <GlassCard className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4" glow="secondary">
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-lg bg-indigo-500/15 text-indigo-700 dark:text-cyan-400 border border-indigo-500/30">
                Item #{questionCount} {seriesLength !== 'infinite' && `of ${seriesLength}`}
              </span>
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {selectedTopic}
                </span>
                <p className="text-[11px] text-slate-500 font-mono">
                  Timer: {timerSeconds}s
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsCoachModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/20 to-cyan-500/20 hover:from-indigo-600/30 hover:to-cyan-500/30 text-indigo-700 dark:text-cyan-300 border border-indigo-500/30 text-xs font-bold transition-all hover:scale-105"
              >
                <Bot className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ask AI Coach</span>
              </button>

              <button
                onClick={() => setIsVoiceActive((prev) => !prev)}
                className={`p-2 rounded-xl border text-xs transition-all ${
                  isVoiceActive
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-400 border-slate-200 dark:border-white/10'
                }`}
                title={isVoiceActive ? 'Voice Muted' : 'Enable Voice'}
              >
                {isVoiceActive ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <PolicyBadge 
                difficulty={session.difficulty}
                policy={selectedPolicy} 
                direction={lastDirection}
                betaEstimate={betaEstimate}
              />
            </div>
          </GlassCard>

          {/* Stepper if in fixed series */}
          {seriesLength !== 'infinite' && (
            <SeriesStepper
              seriesLength={Number(seriesLength)}
              currentIndex={questionCount}
              history={questionHistory}
            />
          )}

          {/* Mastery Bar */}
          <MasteryBar
            mastery={session.mastery}
            oldMastery={oldMastery}
          />

          {/* Question Card */}
          <QuestionCard
            questionNumber={questionCount}
            question={session.question}
            choices={session.choices}
            selectedChoice={selectedChoice}
            onSelectChoice={setSelectedChoice}
            onSubmit={handleSubmit}
            onNext={handleNextQuestion}
            feedback={feedback}
            isSubmitting={isSubmitting}
            timerSeconds={timerSeconds}
          />

          {/* Hint Component */}
          {!feedback?.submitted && (
            <HintBox
              hint={session.hint}
              hintsUsed={hintsUsed}
              onUseHint={handleUseHint}
            />
          )}

          {/* Explainable AI Decision Core */}
          <XAiExplainer
            policy={selectedPolicy}
            mastery={session.mastery}
            oldMastery={oldMastery}
            difficulty={session.difficulty}
            betaEstimate={betaEstimate}
            qValues={qValues}
            zpdAlignment={zpdAlignment}
            isOpen={isXAiOpen}
            onToggle={() => setIsXAiOpen((prev) => !prev)}
          />
        </div>
      )}

      {/* Socratic AI Coach Assistant Modal */}
      <SocraticCoachModal
        topic={selectedTopic}
        mastery={session?.mastery || 0.5}
        isOpen={isCoachModalOpen}
        onClose={() => setIsCoachModalOpen(false)}
      />
    </div>
  );
};
