import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_ROUTINES } from './lib';

const Ctx = createContext(null);
const initial = {
  routines: DEFAULT_ROUTINES,
  sessions: [],
  meals: [],
  goals: { kcal: 2400, p: 160, c: 260, g: 70, weekly: { Pecho: 16, Espalda: 16, Piernas: 14, Hombro: 12, Brazos: 10 } },
};

export const GymProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try { return { ...initial, ...JSON.parse(localStorage.getItem('gym-data')) }; } catch { return initial; }
  });
  useEffect(() => localStorage.setItem('gym-data', JSON.stringify(data)), [data]);
  const api = {
    ...data,
    addSession: (s) => setData((d) => ({ ...d, sessions: [...d.sessions, { id: crypto.randomUUID(), ...s }] })),
    addMeal: (m) => setData((d) => ({ ...d, meals: [...d.meals, { id: crypto.randomUUID(), ...m }] })),
    deleteMeal: (id) => setData((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) })),
    saveRoutines: (routines) => setData((d) => ({ ...d, routines })),
    saveGoals: (goals) => setData((d) => ({ ...d, goals: { ...d.goals, ...goals } })),
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
};

export const useGym = () => useContext(Ctx);
