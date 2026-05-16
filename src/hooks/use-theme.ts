import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";
const STORAGE_KEY = "zoo-theme";

const getInitialTheme = (): Theme => {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (saved === "light" || saved === "dark") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");

  // Update browser/OS chrome color (Android Chrome address bar, etc.)
  // We keep media-scoped meta tags in index.html for system-driven default,
  // and additionally set a non-media tag here so manual toggles also apply.
  const color = theme === "dark" ? "#0b1220" : "#ffffff";
  let meta = document.querySelector('meta[name="theme-color"]:not([media])');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", color);

  // iOS status bar style for installed PWAs.
  // "default" = dark text on light bg, "black-translucent" = light text on dark bg.
  let iosBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!iosBar) {
    iosBar = document.createElement("meta");
    iosBar.setAttribute("name", "apple-mobile-web-app-status-bar-style");
    document.head.appendChild(iosBar);
  }
  iosBar.setAttribute("content", theme === "dark" ? "black-translucent" : "default");
};

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((t) => (t === "dark" ? "light" : "dark"));
  }, []);

  return { theme, toggle };
};
