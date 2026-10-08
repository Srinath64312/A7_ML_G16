import React, { useState } from 'react';
import { 
  GraduationCap, 
  Flame, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Sparkles,
  Layers,
  LineChart,
  BookOpen,
  CreditCard,
  Sun,
  Moon,
  Laptop,
  Keyboard,
  Menu,
  X
} from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import { useToast } from '../../hooks/useToast';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

export type ActiveTab = 'home' | 'tutor' | 'dashboard' | 'study' | 'flashcards';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  xp: number;
  level: number;
  streak: number;
  muted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  xp,
  level,
  streak,
  muted,
  onToggleMute,
}) => {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [themeDropdownOpen, setThemeDropdownOpen] = useState(false);

  const xpInCurrentLevel = xp % 150;
  const xpPercentage = Math.min(100, Math.round((xpInCurrentLevel / 150) * 100));

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: 'Home', icon: <Layers className="w-4 h-4" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Research & RL Lab', icon: <LineChart className="w-4 h-4" /> },
    { id: 'study', label: 'Curriculum Tracks', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'flashcards', label: 'Spaced Flashcards', icon: <CreditCard className="w-4 h-4" /> },
  ];

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    setThemeDropdownOpen(false);
    showToast({
      type: 'info',
      title: `Theme: ${newTheme.toUpperCase()}`,
      message: `Interface appearance set to ${newTheme} mode.`,
      duration: 2000,
    });
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-[#07090e]/80 backdrop-blur-xl px-4 lg:px-8 py-3 transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand */}
          <div 
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-900 dark:bg-[#0d121e] rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-cyan-400 dark:via-indigo-300 dark:to-indigo-500 bg-clip-text text-transparent group-hover:opacity-90">
                  Adaptive AI Tutor
                </h1>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20 dark:border-indigo-500/30">
                  RL + BKT
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                LLM-Guided Cognitive Sequencing Engine
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/90 p-1.5 rounded-xl border border-slate-200/80 dark:border-white/5 shadow-inner">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md shadow-indigo-500/25'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Gamification & Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Streak */}
            <div className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-300 text-xs font-semibold">
              <Flame className="w-4 h-4 text-amber-500 fill-amber-500/40 animate-pulse" />
              <span>{streak} <span className="hidden sm:inline">Streak</span></span>
            </div>

            {/* Level & XP */}
            <div className="hidden sm:flex flex-col gap-1 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 min-w-[105px]">
              <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                <span className="flex items-center gap-1">
                  <Trophy className="w-3 h-3 text-indigo-500 dark:text-indigo-400" />
                  Lvl {level}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-mono text-[10px]">{xpInCurrentLevel}/150 XP</span>
              </div>
              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-600 rounded-full transition-all duration-500"
                  style={{ width: `${xpPercentage}%` }}
                />
              </div>
            </div>

            {/* Keyboard Shortcuts Trigger */}
            <button
              onClick={() => setShowShortcuts(true)}
              className="hidden md:flex p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              title="Keyboard Shortcuts (Press ? for help)"
            >
              <Keyboard className="w-4 h-4" />
            </button>

            {/* Theme Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setThemeDropdownOpen((prev) => !prev)}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-300 transition-colors flex items-center gap-1"
                title={`Theme: ${theme}`}
              >
                {resolvedTheme === 'dark' ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
              </button>

              {themeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-36 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl z-50 animate-fadeIn text-xs">
                  <button
                    onClick={() => handleThemeChange('light')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                      theme === 'light'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Light Mode</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('dark')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                      theme === 'dark'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Dark Mode</span>
                  </button>
                  <button
                    onClick={() => handleThemeChange('system')}
                    className={`w-full flex items-center gap-2 px-3 py-2 text-left transition-colors ${
                      theme === 'system'
                        ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-bold'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5 text-cyan-500" />
                    <span>System Sync</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sound Toggle */}
            <button
              onClick={() => {
                onToggleMute();
                showToast({
                  type: 'info',
                  title: muted ? 'Audio Unmuted' : 'Audio Muted',
                  duration: 1500,
                });
              }}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-slate-700/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
              title={muted ? 'Unmute audio effects' : 'Mute audio effects'}
            >
              {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-cyan-500" />}
            </button>

            {/* Mobile Navigation Toggle */}
            <button
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden pt-4 pb-2 border-t border-slate-200 dark:border-white/10 mt-3 space-y-2 animate-fadeIn">
            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => {
                  setShowShortcuts(true);
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 font-semibold p-2"
              >
                <Keyboard className="w-4 h-4" />
                <span>Shortcuts Guide</span>
              </button>
              <div className="flex items-center gap-1 text-[11px] font-mono text-slate-500">
                <span>Lvl {level}</span> • <span>{xpInCurrentLevel}/150 XP</span>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Global Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
      />
    </>
  );
};
