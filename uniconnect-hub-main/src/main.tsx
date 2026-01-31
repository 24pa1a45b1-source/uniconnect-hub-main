import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Global runtime handlers to help catch silent failures
window.addEventListener("error", (ev) => {
  console.error("Global error handler:", ev.error || ev.message, ev);
  try {
    const w = window as unknown as { __LAST_ERROR?: string };
    w.__LAST_ERROR =
      (ev.error &&
        (typeof ev.error === "object"
          ? (ev.error as Error).stack || (ev.error as Error).message
          : String(ev.error))) ||
      String(ev.message || "Unknown error");
  } catch {}
});

window.addEventListener("unhandledrejection", (ev) => {
  console.error("Unhandled promise rejection:", ev.reason);
  try {
    const w = window as unknown as { __LAST_ERROR?: string };
    w.__LAST_ERROR =
      (ev.reason &&
        (typeof ev.reason === "object"
          ? (ev.reason as Error).stack || (ev.reason as Error).message
          : String(ev.reason))) ||
      "Unhandled rejection";
  } catch {}
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element (#root) not found in index.html");
}

createRoot(rootElement).render(
  <App />
);
