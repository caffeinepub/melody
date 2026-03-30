import type { MusicPreferences } from "../backend.d";

const KEY = "musicPreferences";
const OLD_KEY = "melody_prefs";

export function loadPrefsFromStorage(): MusicPreferences | null {
  try {
    let raw = localStorage.getItem(KEY);
    if (!raw) {
      // Migration: check old key
      const oldRaw = localStorage.getItem(OLD_KEY);
      if (oldRaw) {
        localStorage.setItem(KEY, oldRaw);
        localStorage.removeItem(OLD_KEY);
        raw = oldRaw;
      }
    }
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
    localStorage.removeItem(OLD_KEY);
  } catch {}
}
