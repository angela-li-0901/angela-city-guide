import { useEffect, useRef, useState } from 'react';
import type { GuideEntry, FoodEntry } from '../../data/types';
import type { CityConfig } from '../../data/types';
import { FOOD_SUBCATEGORY_LABELS, PLACES_SUBCATEGORY_LABELS } from '../../data/types';

interface MapViewProps {
  cityConfig: CityConfig;
  entries: GuideEntry[];
  highlightedId?: string | null;
  className?: string;
  onVisibleEntriesChange?: (visibleIds: Set<string>) => void;
}

const MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#f5f0e6' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f0e6' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6e5c4e' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#e8dcc8' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#ddd0b8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c4d4d8' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d4e0c8' }] },
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const SUBCATEGORY_ICON_LABELS: Record<string, string> = {
  // Food
  'restaurant': 'R',
  'coffee-shop': 'C',
  'bar': 'B',
  'dessert': 'D',
  // Places
  'city': 'C',
  'nature': 'N',
  'day-trip': 'T',
};

function waitForGoogle(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
      resolve();
      return;
    }
    const check = setInterval(() => {
      if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
        clearInterval(check);
        resolve();
      }
    }, 200);
  });
}

function makeIcon(entry: GuideEntry, highlighted: boolean): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    scale: highlighted ? 14 : 10,
    fillColor: highlighted ? '#3A2415' : entry.mustTry ? '#D8A536' : '#B86A47',
    fillOpacity: 1,
    strokeColor: highlighted ? '#D8A536' : '#FFF9ED',
    strokeWeight: highlighted ? 3 : 2,
  };
}

export default function MapView({ cityConfig, entries, highlightedId, className, onVisibleEntriesChange }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const entriesRef = useRef(entries);
  entriesRef.current = entries;
  const onVisibleChangeRef = useRef(onVisibleEntriesChange);
  onVisibleChangeRef.current = onVisibleEntriesChange;
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load and initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    let cancelled = false;

    waitForGoogle()
      .then(() => {
        if (cancelled || !mapContainerRef.current) return;

        const map = new google.maps.Map(mapContainerRef.current, {
          center: cityConfig.center,
          zoom: cityConfig.zoom,
          styles: MAP_STYLES,
          gestureHandling: 'greedy',
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        });

        // Sync visible entries when map bounds change
        map.addListener('idle', () => {
          const bounds = map.getBounds();
          if (!bounds || !onVisibleChangeRef.current) return;
          const visible = new Set<string>();
          for (const entry of entriesRef.current) {
            if (bounds.contains(entry.coords)) {
              visible.add(entry.id);
            }
          }
          onVisibleChangeRef.current(visible);
        });

        mapInstanceRef.current = map;
        infoWindowRef.current = new google.maps.InfoWindow();
        setReady(true);
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load Google Maps.');
      });

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current.clear();
    };
  }, [cityConfig]);

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const infoWindow = infoWindowRef.current;
    if (!map || !infoWindow || !ready) return;

    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current.clear();

    entries.forEach((entry) => {
      const marker = new google.maps.Marker({
        position: entry.coords,
        map,
        title: entry.name,
        icon: makeIcon(entry, false),
        label: {
          text: entry.mustTry ? '\u2605' : (SUBCATEGORY_ICON_LABELS[entry.subcategory] ?? entry.name.charAt(0)),
          color: '#FFF9ED',
          fontSize: '10px',
          fontWeight: 'bold',
        },
        zIndex: 1,
      });

      const subcategoryLabel =
        entry.category === 'food'
          ? FOOD_SUBCATEGORY_LABELS[(entry as FoodEntry).subcategory]
          : PLACES_SUBCATEGORY_LABELS[entry.subcategory as keyof typeof PLACES_SUBCATEGORY_LABELS];

      marker.addListener('click', () => {
        infoWindow.setContent(`
          <div style="padding:4px;max-width:200px;font-family:'Nunito',sans-serif">
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
              <strong style="font-size:14px;color:#3A2415">${entry.name}</strong>
              ${entry.mustTry ? '<span style="color:#D8A536">&#9733;</span>' : ''}
            </div>
            <p style="font-size:11px;color:#A67A4E;text-transform:uppercase;letter-spacing:.05em;margin:0">
              ${subcategoryLabel}
            </p>
            <p style="font-size:12px;color:#6e5c4e;margin:2px 0 0">
              ${entry.neighborhood}
            </p>
          </div>
        `);
        infoWindow.open(map, marker);
      });

      markersRef.current.set(entry.id, marker);
    });

    // Auto-fit bounds to show all markers
    if (entries.length > 0) {
      const bounds = new google.maps.LatLngBounds();
      entries.forEach((entry) => bounds.extend(entry.coords));
      map.fitBounds(bounds, { top: 40, right: 40, bottom: 40, left: 40 });

      // Don't zoom in too far if there's only one marker
      const listener = google.maps.event.addListener(map, 'idle', () => {
        const zoom = map.getZoom();
        if (zoom !== undefined && zoom > 15) {
          map.setZoom(15);
        }
        google.maps.event.removeListener(listener);
      });
    } else {
      // No entries -- reset to city default view
      map.setCenter(cityConfig.center);
      map.setZoom(cityConfig.zoom);
    }
  }, [entries, ready, cityConfig]);

  // Highlight marker on hover
  useEffect(() => {
    markersRef.current.forEach((marker, id) => {
      const entry = entries.find((e) => e.id === id);
      if (!entry) return;

      const isHighlighted = id === highlightedId;
      marker.setIcon(makeIcon(entry, isHighlighted));
      marker.setZIndex(isHighlighted ? 100 : 1);

      if (isHighlighted && mapInstanceRef.current) {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(null), 700);
      }
    });
  }, [highlightedId, entries]);

  if (error) {
    return (
      <div className={`bg-sepia/10 rounded-sm flex items-center justify-center border-pamphlet ${className ?? 'h-[500px]'}`}>
        <p className="font-mono text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative rounded-sm overflow-hidden border-pamphlet shadow-card ${className ?? 'h-[500px]'}`}>
      <div ref={mapContainerRef} className="absolute inset-0" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center bg-paper-warm z-10">
          <p className="font-mono text-sm text-sepia animate-pulse">Loading map...</p>
        </div>
      )}
    </div>
  );
}
