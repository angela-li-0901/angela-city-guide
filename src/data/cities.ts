import type { CityConfig } from './types';

export const CITIES: CityConfig[] = [
  {
    name: 'Boston',
    subtitle: 'MA',
    slug: 'boston',
    center: { lat: 42.3601, lng: -71.0589 },
    zoom: 13,
  },
  {
    name: 'Bay Area',
    subtitle: 'CA',
    slug: 'bay-area',
    center: { lat: 37.7749, lng: -122.4194 },
    zoom: 11,
  },
];

export function getCityBySlug(slug: string): CityConfig | undefined {
  return CITIES.find((c) => c.slug === slug);
}
