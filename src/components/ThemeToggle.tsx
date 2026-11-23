"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}
const getSnapshot = () => document.documentElement.classList.contains("dark");
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !dark;
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("diuway-theme", next ? "dark" : "light");
    } catch {
      /* storage blocked — theme still switches for this visit */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="grid size-10 place-items-center rounded-full text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
    >
      {dark ? <Sun className="size-5" /> : <Moon className="size-5" />}
    </button>
  );
}

/** Runs before paint to avoid a light/dark flash. */
export const themeScript = `(function(){try{var t=localStorage.getItem('diuway-theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})();`;
