import type { MusicPreferences } from "../backend.d";

const KEY = "melody_prefs";

export function loadPrefsFromStorage(): MusicPreferences | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MusicPreferences;
  } catch {
    return null;
  }
}

export function savePrefsToStorage(prefs: MusicPreferences): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs));
  } catch {}
}

export function clearPrefsFromStorage(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {}
}
