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
  useEffect(() => setName(routine), [routine]);
  const list = routines[routine] || [];
  const update = (next) => saveRoutines({ ...routines, [routine]: next });
  const addExercise = (event) => {
    event.preventDefault();
    if (!exName.trim()) return;
    update([...list, { name: exName.trim(), muscle }]);
    setExName('');
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
            <span>{e.name} <span className={muted}>· {e.muscle}</span></span>
            <button type="button" onClick={() => update(list.filter((_, j) => j !== i))} aria-label={`Quitar ${e.name}`} className="flex size-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"><X size={15} /></button>
          </li>
        ))}
      </ul>
      <form onSubmit={addExercise} className="flex gap-2">
        <input aria-label="Nuevo ejercicio" placeholder="Nuevo ejercicio" value={exName} onChange={(e) => setExName(e.target.value)} className={`${field} w-full min-w-0`} />
        <select aria-label="Músculo" value={muscle} onChange={(e) => setMuscle(e.target.value)} className={`${field} shrink-0 px-2`}>{MUSCLES.map((m) => <option key={m}>{m}</option>)}</select>
        <button type="submit" aria-label="Añadir ejercicio" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-700 text-white"><Plus size={18} /></button>
      </form>
      <button type="button" onClick={remove} disabled={Object.keys(routines).length < 2} className={`inline-flex items-center gap-1 text-sm font-semibold disabled:opacity-40 ${bad}`}><Trash2 size={15} />Eliminar rutina</button>
    </div>
  );
}

export function Home({ go, routine }) {
  const { sessions, routines, saveRoutines } = useGym();
  const [editing, setEditing] = useState(false);
  const week = weekVol(sessions, 0), prev = weekVol(sessions, 1);
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
              {exercises.map((e) => <li key={e.name} className="flex justify-between"><span>{e.name}</span><b>{e.muscle}</b></li>)}
            </ul>
            <button type="button" onClick={() => go('entreno')} disabled={!exercises.length} className={`${primary} mt-5 !h-12`}>Empezar entreno</button>
          </>
        )}
      </Card>
      <div className="grid grid-cols-2 gap-3">
        <Card className="!p-4">
          <p className={`text-xs font-medium ${muted}`}>Racha</p>
          <p className={`mt-2 text-2xl font-extrabold ${good}`}>{calcStreak(sessions)} días</p>
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

export function Workout({ routine, go }) {
  const { addSession, sessions, routines } = useGym();
  const exercises = routines[routine];
  const [name, setName] = useState(exercises[0]?.name || '');
  const [sets, setSets] = useState([]);
  const [draft, setDraft] = useState({ kg: '', reps: '' });
  const [rest, setRest] = useState(0);
  useEffect(() => {
    if (rest <= 0) return undefined;
    const t = setTimeout(() => setRest((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rest]);
  const last = [...sessions].reverse().flatMap((s) => s.sets).find((s) => s.ex === name);
  const mine = sets.filter((s) => s.ex === name);
  const add = (event) => {
    event.preventDefault();
    const kg = Number(draft.kg.replace(',', '.')), reps = Number(draft.reps);
    if (!name || !(kg >= 0) || !(reps > 0)) return;
    setSets((s) => [...s, { ex: name, muscle: exercises.find((e) => e.name === name)?.muscle, kg, reps }]);
    setRest(90);
  };
  const finish = () => {
    addSession({ date: iso(), name: routine, sets });
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
        {last && <p className={`mt-2 text-sm ${muted}`}>Última vez: {fmt(last.kg, 1)} kg × {last.reps}</p>}
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
          <p className={`text-sm font-medium ${muted}`}>Descanso</p>
          <p className="my-2 text-4xl font-extrabold tracking-tight">{String(Math.floor(rest / 60)).padStart(2, '0')}:{String(rest % 60).padStart(2, '0')}</p>
          <Bar value={(rest / 90) * 100} />
        </Card>
      )}
      <button type="button" onClick={finish} disabled={!sets.length} className={primary}>Terminar entreno</button>
    </div>
  );
}

export function Progress() {
  const { sessions, goals } = useGym();
  const names = [...new Set(sessions.flatMap((s) => s.sets.map((x) => x.ex)))];
  const [ex, setEx] = useState('');
  const sel = ex || names[0];
  const pts = sessions
    .map((s) => ({ v: Math.max(0, ...s.sets.filter((x) => x.ex === sel).map((x) => e1rm(x.kg, x.reps))) }))
    .filter((p) => p.v > 0);
  const hi = Math.max(...pts.map((p) => p.v)), lo = Math.min(...pts.map((p) => p.v));
  const line = pts.map((p, i) => `${pts.length > 1 ? 6 + i * (298 / (pts.length - 1)) : 155},${110 - ((p.v - lo) / (hi - lo || 1)) * 90}`).join(' ');
  const gain = pts.length > 1 ? ((pts.at(-1).v - pts[0].v) / pts[0].v) * 100 : 0;
  const counts = weekSets(sessions);
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
        {Object.entries(goals.weekly).map(([m, cap]) => {
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

export function Diet() {
  const { meals, goals, addMeal, deleteMeal, saveGoals } = useGym();
  const [f, setF] = useState(blank);
  const [editing, setEditing] = useState(false);
  const [g, setG] = useState(goals);
  const list = meals.filter((m) => m.date === iso());
  const tot = list.reduce((t, m) => ({ kcal: t.kcal + m.kcal, p: t.p + m.p, c: t.c + m.c, g: t.g + m.g }), { kcal: 0, p: 0, c: 0, g: 0 });
  const set = (k) => (e) => setF((v) => ({ ...v, [k]: e.target.value }));
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
    addMeal({ date: iso(), type: f.type, name: f.name.trim(), kcal: Number(f.kcal), p: Number(f.p) || 0, c: Number(f.c) || 0, g: Number(f.g) || 0 });
    setF({ ...blank, type: f.type });
  };
  return (
    <div className="space-y-3">
      <Card>
        <div className={`flex items-center justify-between text-sm font-medium ${muted}`}><span>Calorías de hoy</span><span className="flex items-center gap-1"><button type="button" onClick={() => { setG(goals); setEditing((v) => !v); }} aria-label="Editar objetivo" aria-pressed={editing} className="flex size-8 items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800">{editing ? <X size={16} /> : <Pencil size={16} />}</button><Utensils size={18} /></span></div>
        <p className="mt-3 text-3xl font-extrabold tracking-tight">{fmt(tot.kcal)} kcal</p>
        <p className={`mb-4 mt-1 text-sm ${muted}`}>de {fmt(goals.kcal)} · te quedan {fmt(Math.max(0, goals.kcal - tot.kcal))}</p>
        <Bar value={(tot.kcal / goals.kcal) * 100} color={tot.kcal > goals.kcal ? 'bg-rose-500' : 'bg-emerald-500'} />
        <div className="mt-4 space-y-3">
          {macros.map(([label, k, color]) => (
            <div key={k}>
              <div className="mb-1.5 flex justify-between text-sm"><span>{label}</span><b>{fmt(tot[k])} / {fmt(goals[k])} g</b></div>
              <Bar value={(tot[k] / goals[k]) * 100} color={color} />
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
        {list.length === 0 && <p className={`py-3 text-sm ${muted}`}>Todavía no has añadido comidas hoy.</p>}
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
        <form onSubmit={submit} className="space-y-3">
          <p className="font-bold">Añadir comida</p>
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
      </Card>
    </div>
  );
}
