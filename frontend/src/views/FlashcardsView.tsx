import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/layout/GlassCard';
import { 
  RotateCw, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Sparkles,
  Plus,
  Filter,
  X,
  Keyboard,
  Check,
  Flame
} from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  category: string;
  difficulty: string;
}

const INITIAL_FLASHCARDS: Flashcard[] = [
  {
    id: 1,
    category: 'Bayesian Knowledge Tracing',
    difficulty: 'Intermediate',
    question: 'In BKT, what does the parameter P(T) represent?',
    answer: 'P(T) or Transit Probability represents the probability of transitioning from the unlearned state to the learned state after a learning opportunity.',
  },
  {
    id: 2,
    category: 'Item Response Theory',
    difficulty: 'Advanced',
    question: 'In the 1-Parameter Logistic (1-PL / Rasch) IRT model, what does the parameter β represent?',
    answer: 'Beta (β) represents item difficulty. When student latent ability θ equals β, the probability of a correct response is exactly 50%.',
  },
  {
    id: 3,
    category: 'Reinforcement Learning',
    difficulty: 'Intermediate',
    question: 'Why is Experience Replay crucial in Deep Q-Networks (DQN)?',
    answer: 'Experience Replay breaks temporal correlations between consecutive training transitions and provides i.i.d. mini-batches for stable gradient descent.',
  },
  {
    id: 4,
    category: 'Deep Knowledge Tracing',
    difficulty: 'Advanced',
    question: 'How are student interactions encoded at each timestep in DKT?',
    answer: 'Each interaction is encoded as a one-hot vector of length 2 × num_skills, representing the tuple (skill_id, correctness).',
  },
  {
    id: 5,
    category: 'Cognitive Science',
    difficulty: 'Foundational',
    question: 'What is the Zone of Proximal Development (ZPD)?',
    answer: 'The optimal learning space between what a learner can do without assistance and what they can achieve with guidance and scaffolding.',
  },
  {
    id: 6,
    category: 'Bayesian Knowledge Tracing',
    difficulty: 'Foundational',
    question: 'What do P(G) and P(S) represent in BKT?',
    answer: 'P(G) is Guess probability (correct answer despite unlearned state). P(S) is Slip probability (incorrect answer despite learned state).',
  },
  {
    id: 7,
    category: 'Reinforcement Learning',
    difficulty: 'Advanced',
    question: 'How does the Reward function penalize mismatch with the ZPD target?',
    answer: 'Reward = R_mastery + R_engagement - α * |P(correct) - Target_ZPD|, ensuring tasks are neither frustratingly difficult nor trivially easy.',
  }
];

const STORAGE_KEY = 'ai_tutor_custom_flashcards';

interface FlashcardsViewProps {
  onCardReviewed: () => void;
}

export const FlashcardsView: React.FC<FlashcardsViewProps> = ({ onCardReviewed }) => {
  const { showToast } = useToast();
  const [cards, setCards] = useState<Flashcard[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_FLASHCARDS;
    } catch {
      return INITIAL_FLASHCARDS;
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New card form state
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newCategory, setNewCategory] = useState('Bayesian Knowledge Tracing');
  const [newDifficulty, setNewDifficulty] = useState('Intermediate');

  const categories = ['All', ...Array.from(new Set(cards.map((c) => c.category)))];
  const filteredCards = selectedCategory === 'All' 
    ? cards 
    : cards.filter((c) => c.category === selectedCategory);

  const activeIndex = currentIndex < filteredCards.length ? currentIndex : 0;
  const currentCard = filteredCards[activeIndex];

  // Save custom cards
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
    } catch (e) {
      console.warn('Could not save flashcards to storage', e);
    }
  }, [cards]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === ' ' || e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (['1', '2', '3'].includes(e.key)) {
        handleRate(e.key === '1' ? 'Hard' : e.key === '2' ? 'Good' : 'Easy');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredCards.length]);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % (filteredCards.length || 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % (filteredCards.length || 1));
  };

  const handleRate = (rating: string) => {
    onCardReviewed();
    showToast({
      type: 'success',
      title: `Card Rated: ${rating}`,
      message: `Spaced repetition interval calibrated (+25 XP).`,
      duration: 1800,
    });
    handleNext();
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newCard: Flashcard = {
      id: Date.now(),
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: newCategory,
      difficulty: newDifficulty,
    };

    setCards((prev) => [newCard, ...prev]);
    setShowAddModal(false);
    setNewQuestion('');
    setNewAnswer('');
    setSelectedCategory('All');
    setCurrentIndex(0);

    showToast({
      type: 'success',
      title: 'Flashcard Created',
      message: 'Custom study flashcard added to your deck.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner */}
      <GlassCard className="p-6 md:p-8 space-y-4" glow="secondary">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-500" />
              <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                Adaptive Spaced Repetition Flashcards
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Active recall for cognitive models, IRT mathematics, reinforcement learning, and neural knowledge tracing.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 transition-all hover:scale-105"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Card</span>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-t border-slate-200 dark:border-white/10 pt-3">
          <Filter className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mr-1" />
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentIndex(0);
                setIsFlipped(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Main Flashcard Card */}
      {currentCard ? (
        <div className="space-y-4">
          <div
            onClick={() => setIsFlipped(!isFlipped)}
            className="min-h-[260px] md:min-h-[300px] cursor-pointer perspective-1000"
          >
            <GlassCard
              className="p-8 md:p-10 h-full flex flex-col justify-between space-y-6 hover:border-indigo-500/50 transition-all duration-300 shadow-xl"
              glow={isFlipped ? 'secondary' : 'primary'}
            >
              {/* Card Meta Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-semibold uppercase px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/20">
                    {currentCard.category}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {currentCard.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                  <span>Card {activeIndex + 1} of {filteredCards.length}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 space-y-3">
                <span className="text-[11px] uppercase tracking-widest font-mono font-bold text-cyan-600 dark:text-cyan-400">
                  {isFlipped ? '— RECALL ANSWER —' : '— ACTIVE PROMPT —'}
                </span>
                <p className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 leading-relaxed font-sans max-w-2xl">
                  {isFlipped ? currentCard.answer : currentCard.question}
                </p>
              </div>

              {/* Card Footer prompt */}
              <div className="flex items-center justify-between border-t border-slate-200 dark:border-white/10 pt-4 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1.5">
                  <RotateCw className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Click or press <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono">Space</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[10px] font-mono">F</kbd> to flip</span>
                </span>
                <span className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                  {isFlipped ? 'Answer Revealed' : 'Question Side'}
                </span>
              </div>
            </GlassCard>
          </div>

          {/* Controls & Rating Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Prev / Next */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handlePrev}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Prev</span>
              </button>
              <button
                onClick={handleNext}
                className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all"
              >
                <span>Next</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Spaced Repetition Ratings */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleRate('Hard')}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-700 dark:text-rose-300 border border-rose-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                title="Review soon (Press 1)"
              >
                <span>Hard</span>
                <kbd className="text-[10px] font-mono px-1 rounded bg-rose-500/20">1</kbd>
              </button>
              <button
                onClick={() => handleRate('Good')}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                title="Normal interval (Press 2)"
              >
                <span>Good</span>
                <kbd className="text-[10px] font-mono px-1 rounded bg-cyan-500/20">2</kbd>
              </button>
              <button
                onClick={() => handleRate('Easy')}
                className="flex-1 sm:flex-none px-3.5 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center justify-center gap-1"
                title="Mastered concept (Press 3)"
              >
                <span>Easy</span>
                <kbd className="text-[10px] font-mono px-1 rounded bg-emerald-500/20">3</kbd>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <GlassCard className="p-8 text-center text-slate-500 space-y-3">
          <p className="text-sm">No flashcards found in this category.</p>
          <button
            onClick={() => setSelectedCategory('All')}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
          >
            Reset filter to All
          </button>
        </GlassCard>
      )}

      {/* Add Custom Flashcard Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg">
            <GlassCard className="p-6 md:p-8 space-y-5" glow="primary">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-indigo-500" />
                  <span>Create Custom Flashcard</span>
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddCard} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Prompt / Question</label>
                  <textarea
                    required
                    rows={2}
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="e.g. What is the mathematical formulation of 1-PL IRT?"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Explanation / Answer</label>
                  <textarea
                    required
                    rows={3}
                    value={newAnswer}
                    onChange={(e) => setNewAnswer(e.target.value)}
                    placeholder="e.g. P(θ) = 1 / (1 + exp(-(θ - β)))"
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100"
                    >
                      <option value="Bayesian Knowledge Tracing">Bayesian Knowledge Tracing</option>
                      <option value="Item Response Theory">Item Response Theory</option>
                      <option value="Reinforcement Learning">Reinforcement Learning</option>
                      <option value="Deep Knowledge Tracing">Deep Knowledge Tracing</option>
                      <option value="Cognitive Science">Cognitive Science</option>
                      <option value="Computer Science">Computer Science</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Difficulty</label>
                    <select
                      value={newDifficulty}
                      onChange={(e) => setNewDifficulty(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-white/10 rounded-xl p-2.5 text-xs text-slate-900 dark:text-slate-100"
                    >
                      <option value="Foundational">Foundational</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md"
                  >
                    Save Flashcard
                  </button>
                </div>
              </form>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
