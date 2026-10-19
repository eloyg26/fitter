import React, { createContext, useContext, useEffect, useState } from 'react';
import { DEFAULT_ROUTINES } from './lib';

const DEFAULT_RECIPES = [
  { id: 'r1', name: 'Tortitas de avena', desc: 'Avena, claras y plátano batido', type: 'Desayuno', kcal: 350, p: 20, c: 45, g: 8 },
  { id: 'r2', name: 'Pollo, arroz y brócoli', desc: 'Comida clásica de volumen', type: 'Comida', kcal: 450, p: 40, c: 55, g: 5 },
  { id: 'r3', name: 'Yogur proteico y nueces', desc: 'Yogur natural con un puñado de nueces', type: 'Merienda', kcal: 250, p: 20, c: 10, g: 14 },
  { id: 'r4', name: 'Salmón a la plancha', desc: 'Con guarnición de espárragos', type: 'Cena', kcal: 400, p: 35, c: 0, g: 25 },
];

const defaultGoals = { kcal: 2400, p: 160, c: 260, g: 70, weekly: { Pecho: 16, Espalda: 16, Piernas: 14, Hombro: 12, Brazos: 10 } };

const Ctx = createContext(null);
const initial = {
  profiles: [{ id: 'p1', name: 'Mi Perfil' }],
  activeProfileId: 'p1',
  routines: DEFAULT_ROUTINES,
  sessions: [], 
  meals: [],    
  recipes: DEFAULT_RECIPES, 
  goals: { p1: defaultGoals },
};

export const GymProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    try { 
      const local = JSON.parse(localStorage.getItem('gym-data'));
      if (local) {
        if (!local.profiles) local.profiles = initial.profiles;
        if (!local.activeProfileId) local.activeProfileId = initial.activeProfileId;
        if (local.goals && !local.goals.p1) local.goals = { p1: local.goals };
        if (!local.recipes) local.recipes = initial.recipes;
        return { ...initial, ...local };
      }
      return initial; 
    } catch { return initial; }
  });
  
  useEffect(() => localStorage.setItem('gym-data', JSON.stringify(data)), [data]);
  
  const api = {
    ...data,
    setActiveProfile: (id) => setData((d) => ({ ...d, activeProfileId: id })),
    addProfile: (name) => setData((d) => {
      const newId = crypto.randomUUID();
      return { 
        ...d, 
        profiles: [...d.profiles, { id: newId, name }], 
        goals: { ...d.goals, [newId]: defaultGoals },
        activeProfileId: newId 
      };
    }),
    addSession: (s) => setData((d) => ({ ...d, sessions: [...d.sessions, { id: crypto.randomUUID(), profileId: d.activeProfileId, ...s }] })),
    addMeal: (m) => setData((d) => ({ ...d, meals: [...d.meals, { id: crypto.randomUUID(), profileId: d.activeProfileId, ...m }] })),
    deleteMeal: (id) => setData((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) })),
    saveRoutines: (routines) => setData((d) => ({ ...d, routines })),
    saveGoals: (goals) => setData((d) => ({ ...d, goals: { ...d.goals, [d.activeProfileId]: { ...(d.goals[d.activeProfileId] || defaultGoals), ...goals } } })),
    saveRecipes: (recipes) => setData((d) => ({ ...d, recipes })),
  };
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
};

export const useGym = () => useContext(Ctx);