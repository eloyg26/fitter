import React, { useEffect, useRef, useState } from 'react';
import { Dumbbell, House, Moon, Plus, Sun, TrendingUp, Utensils, X } from 'lucide-react';
import { iso, todayRoutine } from './lib';
import { field, muted } from './ui';
import { useGym } from './store';
import { Diet, Home, Progress, Workout } from './screens';

const tabs = [['inicio', 'Inicio', House], ['entreno', 'Entreno', Dumbbell], ['progreso', 'Progreso', TrendingUp], ['dieta', 'Dieta', Utensils]];
const screens = { inicio: Home, entreno: Workout, progreso: Progress, dieta: Diet };
const btn = 'flex h-10 items-center justify-center rounded-full text-slate-800 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 dark:text-slate-200 dark:hover:bg-zinc-800';

export default function App() {
  const [tab, setTab] = useState('inicio');
  const { routines, profiles, activeProfileId, setActiveProfile, addProfile } = useGym();
  const [adding, setAdding] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileError, setProfileError] = useState('');
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

  const submitProfile = (event) => {
    event.preventDefault();
    const name = profileName.trim();
    if (!name) { setProfileError('Escribe un nombre para el perfil.'); return; }
    if (profiles.some((p) => p.name.toLowerCase() === name.toLowerCase())) { setProfileError('Ya existe un perfil con ese nombre.'); return; }
    addProfile(name);
    setAdding(false);
  };

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
  const handleTouchStart = (e) => {
    touchEndX.current = null;
    touchStartX.current = e.target.closest?.('[role="dialog"]') ? null : e.touches[0].clientX;
  };
  const handleTouchMove = (e) => { touchEndX.current = e.touches[0].clientX; };
  const handleTouchEnd = () => {
    const start = touchStartX.current, end = touchEndX.current;
    touchStartX.current = null;
    touchEndX.current = null;
    if (start === null || end === null) return;
    const diff = start - end;
    if (diff > 50) setDateOffset((o) => o + 1); // Deslizar izquierda -> Día siguiente
    if (diff < -50) setDateOffset((o) => o - 1); // Deslizar derecha -> Día anterior
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
        
        <nav aria-label="Secciones" className="mt-5 flex items-center gap-0.5 rounded-full bg-white p-1 shadow-[0_4px_20px_rgba(0,0,0,0.14)] dark:bg-zinc-900 dark:shadow-[0_4px_20px_rgba(0,0,0,0.6)]">
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
              className={`${btn} ${tab === key ? 'bg-zinc-950 px-3 text-white sm:gap-2 sm:px-4 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-slate-200' : 'size-10'}`}
            >
              <Icon size={18} />
              {tab === key && <span className="hidden text-sm font-semibold sm:inline">{label}</span>}
            </button>
          ))}
          <label htmlFor="active-profile" className="sr-only">Perfil activo</label>
          <select id="active-profile" value={activeProfileId} onChange={(e) => setActiveProfile(e.target.value)} className="h-10 min-w-0 flex-1 rounded-full bg-transparent px-2 text-sm font-medium outline-none focus:ring-2 focus:ring-slate-400 dark:text-slate-200">
            {profiles.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <button type="button" onClick={() => { setProfileName(''); setProfileError(''); setAdding(true); }} aria-label="Añadir perfil" title="Añadir perfil" className={`${btn} size-10 shrink-0`}><Plus size={18} /></button>
        </nav>
        {/* Pasamos la fecha activa a las pantallas */}
        <div className="mt-5"><Screen go={go} routine={active} activeDate={activeDate} /></div>
      </main>
      {adding && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[2px]" onMouseDown={(e) => { if (e.target === e.currentTarget) setAdding(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="new-profile-title" className="relative w-full max-w-md rounded-3xl bg-white p-6 shadow-xl dark:bg-zinc-900">
            <button type="button" onClick={() => setAdding(false)} aria-label="Cerrar" className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-zinc-800"><X size={17} /></button>
            <h2 id="new-profile-title" className="text-lg font-semibold">Crear perfil</h2>
            <p className={`mt-1 text-sm ${muted}`}>Cada perfil tiene sus propios entrenos, comidas y objetivos en este dispositivo. No hay sincronización ni contraseña.</p>
            <form onSubmit={submitProfile} className="mt-5 space-y-4">
              <div>
                <label htmlFor="profile-name" className="mb-1.5 block text-sm font-medium">Nombre</label>
                <input id="profile-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} maxLength={40} autoFocus required placeholder="Ej. Eloy" className={`${field} w-full`} />
              </div>
              {profileError && <p role="alert" className="rounded-2xl bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">{profileError}</p>}
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setAdding(false)} className="h-11 rounded-full bg-slate-100 px-5 text-sm font-semibold dark:bg-zinc-800">Cancelar</button>
                <button type="submit" className="h-11 rounded-full bg-emerald-700 px-5 text-sm font-bold text-white hover:bg-emerald-800">Crear perfil</button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}