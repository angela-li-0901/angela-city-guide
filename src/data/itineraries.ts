import type { Itinerary } from './types';
import bostonItineraries from './boston-itineraries.json';
import bayAreaItineraries from './bay-area-itineraries.json';

const itineraryDataMap: Record<string, Itinerary[]> = {
  'boston': bostonItineraries as Itinerary[],
  'bay-area': bayAreaItineraries as Itinerary[],
};

const STORAGE_PREFIX = 'angelas-guide-itineraries_';

function getStorageKey(citySlug: string): string {
  return `${STORAGE_PREFIX}${citySlug}`;
}

export function loadItineraries(citySlug: string): Itinerary[] {
  if (import.meta.env.DEV) {
    const stored = localStorage.getItem(getStorageKey(citySlug));
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        // Fall through
      }
    }
  }
  return itineraryDataMap[citySlug] ?? [];
}

export function saveItineraries(citySlug: string, itineraries: Itinerary[]): void {
  try {
    localStorage.setItem(getStorageKey(citySlug), JSON.stringify(itineraries));
  } catch {
    console.warn('localStorage quota exceeded for itineraries');
  }

  if (import.meta.env.DEV) {
    fetch('/api/save-itineraries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ citySlug, itineraries }),
    }).catch(() => {});
  }
}
