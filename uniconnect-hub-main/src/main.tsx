import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global runtime handlers to help catch silent failures in the browser
window.addEventListener('error', (ev) => {
  // Log to console; ErrorBoundary will catch render-time errors
  console.error('Global error handler:', ev.error || ev.message, ev);
  try {
    const w = window as unknown as { __LAST_ERROR?: string };
    w.__LAST_ERROR = (ev.error && (typeof ev.error === 'object' ? (((ev.error as Error).stack || (ev.error as Error).message) || String(ev.error)) : String(ev.error))) || String(ev.message || 'Unknown error');
  } catch (e) {
    console.warn('Failed to set __LAST_ERROR in error handler', e);
  }
});

window.addEventListener('unhandledrejection', (ev) => {
  console.error('Unhandled promise rejection:', ev.reason);
  try {
    const w = window as unknown as { __LAST_ERROR?: string };
    w.__LAST_ERROR = (ev.reason && (typeof ev.reason === 'object' ? (((ev.reason as Error).stack || (ev.reason as Error).message) || String(ev.reason)) : String(ev.reason))) || 'Unhandled rejection';
  } catch (e) {
    console.warn('Failed to set __LAST_ERROR in unhandledrejection handler', e);
  }
});

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
