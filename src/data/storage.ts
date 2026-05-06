import type { GuideEntry } from './types';
import bostonData from './boston.json';
import bayAreaData from './bay-area.json';

const cityDataMap: Record<string, GuideEntry[]> = {
  'boston': bostonData as GuideEntry[],
  'bay-area': bayAreaData as GuideEntry[],
};

const STORAGE_PREFIX = 'angelas-guide_';

function getStorageKey(citySlug: string): string {
  return `${STORAGE_PREFIX}${citySlug}`;
}

export function loadEntries(citySlug: string): GuideEntry[] {
  // In dev mode, check localStorage for admin edits first
  if (import.meta.env.DEV) {
    const stored = localStorage.getItem(getStorageKey(citySlug));
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fall through to static data
      }
    }
  }
  return cityDataMap[citySlug] ?? [];
}

export function saveEntries(citySlug: string, entries: GuideEntry[]): void {
  // Save to localStorage (may fail if data is too large)
  try {
    localStorage.setItem(getStorageKey(citySlug), JSON.stringify(entries));
  } catch {
    // Quota exceeded -- clear and retry with just this city
    try {
      localStorage.removeItem(getStorageKey(citySlug));
      localStorage.setItem(getStorageKey(citySlug), JSON.stringify(entries));
    } catch {
      // Still too large -- skip localStorage, rely on JSON file
      console.warn('localStorage quota exceeded, skipping local cache');
    }
  }

  // In dev mode, also save to the JSON file via dev API
  if (import.meta.env.DEV) {
    fetch('/api/save-entries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citySlug, entries }),
    }).catch(() => {
      // Dev API not available, localStorage is the fallback
    });
  }
}

export function savePhoto(entryId: string, dataUrl: string): Promise<string> {
  if (import.meta.env.DEV) {
    return fetch('/api/save-photo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entryId, dataUrl }),
    })
      .then((res) => res.json())
      .then((data) => data.path as string)
      .catch(() => dataUrl); // Fallback to base64
  }
  return Promise.resolve(dataUrl);
}
