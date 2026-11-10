// src/context/ThemeProvider.jsx
import { useEffect, useState } from "react";
import {
  ThemeContext,
  THEMES,
  DEFAULT_THEME,
  STORAGE_KEY,
} from "./theme-context";

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const saved =
      typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.includes(saved)) {return saved;}
    return DEFAULT_THEME;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (newTheme) => {
    if (THEMES.includes(newTheme)) {
      setThemeState(newTheme);
    } else {
      console.warn(`[ThemeProvider] Unknown theme: "${newTheme}"`);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  );
}
