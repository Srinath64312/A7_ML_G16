import { useState, useCallback, useEffect } from 'react';

export interface GameState {
  xp: number;
  level: number;
  streak: number;
  highestStreak: number;
  questionsSolved: number;
  accuracyRate: number;
  correctCount: number;
}

const STORAGE_KEY = 'ai_tutor_game_state';

const INITIAL_STATE: GameState = {
  xp: 0,
  level: 1,
  streak: 0,
  highestStreak: 0,
  questionsSolved: 0,
  accuracyRate: 100,
  correctCount: 0,
};

export function useGameStore() {
  const [gameState, setGameState] = useState<GameState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_STATE;
    } catch {
      return INITIAL_STATE;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [gameState]);

  const addAnswerResult = useCallback((correct: boolean, difficulty: number, onLevelUp?: () => void) => {
    setGameState((prev) => {
      const newCorrectCount = prev.correctCount + (correct ? 1 : 0);
      const newTotal = prev.questionsSolved + 1;
      const newStreak = correct ? prev.streak + 1 : 0;
      const newHighestStreak = Math.max(prev.highestStreak, newStreak);

      const xpEarned = correct ? difficulty * 25 + newStreak * 5 : 5;
      const newXp = prev.xp + xpEarned;
      const newLevel = Math.floor(newXp / 150) + 1;

      if (newLevel > prev.level && onLevelUp) {
        setTimeout(onLevelUp, 200);
      }

      return {
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        highestStreak: newHighestStreak,
        questionsSolved: newTotal,
        correctCount: newCorrectCount,
        accuracyRate: Math.round((newCorrectCount / newTotal) * 100),
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setGameState(INITIAL_STATE);
  }, []);

  return {
    ...gameState,
    addAnswerResult,
    resetProgress,
  };
}
