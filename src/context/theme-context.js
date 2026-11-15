// src/context/theme-context.js
import { createContext } from "react";

export const ThemeContext = createContext(null);

export const THEMES = ["light"];
export const DEFAULT_THEME = "light";
export const STORAGE_KEY = "bidora-theme";