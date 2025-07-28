// src/index.js

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './ThemeContext';
import { BrowserRouter } from 'react-router-dom'; // <-- 1. IMPORTAÇÃO ADICIONADA
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 2. BROWSERROUTER ENVOLVENDO A APLICAÇÃO */}
    <BrowserRouter> 
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);

serviceWorkerRegistration.register();