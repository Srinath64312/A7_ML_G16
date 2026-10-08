import React, { useState, useEffect } from 'react';
import { Header, ActiveTab } from './components/layout/Header';
import { HomeView } from './views/HomeView';
import { TutorView } from './views/TutorView';
import { DashboardView } from './views/DashboardView';
import { StudyView } from './views/StudyView';
import { FlashcardsView } from './views/FlashcardsView';
import { useGameStore } from './hooks/useGameStore';
import { useSoundFx } from './hooks/useSoundFx';
import { useTheme } from './hooks/useTheme';
import { useToast } from './hooks/useToast';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const gameStore = useGameStore();
  const soundFx = useSoundFx();
  const { toggleTheme } = useTheme();
  const { showToast } = useToast();

  // Global hotkeys for Theme (T) and Mute (M)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 't' || e.key === 'T') {
        toggleTheme();
      } else if (e.key === 'm' || e.key === 'M') {
        soundFx.toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleTheme, soundFx]);

  const handleCorrectAnswer = (difficulty: number) => {
    gameStore.addAnswerResult(true, difficulty, () => {
      soundFx.playLevelUp();
      showToast({
        type: 'success',
        title: '🎉 LEVEL UP!',
        message: `Congratulations! You advanced to Level ${gameStore.level + 1}!`,
        duration: 4000,
      });
    });
  };

  const handleWrongAnswer = (difficulty: number) => {
    gameStore.addAnswerResult(false, difficulty);
  };

  const handleSelectTopicForTutor = (topic: string) => {
    setActiveTab('tutor');
    showToast({
      type: 'info',
      title: 'Topic Selected',
      message: `Ready for interactive session on ${topic}`,
      duration: 2500,
    });
  };

  return (
    <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        xp={gameStore.xp}
        level={gameStore.level}
        streak={gameStore.streak}
        muted={soundFx.muted}
        onToggleMute={soundFx.toggleMute}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={(tab) => setActiveTab(tab)}
            xp={gameStore.xp}
            level={gameStore.level}
            streak={gameStore.streak}
          />
        )}

        {activeTab === 'tutor' && (
          <TutorView
            onCorrectAnswer={handleCorrectAnswer}
            onWrongAnswer={handleWrongAnswer}
            playCorrectSound={soundFx.playCorrect}
            playWrongSound={soundFx.playWrong}
            playHintSound={soundFx.playHint}
          />
        )}

        {activeTab === 'dashboard' && <DashboardView />}

        {activeTab === 'study' && (
          <StudyView onSelectTopicForTutor={handleSelectTopicForTutor} />
        )}

        {activeTab === 'flashcards' && (
          <FlashcardsView
            onCardReviewed={() => {
              gameStore.addAnswerResult(true, 1, soundFx.playLevelUp);
              soundFx.playCorrect();
            }}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-white/5 py-5 text-center text-xs text-slate-500 dark:text-slate-500 font-mono transition-colors">
        <p>
          Adaptive AI Tutoring System • Reinforcement Learning &amp; Bayesian Knowledge Tracing • Built with React, TypeScript &amp; Tailwind CSS
        </p>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return <AppContent />;
};

export default App;
