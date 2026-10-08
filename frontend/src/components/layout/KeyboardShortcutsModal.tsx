import React from 'react';
import { GlassCard } from './GlassCard';
import { X, Command, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      category: 'AI Tutor Mode',
      items: [
        { keys: ['A', 'B', 'C', 'D'], desc: 'Select multiple choice option' },
        { keys: ['1', '2', '3', '4'], desc: 'Alternative key selection' },
        { keys: ['Enter'], desc: 'Submit answer or proceed to next question' },
        { keys: ['H'], desc: 'Toggle AI cognitive scaffolding hint' },
      ],
    },
    {
      category: 'Spaced Repetition Flashcards',
      items: [
        { keys: ['Space', 'F'], desc: 'Flip flashcard between question and answer' },
        { keys: ['→'], desc: 'Next flashcard' },
        { keys: ['←'], desc: 'Previous flashcard' },
        { keys: ['1', '2', '3'], desc: 'Rate difficulty (Hard / Good / Easy)' },
      ],
    },
    {
      category: 'Global Navigation',
      items: [
        { keys: ['T'], desc: 'Quick-switch Dark / Light theme' },
        { keys: ['M'], desc: 'Toggle audio sound effects' },
        { keys: ['Esc'], desc: 'Close dialogs and modals' },
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg">
        <GlassCard className="p-6 md:p-8 space-y-6 max-h-[85vh] overflow-y-auto" glow="primary">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Keyboard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Keyboard Shortcuts
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Power-user hotkeys for swift navigation & learning
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            {shortcuts.map((group) => (
              <div key={group.category} className="space-y-2.5">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
                  {group.category}
                </h4>
                <div className="space-y-2">
                  {group.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-white/5 text-xs"
                    >
                      <span className="text-slate-700 dark:text-slate-300">{item.desc}</span>
                      <div className="flex items-center gap-1 font-mono">
                        {item.keys.map((k) => (
                          <kbd
                            key={k}
                            className="px-2 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 shadow-sm font-semibold text-[11px]"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-white/10 text-center">
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
            >
              Got it, continue learning
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
