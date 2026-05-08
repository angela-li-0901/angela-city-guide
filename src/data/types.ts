// City types
export interface CityConfig {
  name: string;
  subtitle: string;
  slug: string;
  center: { lat: number; lng: number };
  zoom: number;
  googleMapsListUrl?: string;
}

// Subcategory types
export type FoodSubcategory = 'restaurant' | 'coffee-shop' | 'bar' | 'dessert';
export type PlacesSubcategory = 'city' | 'nature' | 'day-trip';

// Activity tag options for places (predefined list)
export const ACTIVITY_TAG_OPTIONS = [
  'Hiking',
  'Cycling',
  'City Walk',
  'Park',
  'Culture/Museum',
  'Viewpoint',
  'Beach',
] as const;

export type ActivityTag = (typeof ACTIVITY_TAG_OPTIONS)[number];

// Cuisine options (predefined list)
export const CUISINE_OPTIONS = [
  'American',
  'Chinese',
  'Japanese',
  'Korean',
  'Mexican',
  'Italian',
  'Thai',
  'Vietnamese',
  'Indian',
  'Mediterranean',
  'French',
  'Middle Eastern',
  'Seafood',
  'Pizza',
  'BBQ',
  'Bakery',
  'Brunch/Breakfast',
  'Ice Cream/Desserts',
] as const;

export type Cuisine = (typeof CUISINE_OPTIONS)[number];

// Spectrum rating labels (all 1-4 scale)
export const FOOD_SPECTRUM_LABELS = [
  { key: 'budgetToSplurge', left: '$', right: '$$$$' },
  { key: 'quickToSitDown', left: 'Quick bite', right: 'Sit down meal' },
  { key: 'popularToHiddenGem', left: 'Popular', right: 'Hidden Gem' },
] as const;

export const PLACES_SPECTRUM_LABELS = [
  { key: 'chillToActive', left: 'Chill', right: 'Active' },
  { key: 'indoorsToOutdoors', left: 'City', right: 'Nature' },
  { key: 'touristyToSecret', left: 'Touristy', right: 'Local secret' },
] as const;

// Rating interfaces (all 1-4 scale)
export interface FoodRatings {
  budgetToSplurge: number;    // 1-4
  quickToSitDown: number;     // 1-4
  popularToHiddenGem: number;  // 1-4
}

export interface PlacesRatings {
  chillToActive: number;      // 1-4
  indoorsToOutdoors: number;  // 1-4
  touristyToSecret: number;   // 1-4
}

// Subcategory display labels
export const FOOD_SUBCATEGORY_LABELS: Record<FoodSubcategory, string> = {
  'restaurant': 'Restaurant',
  'coffee-shop': 'Coffee Shop',
  'bar': 'Bar',
  'dessert': 'Dessert',
};

export const PLACES_SUBCATEGORY_LABELS: Record<PlacesSubcategory, string> = {
  'city': 'City',
  'nature': 'Nature',
  'day-trip': 'Day Trip',
};

// Photo positioning
export interface PhotoPosition {
  x: number; // 0-100, horizontal offset percentage (50 = centered)
  y: number; // 0-100, vertical offset percentage (50 = centered)
  zoom: number; // 0.5-2, scale factor
}

export interface PhotoItem {
  url: string;
  position?: PhotoPosition;
}

// Entry interfaces
export interface BaseEntry {
  id: string;
  name: string;
  neighborhood: string;
  address: string;
  coords: { lat: number; lng: number };
  review: string;
  photo: string; // legacy single photo (kept for backward compat)
  photoPosition?: PhotoPosition; // legacy single position
  photos?: PhotoItem[]; // multi-photo support
  mustTry: boolean;
}

export interface FoodEntry extends BaseEntry {
  category: 'food';
  subcategory: FoodSubcategory;
  cuisines: Cuisine[];
  ratings: FoodRatings;
}

export interface PlacesEntry extends BaseEntry {
  category: 'places';
  subcategory: PlacesSubcategory;
  activityTags: ActivityTag[];
  ratings: PlacesRatings;
}

export type GuideEntry = FoodEntry | PlacesEntry;
