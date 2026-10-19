export const fmt = (n, d = 0) => new Intl.NumberFormat('es-ES', { maximumFractionDigits: d, useGrouping: 'always' }).format(n);
export const iso = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const e1rm = (kg, reps) => kg * (1 + reps / 30);
export const MUSCLES = ['Pecho', 'Espalda', 'Hombro', 'Piernas', 'Brazos', 'Core'];
export const DEFAULT_ROUTINES = {
  Empuje: [{ name: 'Press banca', muscle: 'Pecho' }, { name: 'Press militar', muscle: 'Hombro' }, { name: 'Fondos', muscle: 'Pecho' }],
  'Tirón': [{ name: 'Dominadas', muscle: 'Espalda' }, { name: 'Remo con barra', muscle: 'Espalda' }, { name: 'Curl bíceps', muscle: 'Brazos' }],
  Pierna: [{ name: 'Sentadilla', muscle: 'Piernas' }, { name: 'Peso muerto rumano', muscle: 'Piernas' }, { name: 'Prensa', muscle: 'Piernas' }],
};
// Para entrenos guardados antes de que cada serie llevara su músculo.
const legacy = Object.fromEntries(Object.values(DEFAULT_ROUTINES).flat().map((e) => [e.name, e.muscle]));
export const todayRoutine = (routines) => {
  const keys = Object.keys(routines);
  return keys[(new Date().getDay() + 6) % keys.length];
};
const weekStart = (off = 0) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - 7 * off);
  return d;
};
export const weekVol = (sessions, off = 0) => {
  const a = iso(weekStart(off)), b = iso(weekStart(off - 1));
  return sessions.filter((s) => s.date >= a && s.date < b)
    .reduce((t, s) => t + s.sets.reduce((u, x) => u + x.kg * x.reps, 0), 0);
};
export const weekSets = (sessions) => {
  const a = iso(weekStart(0)), counts = {};
  sessions.filter((s) => s.date >= a).forEach((s) => s.sets.forEach((x) => {
    const m = x.muscle || legacy[x.ex];
    if (m) counts[m] = (counts[m] || 0) + 1;
  }));
  return counts;
};
export const calcStreak = (sessions) => {
  const days = new Set(sessions.map((s) => s.date));
  const d = new Date();
  if (!days.has(iso(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(iso(d))) { n += 1; d.setDate(d.getDate() - 1); }
  return n;
};
