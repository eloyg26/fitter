import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { GymProvider } from './store';
import './index.css';

createRoot(document.getElementById('root')).render(<GymProvider><App /></GymProvider>);
