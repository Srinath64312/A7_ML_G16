import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: 'none' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = 'none',
  ...props
}) => {
  const glowStyles = {
    none: 'border-slate-200/80 dark:border-white/10 shadow-slate-200/50 dark:shadow-black/40',
    primary: 'border-indigo-500/30 shadow-[0_4px_25px_rgba(99,102,241,0.12)] dark:shadow-[0_0_25px_rgba(99,102,241,0.18)]',
    secondary: 'border-cyan-500/30 shadow-[0_4px_25px_rgba(6,182,212,0.12)] dark:shadow-[0_0_25px_rgba(6,182,212,0.18)]',
    success: 'border-emerald-500/30 shadow-[0_4px_25px_rgba(16,185,129,0.12)] dark:shadow-[0_0_25px_rgba(16,185,129,0.18)]',
    warning: 'border-amber-500/30 shadow-[0_4px_25px_rgba(245,158,11,0.12)] dark:shadow-[0_0_25px_rgba(245,158,11,0.18)]',
    danger: 'border-rose-500/30 shadow-[0_4px_25px_rgba(244,63,94,0.12)] dark:shadow-[0_0_25px_rgba(244,63,94,0.18)]',
  };

  return (
    <div
      className={twMerge(
        clsx(
          'backdrop-blur-xl bg-white/80 dark:bg-[#0d121e]/85 rounded-2xl border transition-all duration-300 shadow-sm text-slate-800 dark:text-slate-100',
          glowStyles[glow],
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
};
