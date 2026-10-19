import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Dumbbell, House, Moon, Sun, TrendingUp, Utensils } from 'lucide-react';
import { iso, todayRoutine } from './lib';
import { muted } from './ui';
import { useGym } from './store';
import { Diet, Home, Progress, Workout } from './screens';

const tabs = [['inicio', 'Inicio', House], ['entreno', 'Entreno', Dumbbell], ['progreso', 'Progreso', TrendingUp], ['dieta', 'Dieta', Utensils]];
const screens = { inicio: Home, entreno: Workout, progreso: Progress, dieta: Diet };
const btn = 'flex h-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-200 dark:hover:bg-zinc-800';

export default function App() {
  const [tab, setTab] = useState('inicio');
  const { routines } = useGym();
  const [routine, setRoutine] = useState(() => todayRoutine(routines));
  const [dark, setDark] = useState(() => localStorage.getItem('gym-theme') !== 'light');
  
  // Estado para controlar el día actual (0 = hoy, -1 = ayer, 1 = mañana, etc.)
  const [dateOffset, setDateOffset] = useState(0);
  
  // Referencias para el gesto de deslizar (swipe)
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('gym-theme', dark ? 'dark' : 'light');
  }, [dark]);

  const go = (next, r) => { if (r) setRoutine(r); setTab(next); };
  const Screen = screens[tab];
  const active = routines[routine] ? routine : Object.keys(routines)[0];

  // Cálculo de la fecha activa
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + dateOffset);
  const activeDate = iso(baseDate);
  
  // Formateo del título del día
  let dayLabel = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'short' }).format(baseDate);
  if (dateOffset === 0) dayLabel = 'Hoy, ' + dayLabel;
  else if (dateOffset === -1) dayLabel = 'Ayer, ' + dayLabel;
  else if (dateOffset === 1) dayLabel = 'Mañana, ' + dayLabel;

  // Gestos táctiles
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchMove = (e) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) setDateOffset((o) => o + 1); // Deslizar izquierda -> Día siguiente
    if (diff < -50) setDateOffset((o) => o - 1); // Deslizar derecha -> Día anterior
    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <div 
      className="min-h-screen overflow-x-hidden bg-zinc-50 font-sans text-zinc-950 transition-colors dark:bg-black dark:text-white"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <main className="mx-auto max-w-md px-5 pb-12 pt-8">
        <div className="flex items-center justify-between">
          <div>
            <p className={`text-sm font-medium ${muted}`}>{dateOffset === 0 ? 'Tu resumen de entrenos' : 'Historial de actividad'}</p>
            <div className="mt-1 flex items-center gap-2">
              <h1 className="min-w-[180px] text-center text-2xl font-extrabold capitalize tracking-tight">{dayLabel}</h1>
            </div>
          </div>
        </div>
        
        <nav aria-label="Secciones" className="mt-5 flex items-center justify-between rounded-full bg-white p-1 shadow-[0_4px_20px_rgba(0,0,0,0.14)] dark:bg-zinc-900 dark:shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
          <button type="button" onClick={() => setDark((d) => !d)} aria-label={dark ? 'Activar modo claro' : 'Activar modo oscuro'} className={`${btn} size-10`}>
            {dark ? <Moon size={18} /> : <Sun size={18} />}
          </button>
          {tabs.map(([key, label, Icon]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-label={label}
              aria-current={tab === key ? 'page' : undefined}
              className={`${btn} ${tab === key ? 'gap-2 bg-zinc-950 px-4 text-white hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-slate-200' : 'size-10'}`}
            >
              <Icon size={18} />
              {tab === key && <span className="text-sm font-semibold">{label}</span>}
            </button>
          ))}
        </nav>
        {/* Pasamos la fecha activa a las pantallas */}
        <div className="mt-5"><Screen go={go} routine={active} activeDate={activeDate} /></div>
      </main>
    </div>
  );
}