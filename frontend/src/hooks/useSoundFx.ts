import { useState, useCallback, useRef } from 'react';

export function useSoundFx() {
  const [muted, setMuted] = useState<boolean>(() => {
    return localStorage.getItem('sound_muted') === 'true';
  });
  const audioCtxRef = useRef<AudioContext | null>(null);

  const getAudioContext = useCallback(() => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);

  const playTone = useCallback(
    (freq: number, type: OscillatorType, duration: number, delay = 0) => {
      if (muted) return;
      const ctx = getAudioContext();
      if (!ctx) return;

      setTimeout(() => {
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = type;
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          gain.gain.setValueAtTime(0.12, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + duration);
        } catch (e) {
          // ignore audio context errors
        }
      }, delay);
    },
    [muted, getAudioContext]
  );

  const playCorrect = useCallback(() => {
    playTone(523.25, 'sine', 0.12, 0);   // C5
    playTone(659.25, 'sine', 0.12, 80);  // E5
    playTone(783.99, 'sine', 0.22, 160); // G5
  }, [playTone]);

  const playWrong = useCallback(() => {
    playTone(220.0, 'triangle', 0.18, 0);
    playTone(180.0, 'triangle', 0.24, 120);
  }, [playTone]);

  const playLevelUp = useCallback(() => {
    playTone(440, 'triangle', 0.1, 0);
    playTone(554.37, 'triangle', 0.1, 90);
    playTone(659.25, 'triangle', 0.1, 180);
    playTone(880, 'sine', 0.35, 270);
  }, [playTone]);

  const playHint = useCallback(() => {
    playTone(800, 'sine', 0.08, 0);
  }, [playTone]);

  const toggleMute = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      localStorage.setItem('sound_muted', String(next));
      return next;
    });
  }, []);

  return {
    muted,
    toggleMute,
    playCorrect,
    playWrong,
    playLevelUp,
    playHint,
  };
}
