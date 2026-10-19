import React from 'react';

export const Card = ({ className = '', ...props }) => (
  <div
    className={`rounded-3xl bg-white p-5 shadow-[0_5px_15px_rgba(40,50,45,0.07),0_1px_4px_rgba(40,50,45,0.03)] dark:bg-zinc-900 dark:shadow-none ${className}`}
    {...props}
  />
);
export const Bar = ({ value, color = 'bg-emerald-500' }) => (
  <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-zinc-700">
    <span className={`block h-full rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);
export const muted = 'text-slate-500 dark:text-slate-400';
export const field = 'h-11 rounded-2xl border-0 bg-slate-100 px-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:bg-zinc-800';
export const primary = 'h-14 w-full rounded-full bg-emerald-700 text-base font-bold text-white transition-colors hover:bg-emerald-800 disabled:opacity-40';
