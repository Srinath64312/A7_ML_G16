import React, { useState } from 'react';
import { Sparkles, MessageSquare, Lightbulb, BookOpen, Send, X, Bot, Loader2 } from 'lucide-react';
import { askAiCoach } from '../../services/api';
import { SocraticCoachResponse } from '../../types/api';

interface SocraticCoachModalProps {
  topic: string;
  mastery: number;
  isOpen: boolean;
  onClose: () => void;
}

export const SocraticCoachModal: React.FC<SocraticCoachModalProps> = ({
  topic,
  mastery,
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<SocraticCoachResponse | null>(null);

  if (!isOpen) return null;

  const handleAsk = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim() && !response) {
      setQuery(`How can I understand ${topic} intuitively?`);
    }
    setLoading(true);
    try {
      const activeQuery = query.trim() || `How can I understand ${topic} intuitively?`;
      const res = await askAiCoach(activeQuery, topic, mastery);
      setResponse(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-cyan-50/30 to-transparent dark:from-indigo-950/40 dark:via-cyan-950/20 dark:to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-md flex items-center justify-center">
              <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-cyan-400">
                <Bot className="w-5 h-5" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Socratic AI Coach
                </h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 font-semibold">
                  LLM Pedagogical Assistant
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Topic: <strong className="text-slate-800 dark:text-slate-200">{topic}</strong> • Current Mastery: {(mastery * 100).toFixed(0)}%
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Quick Prompts */}
          {!response && !loading && (
            <div className="space-y-3">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Suggested Socratic Questions:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {[
                  `What is the most intuitive analogy for ${topic}?`,
                  `What are common pitfalls students make in ${topic}?`,
                  `How does this connect to real-world software & math?`,
                  `Give me a 30-second mental model to remember this.`,
                ].map((promptText, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setQuery(promptText);
                      setLoading(true);
                      askAiCoach(promptText, topic, mastery)
                        .then(setResponse)
                        .finally(() => setLoading(false));
                    }}
                    className="p-3 rounded-xl text-left text-xs bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/5 hover:border-indigo-500/40 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 text-slate-700 dark:text-slate-300 transition-all flex items-start gap-2"
                  >
                    <Lightbulb className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{promptText}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
              <p className="text-xs font-mono">Synthesizing Socratic breakdown &amp; intuitive analogies...</p>
            </div>
          )}

          {/* AI Response Card */}
          {response && !loading && (
            <div className="space-y-4 animate-fadeIn">
              {/* Analogy Box */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-transparent border border-cyan-500/20 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 dark:text-cyan-300">
                  <Lightbulb className="w-4 h-4 text-amber-400" />
                  Intuitive Mental Model
                </div>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 leading-relaxed italic">
                  "{response.socratic_advice.intuitive_analogy}"
                </p>
              </div>

              {/* Step by Step Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                  <BookOpen className="w-4 h-4 text-indigo-500" />
                  Systematic Conceptual Steps
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {response.socratic_advice.step_by_step.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pedagogical Tip */}
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 space-y-1">
                <span className="font-semibold">💡 Personalized Pedagogical Advice:</span>
                <p>{response.socratic_advice.pedagogical_tip}</p>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleAsk}
          className="p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/60 flex items-center gap-2"
        >
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Ask anything about ${topic}...`}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 disabled:opacity-50 flex items-center gap-1.5 transition-all"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Ask</span>
          </button>
        </form>
      </div>
    </div>
  );
};
