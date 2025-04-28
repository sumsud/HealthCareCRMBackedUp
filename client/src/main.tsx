
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { ThemeProvider } from './components/providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import App from './App';
import { store } from './store';
import './index.css';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider defaultTheme="light" storageKey="careflow-theme">
        <App />
        <Toaster />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
