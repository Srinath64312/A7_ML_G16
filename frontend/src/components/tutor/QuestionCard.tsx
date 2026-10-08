import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, ArrowRight, Clock, Zap, Sparkles } from 'lucide-react';
import { GlassCard } from '../layout/GlassCard';

interface QuestionCardProps {
  questionNumber: number;
  question: string;
  choices: string[];
  selectedChoice: string | null;
  onSelectChoice: (choice: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  feedback: {
    submitted: boolean;
    correct: boolean;
    correctAnswer: string;
    explanation: string;
  } | null;
  onNext: () => void;
  timerSeconds?: number;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionNumber,
  question,
  choices,
  selectedChoice,
  onSelectChoice,
  onSubmit,
  isSubmitting,
  feedback,
  onNext,
  timerSeconds = 0,
}) => {
  // Global keyboard listener for choices and Enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (!feedback?.submitted && !isSubmitting) {
        const key = e.key.toUpperCase();
        const numKey = parseInt(e.key, 10);

        if (['A', 'B', 'C', 'D'].includes(key)) {
          const index = key.charCodeAt(0) - 65;
          if (choices[index]) {
            onSelectChoice(choices[index]);
          }
        } else if (numKey >= 1 && numKey <= choices.length) {
          onSelectChoice(choices[numKey - 1]);
        } else if (e.key === 'Enter' && selectedChoice) {
          e.preventDefault();
          onSubmit();
        }
      } else if (feedback?.submitted && e.key === 'Enter') {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [choices, selectedChoice, feedback, isSubmitting, onSelectChoice, onSubmit, onNext]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const isSpeedBonus = timerSeconds < 25;

  return (
    <GlassCard className="p-6 md:p-8 space-y-6" glow="primary">
      {/* Header / Question Index & Live Timer */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 dark:border-indigo-500/30 flex items-center justify-center text-xs font-mono font-bold text-indigo-600 dark:text-indigo-300">
            #{questionNumber}
          </div>
          <span className="text-xs uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            Interactive Problem Evaluation
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Live Timer */}
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-500" />
            <span>{formatTime(timerSeconds)}</span>
          </div>

          {isSpeedBonus && !feedback?.submitted && (
            <span className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-[10px] font-bold">
              <Zap className="w-3 h-3 text-amber-500" /> Speed Bonus Active
            </span>
          )}
        </div>
      </div>

      {/* Question Prompt */}
      <div className="space-y-2">
        <p className="text-base md:text-lg font-medium text-slate-900 dark:text-slate-100 leading-relaxed">
          {question}
        </p>
      </div>

      {/* Multiple-choice grid */}
      <div className="grid grid-cols-1 gap-3">
        {choices.map((choice, idx) => {
          const letter = String.fromCharCode(65 + idx);
          const isSelected = selectedChoice === choice;
          
          let buttonStyle = 'bg-slate-50 dark:bg-slate-900/70 border-slate-200 dark:border-white/10 hover:border-indigo-500/40 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200';

          if (feedback?.submitted) {
            if (choice === feedback.correctAnswer) {
              buttonStyle = 'bg-emerald-500/15 dark:bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-semibold shadow-[0_0_15px_rgba(16,185,129,0.2)]';
            } else if (isSelected && !feedback.correct) {
              buttonStyle = 'bg-rose-500/15 dark:bg-rose-500/20 border-rose-500 text-rose-800 dark:text-rose-200 font-semibold shadow-[0_0_15px_rgba(244,63,94,0.2)]';
            } else {
              buttonStyle = 'bg-slate-50/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-white/5 text-slate-400 dark:text-slate-500 opacity-60';
            }
          } else if (isSelected) {
            buttonStyle = 'bg-indigo-50 dark:bg-indigo-600/30 border-indigo-500 text-indigo-900 dark:text-indigo-100 font-semibold shadow-[0_0_15px_rgba(99,102,241,0.25)] ring-1 ring-indigo-500';
          }

          return (
            <button
              key={idx}
              disabled={feedback?.submitted || isSubmitting}
              onClick={() => onSelectChoice(choice)}
              className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all duration-200 ${buttonStyle} ${
                !feedback?.submitted && !isSubmitting ? 'hover:translate-x-1 cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold border transition-colors ${
                  isSelected || (feedback?.submitted && choice === feedback.correctAnswer)
                    ? 'bg-indigo-600 border-indigo-500 text-white'
                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-white/10 text-slate-600 dark:text-slate-400'
                }`}
              >
                {letter}
              </div>
              <span className="flex-1 text-sm font-sans">{choice}</span>
              
              {!feedback?.submitted && (
                <kbd className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                  {letter}
                </kbd>
              )}

              {feedback?.submitted && choice === feedback.correctAnswer && (
                <CheckCircle2 className="w-5 h-5 text-emerald-500 animate-bounce" />
              )}
              {feedback?.submitted && isSelected && !feedback.correct && (
                <XCircle className="w-5 h-5 text-rose-500" />
              )}
            </button>
          );
        })}
      </div>

      {/* Action / Next Area */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
          {!feedback?.submitted ? (
            <span>Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">A–D</kbd> to choose &amp; <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">Enter</kbd> to submit</span>
          ) : (
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono">Enter</kbd> to advance</span>
          )}
        </div>

        {!feedback?.submitted ? (
          <button
            disabled={!selectedChoice || isSubmitting}
            onClick={onSubmit}
            className={`w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-xs transition-all duration-200 flex items-center justify-center gap-2 ${
              selectedChoice && !isSubmitting
                ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-lg shadow-indigo-500/25 hover:scale-105 active:scale-95'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
            }`}
          >
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Answer'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onNext}
            className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Next Question</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Immediate Pedagogical Explanation Feedback */}
      {feedback?.submitted && (
        <div
          className={`p-4 rounded-xl border animate-fadeIn space-y-2 ${
            feedback.correct
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/30 text-emerald-900 dark:text-emerald-100'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-500/30 text-rose-900 dark:text-rose-100'
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-xs">
            {feedback.correct ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Correct Response! Reinforcing Latent Skill Knowledge.
              </span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1.5">
                <XCircle className="w-4 h-4" /> Incorrect. BKT state updated &amp; RL agent recalibrating.
              </span>
            )}
          </div>
          <p className="text-xs leading-relaxed opacity-95">
            <strong>Pedagogical Explanation:</strong> {feedback.explanation}
          </p>
        </div>
      )}
    </GlassCard>
  );
};
