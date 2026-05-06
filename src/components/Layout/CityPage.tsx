import { useParams, Navigate, useSearchParams } from 'react-router-dom';
import { getCityBySlug } from '../../data/cities';
import { loadEntries, saveEntries, savePhoto } from '../../data/storage';
import type { GuideEntry, FoodEntry, PlacesEntry, Cuisine, ActivityTag } from '../../data/types';
import { useState, useMemo, useCallback, useEffect } from 'react';
import CardGrid from '../Cards/CardGrid';
import CategoryTabs from '../Filters/CategoryTabs';
import FilterBar from '../Filters/FilterBar';
import MapView from '../Map/MapView';
import { ratingMatchesPriceLevel } from '../Filters/PriceFilter';

import AdminPanel from '../Admin/AdminPanel';
import AdminToolbar from '../Admin/AdminToolbar';
import Header from './Header';
import CoverPage from '../Cover/CoverPage';

export default function CityPage() {
  const { city: citySlug } = useParams<{ city: string }>();
  const [searchParams] = useSearchParams();
  const cityConfig = citySlug ? getCityBySlug(citySlug) : undefined;

  const isAdmin =
    import.meta.env.DEV && searchParams.get('admin') === 'true';

  const [entries, setEntries] = useState<GuideEntry[]>(() =>
    citySlug ? loadEntries(citySlug) : []
  );

  // Reload entries when city changes
  useEffect(() => {
    if (citySlug) {
      setEntries(loadEntries(citySlug));
      setActiveTab('places');
      setSubcategory(null);
      setCuisines([]);
      setPrices([]);
      setMustTry(false);
      setActivityTags([]);
    }
  }, [citySlug]);

  // Admin state
  const [editingEntry, setEditingEntry] = useState<GuideEntry | null | 'new'>(null);

  // Hover state for card-map interaction
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Filter state
  const [activeTab, setActiveTab] = useState<'food' | 'places'>('places');
  const [subcategory, setSubcategory] = useState<string | null>(null);
  const [cuisines, setCuisines] = useState<Cuisine[]>([]);
  const [prices, setPrices] = useState<number[]>([]);
  const [mustTry, setMustTry] = useState(false);
  const [activityTags, setActivityTags] = useState<ActivityTag[]>([]);
  const [visibleOnMap, setVisibleOnMap] = useState<Set<string> | null>(null);

  const handleVisibleEntriesChange = useCallback((visibleIds: Set<string>) => {
    setVisibleOnMap(visibleIds);
  }, []);

  const handleTabChange = useCallback((tab: 'food' | 'places') => {
    setActiveTab(tab);
    setSubcategory(null);
    setCuisines([]);
    setPrices([]);
    setMustTry(false);
    setActivityTags([]);
  }, []);

  const hasActiveFilters =
    subcategory !== null ||
    cuisines.length > 0 ||
    prices.length > 0 ||
    activityTags.length > 0 ||
    mustTry;

  const clearFilters = useCallback(() => {
    setSubcategory(null);
    setCuisines([]);
    setPrices([]);
    setMustTry(false);
    setActivityTags([]);
  }, []);

  // Apply all filters
  const filteredEntries = useMemo(() => {
    let result = entries.filter((e) => e.category === activeTab);

    if (subcategory) {
      result = result.filter((e) => e.subcategory === subcategory);
    }

    if (mustTry) {
      result = result.filter((e) => e.mustTry);
    }

    if (activeTab === 'food') {
      if (cuisines.length > 0) {
        result = result.filter((e) => {
          const food = e as FoodEntry;
          return food.cuisines.some((c) => cuisines.includes(c));
        });
      }

      if (prices.length > 0) {
        result = result.filter((e) => {
          const food = e as FoodEntry;
          return prices.some((p) =>
            ratingMatchesPriceLevel(food.ratings.budgetToSplurge, p)
          );
        });
      }
    }

    // Places-specific filters
    if (activeTab === 'places') {
      if (activityTags.length > 0) {
        result = result.filter((e) => {
          const place = e as PlacesEntry;
          return place.activityTags?.some((t) => activityTags.includes(t));
        });
      }
    }

    // Sort: Angela's Favs first, then by subcategory, then alphabetically
    result.sort((a, b) => {
      // Favs first
      if (a.mustTry !== b.mustTry) return a.mustTry ? -1 : 1;
      // Then by subcategory alphabetically
      if (a.subcategory !== b.subcategory) return a.subcategory.localeCompare(b.subcategory);
      // Then by name
      return a.name.localeCompare(b.name);
    });

    return result;
  }, [entries, activeTab, subcategory, cuisines, prices, mustTry, activityTags]);

  // Cards filtered by map bounds (only show what's visible on the map)
  const visibleEntries = useMemo(() => {
    if (!visibleOnMap) return filteredEntries;
    return filteredEntries.filter((e) => visibleOnMap.has(e.id));
  }, [filteredEntries, visibleOnMap]);

  // Admin handlers
  const handleSaveEntry = useCallback(
    async (entry: GuideEntry) => {
      // Save all base64 photos to files via dev API
      if (entry.photos && entry.photos.length > 0) {
        const savedPhotos = await Promise.all(
          entry.photos.map(async (p, i) => {
            if (p.url.startsWith('data:')) {
              const photoPath = await savePhoto(`${entry.id}-${i}`, p.url);
              return { ...p, url: photoPath };
            }
            return p;
          })
        );
        entry = { ...entry, photos: savedPhotos, photo: savedPhotos[0]?.url ?? '' };
      } else if (entry.photo && entry.photo.startsWith('data:')) {
        const photoPath = await savePhoto(entry.id, entry.photo);
        entry = { ...entry, photo: photoPath };
      }

      setEntries((prev) => {
        const existing = prev.findIndex((e) => e.id === entry.id);
        const updated =
          existing >= 0
            ? prev.map((e) => (e.id === entry.id ? entry : e))
            : [...prev, entry];
        if (citySlug) saveEntries(citySlug, updated);
        return updated;
      });
      setEditingEntry(null);
    },
    [citySlug]
  );

  const handleDeleteEntry = useCallback(
    (id: string) => {
      setEntries((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        if (citySlug) saveEntries(citySlug, updated);
        return updated;
      });
      setEditingEntry(null);
    },
    [citySlug]
  );

  const handleImport = useCallback(
    (imported: GuideEntry[]) => {
      setEntries(imported);
      if (citySlug) saveEntries(citySlug, imported);
    },
    [citySlug]
  );

  const handleCardClick = useCallback(
    (entry: GuideEntry) => {
      if (isAdmin) {
        setEditingEntry(entry);
      }
    },
    [isAdmin]
  );

  const handleCardHover = useCallback((entry: GuideEntry | null) => {
    setHoveredId(entry?.id ?? null);
  }, []);

  if (!cityConfig) {
    return <Navigate to="/" replace />;
  }

  return (
    <div
      className="min-h-screen"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <Header />

      {/* Cover page with city illustration */}
      <CoverPage cityConfig={cityConfig} entryCount={entries.length} />

      {/* Controls area */}
      <div className="px-4 sm:px-6 pt-6 pb-4 space-y-4">
        <CategoryTabs activeTab={activeTab} onTabChange={handleTabChange} />
        <FilterBar
          category={activeTab}
          subcategory={subcategory}
          onSubcategoryChange={setSubcategory}
          cuisines={cuisines}
          onCuisinesChange={setCuisines}
          prices={prices}
          onPricesChange={setPrices}
          activityTags={activityTags}
          onActivityTagsChange={setActivityTags}
          mustTry={mustTry}
          onMustTryChange={setMustTry}
          hasActiveFilters={hasActiveFilters}
          onClearFilters={clearFilters}
        />
      </div>

      {/* Split view: Cards + Map (full width like Airbnb) */}
      <div className="pb-16">
        <div className="flex flex-col lg:flex-row">
          {/* Cards panel (scrollable, ~60% width) */}
          <div className="lg:w-[60%] lg:max-h-[calc(100vh-80px)] lg:overflow-y-auto px-4 sm:px-6 py-4">
            <CardGrid
              entries={visibleEntries}
              onCardClick={handleCardClick}
              onCardHover={handleCardHover}
              highlightedId={hoveredId}
            />
          </div>

          {/* Map panel (sticky, ~40% width, flush to right edge) */}
          <div className="lg:w-[40%] lg:sticky lg:top-0 lg:self-start lg:h-[calc(100vh-80px)] px-4 lg:px-0 lg:pr-0 py-4 lg:py-0">
            <MapView
              cityConfig={cityConfig}
              entries={filteredEntries}
              highlightedId={hoveredId}
              className="h-[400px] lg:h-full lg:rounded-none"
              onVisibleEntriesChange={handleVisibleEntriesChange}
            />
          </div>
        </div>
      </div>

      {/* Admin UI (dev only) */}
      {isAdmin && (
        <AdminToolbar
          citySlug={citySlug!}
          entries={entries}
          onAdd={() => setEditingEntry('new')}
          onImport={handleImport}
        />
      )}

      {isAdmin && editingEntry !== null && (
        <AdminPanel
          entry={editingEntry === 'new' ? null : editingEntry}
          citySlug={citySlug!}
          onSave={handleSaveEntry}
          onDelete={handleDeleteEntry}
          onClose={() => setEditingEntry(null)}
        />
      )}
    </div>
  );
}
