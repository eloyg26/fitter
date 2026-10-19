import React, { useEffect, useState } from 'react';
import { Check, Pencil, Plus, Trash2, Utensils, X } from 'lucide-react';
import { useGym } from './store';
import { MUSCLES, calcStreak, e1rm, fmt, iso, weekSets, weekVol } from './lib';
import { Bar, Card, field, muted, primary } from './ui';

const good = 'text-emerald-600 dark:text-emerald-400';
const bad = 'text-rose-600 dark:text-rose-400';

function RoutineEditor({ routine, onSelect }) {
  const { routines, saveRoutines } = useGym();
  const [name, setName] = useState(routine);
  const [exName, setExName] = useState('');
  const [muscle, setMuscle] = useState(MUSCLES[0]);
  const [targetReps, setTargetReps] = useState('');
  const [defaultWeight, setDefaultWeight] = useState('');

  useEffect(() => setName(routine), [routine]);
  const list = routines[routine] || [];
  const update = (next) => saveRoutines({ ...routines, [routine]: next });
  
  const addExercise = (event) => {
    event.preventDefault();
    if (!exName.trim()) return;
    update([...list, { 
      name: exName.trim(), 
      muscle,
      targetReps: targetReps.trim(),
      defaultWeight: defaultWeight.trim() !== '' ? Number(defaultWeight.replace(',', '.')) : ''
    }]);
    setExName(''); setTargetReps(''); setDefaultWeight('');
  };
  
  const rename = () => {
    const next = name.trim();
    if (!next || next === routine || routines[next]) { setName(routine); return; }
    saveRoutines(Object.fromEntries(Object.entries(routines).map(([k, v]) => [k === routine ? next : k, v])));
    onSelect(next);
  };
  
  const remove = () => {
    const rest = { ...routines };
    delete rest[routine];
    saveRoutines(rest);
    onSelect(Object.keys(rest)[0]);
  };
  
  return (
    <div className="mt-4 space-y-3">
      <input aria-label="Nombre de la rutina" value={name} maxLength={30} onChange={(e) => setName(e.target.value)} onBlur={rename} className={`${field} w-full font-bold`} />
      <ul className="space-y-1">
        {list.map((e, i) => (
          <li key={i} className="flex items-center justify-between text-sm">
            <span>
              {e.name} <span className={muted}>· {e.muscle}</span>
              {e.targetReps && <span className="ml-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">[{e.targetReps}]</span>}
            </span>
            <button type="button" onClick={() => update(list.filter((_, j) => j !== i))} aria-label={`Quitar ${e.name}`} className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"><X size={15} /></button>
          </li>
        ))}
      </ul>
      <form onSubmit={addExercise} className="flex flex-col gap-2">
        <div className="flex gap-2">
          <input aria-label="Nuevo ejercicio" placeholder="Nuevo ejercicio" value={exName} onChange={(e) => setExName(e.target.value)} className={`${field} w-full min-w-0`} />
          <select aria-label="Músculo" value={muscle} onChange={(e) => setMuscle(e.target.value)} className={`${field} shrink-0 px-2`}>{MUSCLES.map((m) => <option key={m}>{m}</option>)}</select>
        </div>
        <div className="flex gap-2">
          <input aria-label="Baremo" placeholder="Reps (ej: 8-12)" value={targetReps} onChange={(e) => setTargetReps(e.target.value)} className={`${field} w-full min-w-0`} />
          <input inputMode="decimal" aria-label="Peso base" placeholder="Peso base (kg)" value={defaultWeight} onChange={(e) => setDefaultWeight(e.target.value)} className={`${field} w-full min-w-0`} />
          <button type="submit" aria-label="Añadir ejercicio" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white"><Plus size={18} /></button>
        </div>
      </form>
      <button type="button" onClick={remove} disabled={Object.keys(routines).length < 2} className={`inline-flex items-center gap-1 text-sm font-semibold disabled:opacity-40 ${bad}`}><Trash2 size={15} />Eliminar rutina</button>
    </div>
  );
}

export function Home({ go, routine }) {
  const { sessions, routines, saveRoutines, activeProfileId } = useGym();
  const [editing, setEditing] = useState(false);
  const mySessions = sessions.filter(s => !s.profileId || s.profileId === activeProfileId);
  const week = weekVol(mySessions, 0), prev = weekVol(mySessions, 1);
  const delta = prev ? ((week - prev) / prev) * 100 : null;
  const exercises = routines[routine];
  const create = () => {
    let n = 'Nueva rutina', i = 2;
    while (routines[n]) { n = `Nueva rutina ${i}`; i += 1; }
    saveRoutines({ ...routines, [n]: [] });
    go('inicio', n);
  };
  return (
    <div className="space-y-3">
      <Card>
        <div className={`flex items-center justify-between text-sm font-medium ${muted}`}>
          <span>Entrenamiento de hoy</span>
          <button type="button" onClick={() => setEditing((v) => !v)} aria-label="Editar rutinas" aria-pressed={editing} className="flex size-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">{editing ? <X size={16} /> : <Pencil size={16} />}</button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.keys(routines).map((r) => (
            <button key={r} type="button" onClick={() => go('inicio', r)} aria-pressed={r === routine}
              className={`rounded-full px-3 py-1 text-sm font-semibold ${r === routine ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950' : 'bg-slate-100 dark:bg-zinc-800'}`}>{r}</button>
          ))}
          {editing && <button type="button" onClick={create} aria-label="Nueva rutina" className="flex size-8 items-center justify-center rounded-full bg-emerald-700 text-white"><Plus size={16} /></button>}
        </div>
        {editing ? <RoutineEditor routine={routine} onSelect={(r) => go('inicio', r)} /> : (
          <>
            <p className="mt-4 text-3xl font-extrabold tracking-tight">{routine}</p>
            <p className={`mt-1 text-sm ${muted}`}>{exercises.length} ejercicios</p>
            {exercises.length === 0 && <p className={`mt-3 text-sm ${muted}`}>Pulsa el lápiz para añadir ejercicios.</p>}
            <ul className="mt-4 space-y-2 text-sm">
              {exercises.map((e) => (
                <li key={e.name} className="flex justify-between">
                  <span>{e.name} {e.targetReps && <span className="ml-1 text-xs text-emerald-600 dark:text-emerald-400">[{e.targetReps}]</span>}</span>
                  <b>{e.muscle}</b>
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => go('entreno')} disabled={!exercises.length} className={`${primary} mt-5 !h-12`}>Empezar entreno</button>
          </>
        )}
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card className="!p-4">
          <p className={`text-xs font-medium ${muted}`}>Racha</p>
          <p className={`mt-2 text-2xl font-extrabold ${good}`}>{calcStreak(mySessions)} días</p>
        </Card>
        <Card className="!p-4">
          <p className={`text-xs font-medium ${muted}`}>Volumen semanal</p>
          <p className={`mt-2 text-2xl font-extrabold ${delta !== null && delta < 0 ? bad : good}`}>{fmt(week)} kg</p>
          {delta !== null && <p className={`mt-1 text-xs font-semibold ${delta < 0 ? bad : good}`}>{delta < 0 ? '−' : '+'}{fmt(Math.abs(delta), 1)} % vs. la anterior</p>}
        </Card>
      </div>
    </div>
  );
}

export function Workout({ routine, go, activeDate }) {
  const { addSession, sessions, routines, activeProfileId } = useGym();
  const exercises = routines[routine];
  const mySessions = sessions.filter(s => !s.profileId || s.profileId === activeProfileId);
  const [name, setName] = useState(exercises[0]?.name || '');
  const [sets, setSets] = useState([]);
  const [draft, setDraft] = useState({ kg: '', reps: '' });
  
  // Estados del temporizador
  const [rest, setRest] = useState(0);
  const [targetRest, setTargetRest] = useState(90); // Para calcular el % de la barra
  
  const currentEx = exercises.find((e) => e.name === name);

  useEffect(() => {
    if (rest <= 0) return undefined;
    const t = setTimeout(() => setRest((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rest]);
  
  const last = [...mySessions].reverse().flatMap((s) => s.sets).find((s) => s.ex === name);
  const mine = sets.filter((s) => s.ex === name);
  
  const add = (event) => {
    event.preventDefault();
    const inputKg = draft.kg.trim();
    const resolvedKg = (inputKg === '' && currentEx?.defaultWeight !== '' && currentEx?.defaultWeight !== undefined) 
      ? currentEx.defaultWeight 
      : Number(inputKg.replace(',', '.'));

    const kg = Number(resolvedKg);
    const reps = Number(draft.reps);
    if (!name || !(kg >= 0) || !(reps > 0)) return;
    
    setSets((s) => [...s, { ex: name, muscle: currentEx?.muscle, kg, reps }]);
    setDraft({ kg: draft.kg, reps: '' });
    
    // Reiniciamos el temporizador a 90s
    setRest(90);
    setTargetRest(90);
  };
  
  // Función para ajustar el tiempo con los botones
  const adjustRest = (amount) => {
    setRest((r) => Math.max(0, r + amount));
    setTargetRest((t) => Math.max(15, t + amount)); // Evita que el objetivo sea menor a 15s
  };
  
  const finish = () => {
    addSession({ date: activeDate || iso(), name: routine, sets });
    setSets([]);
    go('progreso');
  };
  
  return (
    <div className="space-y-3">
      <Card>
        <label htmlFor="ex" className={`text-sm font-medium ${muted}`}>Ejercicio · {routine}</label>
        <select id="ex" value={name} onChange={(e) => setName(e.target.value)} className={`${field} mt-2 w-full`}>
          {exercises.map((e) => <option key={e.name}>{e.name}</option>)}
        </select>
        
        {exercises.length === 0 && <p className={`mt-2 text-sm ${muted}`}>Esta rutina no tiene ejercicios. Añádelos desde Inicio con el lápiz.</p>}
        {currentEx?.targetReps && (
          <p className="mt-2 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
            Objetivo: {currentEx.targetReps} reps {currentEx?.defaultWeight !== '' && currentEx?.defaultWeight !== undefined ? `(@ ${currentEx.defaultWeight} kg)` : ''}
          </p>
        )}
        {last && <p className={`mt-1 text-sm ${muted}`}>Última vez: {fmt(last.kg, 1)} kg × {last.reps}</p>}
        
        <ol className="mt-4 space-y-2">
          {mine.map((s, i) => (
            <li key={i} className="flex justify-between rounded-2xl bg-emerald-50 px-4 py-3 text-sm dark:bg-emerald-500/10"><b>Serie {i + 1}</b><span>{fmt(s.kg, 1)} kg × {s.reps}</span></li>
          ))}
        </ol>
        
        <form onSubmit={add} className="mt-4 flex gap-2">
          <input inputMode="decimal" aria-label="Kilos" placeholder="Kg" value={draft.kg} onChange={(e) => setDraft((d) => ({ ...d, kg: e.target.value }))} className={`${field} w-full`} />
          <input inputMode="numeric" aria-label="Repeticiones" placeholder="Reps" value={draft.reps} onChange={(e) => setDraft((d) => ({ ...d, reps: e.target.value }))} className={`${field} w-full`} />
          <button type="submit" aria-label="Añadir serie" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white"><Check size={18} /></button>
        </form>
      </Card>
      
      {rest > 0 && (
        <Card>
          <div className="flex items-center justify-between">
            <span className={`text-sm font-medium ${muted}`}>Descanso</span>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold dark:bg-zinc-800">
              Objetivo {String(Math.floor(targetRest / 60)).padStart(2, '0')}:{String(targetRest % 60).padStart(2, '0')}
            </span>
          </div>
          
          <p className="my-3 text-4xl font-extrabold tracking-tight">
            {String(Math.floor(rest / 60)).padStart(2, '0')}:{String(rest % 60).padStart(2, '0')}
          </p>
          
          <Bar value={(rest / targetRest) * 100} />
          
          <div className="mt-4 flex gap-2">
            <button type="button" onClick={() => adjustRest(-15)} className="flex h-10 flex-1 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
              −15 s
            </button>
            <button type="button" onClick={() => adjustRest(15)} className="flex h-10 flex-1 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold transition-colors hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700">
              +15 s
            </button>
          </div>
        </Card>
      )}
      <button type="button" onClick={finish} disabled={!sets.length} className={primary}>Terminar entreno</button>
    </div>
  );
}

export function Progress() {
  const { sessions, goals, activeProfileId } = useGym();
  const mySessions = sessions.filter(s => !s.profileId || s.profileId === activeProfileId);
  const myGoals = goals[activeProfileId] || Object.values(goals)[0];
  
  const names = [...new Set(mySessions.flatMap((s) => s.sets.map((x) => x.ex)))];
  const [ex, setEx] = useState('');
  const sel = ex || names[0];
  const pts = mySessions
    .map((s) => ({ v: Math.max(0, ...s.sets.filter((x) => x.ex === sel).map((x) => e1rm(x.kg, x.reps))) }))
    .filter((p) => p.v > 0);
  const hi = Math.max(...pts.map((p) => p.v)), lo = Math.min(...pts.map((p) => p.v));
  const line = pts.map((p, i) => `${pts.length > 1 ? 6 + i * (298 / (pts.length - 1)) : 155},${110 - ((p.v - lo) / (hi - lo || 1)) * 90}`).join(' ');
  const gain = pts.length > 1 ? ((pts.at(-1).v - pts[0].v) / pts[0].v) * 100 : 0;
  const counts = weekSets(mySessions);
  
  return (
    <div className="space-y-3">
      <Card>
        {pts.length === 0 ? (
          <p className={`text-sm ${muted}`}>Aún no hay entrenos. Termina uno para ver tu evolución.</p>
        ) : (
          <>
            <label htmlFor="pex" className={`text-sm font-medium ${muted}`}>1RM estimado</label>
            <select id="pex" value={sel} onChange={(e) => setEx(e.target.value)} className={`${field} mt-2 w-full`}>{names.map((n) => <option key={n}>{n}</option>)}</select>
            <p className={`mt-3 text-3xl font-extrabold tracking-tight ${good}`}>{fmt(pts.at(-1).v, 1)} kg</p>
            <p className={`text-sm font-semibold ${gain < 0 ? bad : good}`}>{gain < 0 ? '−' : '+'}{fmt(Math.abs(gain), 1)} % desde el primer entreno</p>
            <svg viewBox="0 0 310 120" className="mt-3 w-full" role="img" aria-label={`Evolución del 1RM estimado de ${sel}`}>
              <polyline points={line} fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </>
        )}
      </Card>
      <Card>
        <p className="font-bold">Series por músculo</p>
        <p className={`text-sm ${muted}`}>Esta semana · tope de series</p>
        {Object.entries(myGoals.weekly).map(([m, cap]) => {
          const n = counts[m] || 0, pct = (n / cap) * 100;
          return (
            <div key={m} className="mt-4">
              <div className="mb-2 flex justify-between text-sm"><b>{m}</b><span className={n > cap ? `font-semibold ${bad}` : muted}>{n} / {cap}{n > cap ? ' · Superado' : ''}</span></div>
              <Bar value={pct} color={pct >= 100 ? 'bg-rose-500' : pct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'} />
            </div>
          );
        })}
      </Card>
    </div>
  );
}

const macros = [['Proteína', 'p', 'bg-violet-500'], ['Carbohidratos', 'c', 'bg-emerald-500'], ['Grasas', 'g', 'bg-sky-500']];
const blank = { type: 'Desayuno', name: '', kcal: '', p: '', c: '', g: '' };
const blankRecipe = { ...blank, desc: '' };

export function Diet({ activeDate }) {
  const { meals, goals, recipes = [], addMeal, deleteMeal, saveGoals, saveRecipes, activeProfileId } = useGym();
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState(false);
  const myGoals = goals[activeProfileId] || Object.values(goals)[0];
  const [g, setG] = useState(myGoals);
  
  useEffect(() => setG(myGoals), [activeProfileId, goals]);

  const [editingRecipes, setEditingRecipes] = useState(false);
  const [recipeForm, setRecipeForm] = useState({ id: '', ...blankRecipe });
  
  const currentDate = activeDate || iso();
  const list = meals.filter((m) => (!m.profileId || m.profileId === activeProfileId) && m.date === currentDate);
  const tot = list.reduce((t, m) => ({ kcal: t.kcal + m.kcal, p: t.p + m.p, c: t.c + m.c, g: t.g + m.g }), { kcal: 0, p: 0, c: 0, g: 0 });
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
  const setR = (k) => (e) => setRecipeForm((v) => ({ ...v, [k]: e.target.value }));
  
  const submitGoals = (event) => {
    event.preventDefault();
    const next = Object.fromEntries(['kcal', 'p', 'c', 'g'].map((k) => [k, Number(g[k])]));
    if (Object.values(next).some((v) => !(v > 0))) return;
    saveGoals(next);
    setEditing(false);
  };
  
  const submit = (event) => {
    event.preventDefault();
    if (!f.name.trim() || !(Number(f.kcal) >= 0) || f.kcal === '') return;
    addMeal({ date: currentDate, type: f.type, name: f.name.trim(), kcal: Number(f.kcal), p: Number(f.p) || 0, c: Number(f.c) || 0, g: Number(f.g) || 0 });
    setF({ ...blank, type: f.type });
  };

  const loadRecipe = (r) => setF({ ...blank, type: r.type, name: r.name, kcal: r.kcal, p: r.p, c: r.c, g: r.g });

  const submitRecipe = (e) => {
    e.preventDefault();
    if (!recipeForm.name.trim() || !(Number(recipeForm.kcal) >= 0) || recipeForm.kcal === '') return;
    const newR = {
      id: recipeForm.id || crypto.randomUUID(),
      type: recipeForm.type,
      name: recipeForm.name.trim(),
      desc: recipeForm.desc?.trim() || '',
      kcal: Number(recipeForm.kcal),
      p: Number(recipeForm.p) || 0,
      c: Number(recipeForm.c) || 0,
      g: Number(recipeForm.g) || 0
    };
    if (recipeForm.id) saveRecipes(recipes.map(r => r.id === recipeForm.id ? newR : r));
    else saveRecipes([...recipes, newR]);
    setRecipeForm({ id: '', ...blankRecipe, type: recipeForm.type });
  };

  const deleteRecipe = (id) => saveRecipes(recipes.filter(r => r.id !== id));
  const editRecipe = (r) => setRecipeForm({ ...r, desc: r.desc || '' });
  
  return (
    <div className="space-y-3">
      <Card>
        <div className={`flex items-center justify-between text-sm font-medium ${muted}`}><span>Calorías del día</span><span className="flex items-center gap-1"><button type="button" onClick={() => { setG(myGoals); setEditing((v) => !v); }} aria-label="Editar objetivo" aria-pressed={editing} className="flex size-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">{editing ? <X size={16} /> : <Pencil size={16} />}</button><Utensils size={18} /></span></div>
        <p className="mt-3 text-3xl font-extrabold tracking-tight">{fmt(tot.kcal)} kcal</p>
        <p className={`mb-4 mt-1 text-sm ${muted}`}>de {fmt(myGoals.kcal)} · te quedan {fmt(Math.max(0, myGoals.kcal - tot.kcal))}</p>
        <Bar value={(tot.kcal / myGoals.kcal) * 100} color={tot.kcal > myGoals.kcal ? 'bg-rose-500' : 'bg-emerald-500'} />
        <div className="mt-4 space-y-3">
          {macros.map(([label, k, color]) => (
            <div key={k}>
              <div className="mb-1.5 flex justify-between text-sm"><span>{label}</span><b>{fmt(tot[k])} / {fmt(myGoals[k])} g</b></div>
              <Bar value={(tot[k] / myGoals[k]) * 100} color={color} />
            </div>
          ))}
        </div>
        {editing && (
          <form onSubmit={submitGoals} className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4 dark:border-zinc-800">
            {[['kcal', 'Calorías (kcal)'], ['p', 'Proteína (g)'], ['c', 'Carbohidratos (g)'], ['g', 'Grasas (g)']].map(([k, label]) => (
              <label key={k} className={`text-xs font-medium ${muted}`}>{label}
                <input inputMode="numeric" value={g[k]} onChange={(e) => setG((v) => ({ ...v, [k]: e.target.value }))} className={`${field} mt-1 w-full`} />
              </label>
            ))}
            <button type="submit" className={`${primary} col-span-2 !h-12`}>Guardar objetivo</button>
          </form>
        )}
      </Card>
      
      <Card className="!py-2">
        {list.length === 0 && <p className={`py-3 text-sm ${muted}`}>Todavía no has añadido comidas en este día.</p>}
        {list.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 border-b border-slate-100 py-3 last:border-0 dark:border-zinc-800">
            <div className="min-w-0"><p className="font-bold">{m.type}</p><p className={`truncate text-sm ${muted}`}>{m.name}</p></div>
            <div className="flex shrink-0 items-center gap-2">
              <b className="text-sm">{fmt(m.kcal)} kcal</b>
              <button type="button" onClick={() => deleteMeal(m.id)} aria-label={`Eliminar ${m.name}`} className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </Card>

      <Card>
        <div className="flex items-center justify-between font-bold">
          <p>{editingRecipes ? 'Gestionar recetas (Global)' : 'Añadir comida'}</p>
          <button type="button" onClick={() => { setEditingRecipes(!editingRecipes); setRecipeForm({ id: '', ...blankRecipe }); }} aria-label="Gestionar recetas" className="flex size-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">
            {editingRecipes ? <X size={16} /> : <Pencil size={16} />}
          </button>
        </div>

        {editingRecipes ? (
          <div className="mt-4 space-y-4">
            <form onSubmit={submitRecipe} className="space-y-3 rounded-2xl bg-slate-50 p-3 dark:bg-zinc-800/50">
              <p className="text-sm font-semibold">{recipeForm.id ? 'Editando sugerencia' : 'Nueva sugerencia compartida'}</p>
              <div className="flex gap-2">
                <select aria-label="Tipo" value={recipeForm.type} onChange={setR('type')} className={`${field} shrink-0`}>{['Desayuno', 'Comida', 'Merienda', 'Cena'].map((t) => <option key={t}>{t}</option>)}</select>
                <input aria-label="Nombre" placeholder="Nombre" value={recipeForm.name} onChange={setR('name')} className={`${field} w-full min-w-0 bg-white dark:bg-zinc-900`} />
              </div>
              <input aria-label="Descripción" placeholder="Descripción breve (opcional)" value={recipeForm.desc} onChange={setR('desc')} className={`${field} w-full bg-white dark:bg-zinc-900`} />
              <div className="grid grid-cols-4 gap-2">
                {[['kcal', 'kcal'], ['p', 'Prot.'], ['c', 'Carb.'], ['g', 'Grasa']].map(([k, label]) => (
                  <input key={k} inputMode="decimal" aria-label={label} placeholder={label} value={recipeForm[k]} onChange={setR(k)} className={`${field} w-full min-w-0 bg-white px-2 text-center dark:bg-zinc-900`} />
                ))}
              </div>
              <div className="flex gap-2">
                {recipeForm.id && <button type="button" onClick={() => setRecipeForm({ id: '', ...blankRecipe })} className="h-11 w-full rounded-2xl bg-slate-200 font-bold text-slate-700 dark:bg-zinc-700 dark:text-slate-200">Cancelar</button>}
                <button type="submit" className={`${primary} !h-11 ${!recipeForm.id ? 'w-full' : ''}`}>{recipeForm.id ? 'Guardar' : 'Crear receta'}</button>
              </div>
            </form>

            <div className="space-y-2">
              {recipes.length === 0 && <p className={`text-sm ${muted}`}>No hay recetas guardadas.</p>}
              {recipes.map(r => (
                <div key={r.id} className="flex items-center justify-between rounded-2xl border border-slate-100 px-3 py-2 dark:border-zinc-800">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold">{r.name}</p>
                    {r.desc && <p className={`truncate text-xs ${muted} mb-1`}>{r.desc}</p>}
                    <p className={`text-xs font-semibold text-emerald-600 dark:text-emerald-400`}>{r.kcal} kcal · {r.p}g P</p>
                  </div>
                  <div className="flex shrink-0 gap-1 pl-2">
                    <button type="button" onClick={() => editRecipe(r)} className="p-2 text-slate-400 hover:text-emerald-600"><Pencil size={15} /></button>
                    <button type="button" onClick={() => deleteRecipe(r.id)} className="p-2 text-slate-400 hover:text-rose-600"><Trash2 size={15} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mt-3">
              <p className={`mb-2 text-xs font-medium ${muted}`}>Sugerencias compartidas</p>
              {recipes.length > 0 ? (
                <div className="flex snap-x gap-2 overflow-x-auto pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {recipes.map((r) => (
                    <button 
                      key={r.id} 
                      type="button" 
                      onClick={() => loadRecipe(r)}
                      className="shrink-0 snap-start rounded-2xl bg-emerald-50 px-3 py-2 text-left transition-colors hover:bg-emerald-100 dark:bg-emerald-500/10 dark:hover:bg-emerald-500/20 max-w-[200px]"
                    >
                      <p className="truncate text-sm font-bold text-emerald-900 dark:text-emerald-100">{r.name}</p>
                      {r.desc && <p className="truncate text-xs text-emerald-700/70 dark:text-emerald-400/70">{r.desc}</p>}
                      <p className="mt-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">{r.kcal} kcal · {r.p}g P</p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className={`text-sm ${muted}`}>No hay recetas. Toca el lápiz de arriba para añadir una.</p>
              )}
            </div>

            <form onSubmit={submit} className="mt-2 space-y-3">
              <div className="flex gap-2">
                <select aria-label="Tipo de comida" value={f.type} onChange={set('type')} className={`${field} shrink-0`}>{['Desayuno', 'Comida', 'Merienda', 'Cena'].map((t) => <option key={t}>{t}</option>)}</select>
                <input aria-label="Qué has comido" placeholder="Qué has comido" value={f.name} onChange={set('name')} className={`${field} w-full min-w-0`} />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[['kcal', 'kcal'], ['p', 'Prot. g'], ['c', 'Carb. g'], ['g', 'Grasa g']].map(([k, label]) => (
                  <input key={k} inputMode="decimal" aria-label={label} placeholder={label} value={f[k]} onChange={set(k)} className={`${field} w-full min-w-0 px-2 text-center`} />
                ))}
              </div>
              <button type="submit" className={`${primary} !h-12`}>Añadir comida</button>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}