import { useState, useRef, useEffect } from 'react';
import type {
  GuideEntry,
  FoodEntry,
  PlacesEntry,
  Cuisine,
  ActivityTag,
  FoodRatings,
  PlacesRatings,
  PhotoPosition,
  PhotoItem,
} from '../../data/types';
import {
  CUISINE_OPTIONS,
  ACTIVITY_TAG_OPTIONS,
  FOOD_SUBCATEGORY_LABELS,
  PLACES_SUBCATEGORY_LABELS,
  FOOD_SPECTRUM_LABELS,
  PLACES_SPECTRUM_LABELS,
} from '../../data/types';

interface AdminPanelProps {
  entry: GuideEntry | null; // null = creating new
  citySlug: string;
  onSave: (entry: GuideEntry) => void;
  onDelete?: (id: string) => void;
  onClose: () => void;
}

function generateId(): string {
  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const DEFAULT_FOOD_RATINGS: FoodRatings = {
  budgetToSplurge: 2,
  quickToSitDown: 2,
  popularToHiddenGem: 2,
};

const DEFAULT_PLACES_RATINGS: PlacesRatings = {
  chillToActive: 2,
  indoorsToOutdoors: 2,
  touristyToSecret: 2,
};

export default function AdminPanel({
  entry,
  onSave,
  onDelete,
  onClose,
}: AdminPanelProps) {
  const isEditing = entry !== null;

  const [category, setCategory] = useState<'food' | 'places'>(
    entry?.category ?? 'places'
  );
  const [name, setName] = useState(entry?.name ?? '');
  const [neighborhood, setNeighborhood] = useState(entry?.neighborhood ?? '');
  const [address, setAddress] = useState(entry?.address ?? '');
  const [lat, setLat] = useState(entry?.coords.lat ?? 0);
  const [lng, setLng] = useState(entry?.coords.lng ?? 0);
  const [review, setReview] = useState(entry?.review ?? '');
  // Multi-photo state -- initialize from photos array or legacy single photo
  const [photos, setPhotos] = useState<PhotoItem[]>(() => {
    if (entry?.photos && entry.photos.length > 0) return [...entry.photos];
    if (entry?.photo) return [{ url: entry.photo, position: entry.photoPosition }];
    return [];
  });
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [mustTry, setMustTry] = useState(entry?.mustTry ?? false);

  const [subcategory, setSubcategory] = useState<string>(
    entry?.subcategory ?? 'city'
  );

  const [cuisines, setCuisines] = useState<Cuisine[]>(
    entry?.category === 'food' ? (entry as FoodEntry).cuisines : []
  );

  const [activityTags, setActivityTags] = useState<ActivityTag[]>(
    entry?.category === 'places' ? (entry as PlacesEntry).activityTags ?? [] : []
  );

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    if (entry) {
      return { ...entry.ratings };
    }
    return category === 'food'
      ? { ...DEFAULT_FOOD_RATINGS }
      : { ...DEFAULT_PLACES_RATINGS };
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragIndexRef = useRef<number | null>(null);
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  // Set up Places Autocomplete
  useEffect(() => {
    if (
      !autocompleteInputRef.current ||
      typeof google === 'undefined' ||
      !google.maps?.places
    ) {
      return;
    }

    const autocomplete = new google.maps.places.Autocomplete(
      autocompleteInputRef.current,
      {
        fields: ['name', 'formatted_address', 'geometry', 'address_components'],
      }
    );

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location) return;

      setName(place.name ?? '');
      setAddress(place.formatted_address ?? '');
      setLat(place.geometry.location.lat());
      setLng(place.geometry.location.lng());

      // Try to extract neighborhood from address components
      const components = place.address_components ?? [];
      const neighborhoodComp = components.find(
        (c) =>
          c.types.includes('neighborhood') ||
          c.types.includes('sublocality') ||
          c.types.includes('sublocality_level_1')
      );
      const localityComp = components.find((c) =>
        c.types.includes('locality')
      );
      setNeighborhood(
        neighborhoodComp?.long_name ?? localityComp?.long_name ?? ''
      );
    });

    autocompleteRef.current = autocomplete;

    return () => {
      google.maps.event.clearInstanceListeners(autocomplete);
    };
  }, []);

  const handleCategoryChange = (newCat: 'food' | 'places') => {
    setCategory(newCat);
    setSubcategory(newCat === 'food' ? 'restaurant' : 'city');
    setRatings(
      newCat === 'food'
        ? { ...DEFAULT_FOOD_RATINGS }
        : { ...DEFAULT_PLACES_RATINGS }
    );
    if (newCat === 'places') {
      setCuisines([]);
    }
    if (newCat === 'food') {
      setActivityTags([]);
    }
  };

  const toggleActivityTag = (tag: ActivityTag) => {
    setActivityTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handlePhotoUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      if (!dataUrl) return;

      // Compress via canvas
      const img = new window.Image();
      img.onload = () => {
        let finalUrl = dataUrl;
        try {
          const canvas = document.createElement('canvas');
          const MAX_SIZE = 800;
          let { width, height } = img;
          if (width > MAX_SIZE || height > MAX_SIZE) {
            if (width > height) {
              height = Math.round((height / width) * MAX_SIZE);
              width = MAX_SIZE;
            } else {
              width = Math.round((width / height) * MAX_SIZE);
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            finalUrl = canvas.toDataURL('image/jpeg', 0.75);
          }
        } catch {
          // Use original dataUrl if compression fails
        }

        const newPhoto: PhotoItem = { url: finalUrl, position: { x: 50, y: 50, zoom: 1 } };
        setPhotos((prev) => {
          setActivePhotoIndex(prev.length);
          return [...prev, newPhoto];
        });
      };
      img.onerror = () => {
        // If image can't be loaded for compression, add the raw data URL
        const newPhoto: PhotoItem = { url: dataUrl, position: { x: 50, y: 50, zoom: 1 } };
        setPhotos((prev) => {
          setActivePhotoIndex(prev.length);
          return [...prev, newPhoto];
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    // Only handle file drops, not thumbnail reorder drops
    if (dragIndexRef.current !== null) return;
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handlePhotoUpload(file);
    }
  };

  const toggleCuisine = (cuisine: Cuisine) => {
    setCuisines((prev) =>
      prev.includes(cuisine)
        ? prev.filter((c) => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const handleSubmit = () => {
    const base: any = {
      id: entry?.id ?? generateId(),
      name,
      neighborhood,
      address,
      coords: { lat, lng },
      review,
      photo: photos.length > 0 ? photos[0].url : '',
      photoPosition: photos.length > 0 ? photos[0].position : undefined,
      photos: photos.length > 0 ? photos : undefined,
      mustTry,
      category,
      subcategory,
      ratings,
    };

    if (category === 'food') {
      base.cuisines = cuisines;
    }
    if (category === 'places') {
      base.activityTags = activityTags;
    }

    onSave(base as GuideEntry);
  };

  const spectrumLabels =
    category === 'food' ? FOOD_SPECTRUM_LABELS : PLACES_SPECTRUM_LABELS;

  const subcategoryOptions =
    category === 'food' ? FOOD_SUBCATEGORY_LABELS : PLACES_SUBCATEGORY_LABELS;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => e.preventDefault()}
    >
      <div className="bg-paper rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-3xl text-ink">
            {isEditing ? 'Edit entry' : 'Add new entry'}
          </h2>
          <button
            onClick={onClose}
            className="text-sepia hover:text-ink text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          {/* Category toggle -- Places first */}
          <div>
            <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
              Category
            </label>
            <div className="flex gap-2">
              {(['places', 'food'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider ${
                    category === cat
                      ? 'bg-terracotta text-paper'
                      : 'bg-ink/5 text-sepia'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Subcategory */}
          <div>
            <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
              Subcategory
            </label>
            <select
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink"
            >
              {Object.entries(subcategoryOptions).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Name with Places Autocomplete */}
          <div>
            <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
              Search place
            </label>
            <input
              ref={autocompleteInputRef}
              type="text"
              defaultValue={name}
              className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink"
              placeholder="Start typing a place name..."
            />
            <p className="font-mono text-[9px] text-sepia/50 mt-1">
              Select from suggestions to auto-fill address and location
            </p>
          </div>

          {/* Name (editable, in case autocomplete doesn't match) */}
          <div>
            <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
              Display name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink"
            />
          </div>

          {/* Neighborhood + Address (auto-filled but editable) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
                Neighborhood
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
                Address
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink"
              />
            </div>
          </div>

          {/* Review */}
          <div>
            <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
              Review
            </label>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink resize-none"
              placeholder="Your personal review..."
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
              Photos ({photos.length})
            </label>

            {/* Photo thumbnails (draggable to reorder) */}
            {photos.length > 0 && (
              <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
                {photos.map((p, i) => (
                  <div
                    key={i}
                    draggable
                    onDragStart={(e) => {
                      dragIndexRef.current = i;
                      e.dataTransfer.effectAllowed = 'move';
                    }}
                    onDragOver={(e) => {
                      // Only accept thumbnail reorder drags, not file drops
                      if (dragIndexRef.current !== null) {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = 'move';
                      }
                    }}
                    onDrop={(e) => {
                      // Only handle thumbnail reorder, not file drops
                      const from = dragIndexRef.current;
                      if (from === null || from === i) return;
                      e.preventDefault();
                      e.stopPropagation();
                      setPhotos((prev) => {
                        const updated = [...prev];
                        const [moved] = updated.splice(from, 1);
                        updated.splice(i, 0, moved);
                        return updated;
                      });
                      if (activePhotoIndex === from) {
                        setActivePhotoIndex(i);
                      } else if (from < activePhotoIndex && i >= activePhotoIndex) {
                        setActivePhotoIndex(activePhotoIndex - 1);
                      } else if (from > activePhotoIndex && i <= activePhotoIndex) {
                        setActivePhotoIndex(activePhotoIndex + 1);
                      }
                      dragIndexRef.current = null;
                    }}
                    onDragEnd={() => { dragIndexRef.current = null; }}
                    className={`relative shrink-0 w-20 h-16 rounded cursor-grab active:cursor-grabbing border-2 transition-all ${
                      i === activePhotoIndex ? 'border-terracotta' : 'border-transparent hover:border-sepia/30'
                    }`}
                    onClick={() => setActivePhotoIndex(i)}
                  >
                    <div
                      className="w-full h-full rounded pointer-events-none"
                      style={{
                        backgroundImage: `url(${p.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setPhotos((prev) => prev.filter((_, idx) => idx !== i));
                        setActivePhotoIndex((prev) => Math.min(prev, Math.max(0, photos.length - 2)));
                      }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-paper rounded-full text-[10px] flex items-center justify-center leading-none"
                    >
                      &times;
                    </button>
                    <span className="absolute bottom-0.5 left-0.5 font-mono text-[8px] text-paper bg-ink/50 rounded px-1">
                      {i + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Active photo preview */}
            {photos.length > 0 && photos[activePhotoIndex] && (
              <div
                className="h-36 rounded mb-3 border border-sepia/15"
                style={{
                  backgroundImage: `url(${photos[activePhotoIndex].url})`,
                  backgroundSize: `${(photos[activePhotoIndex].position?.zoom ?? 1) * 100}%`,
                  backgroundPosition: `${photos[activePhotoIndex].position?.x ?? 50}% ${photos[activePhotoIndex].position?.y ?? 50}%`,
                  backgroundRepeat: 'no-repeat',
                  backgroundColor: '#EDE0C8',
                }}
              />
            )}

            {/* Upload area */}
            <div
              onDrop={handleFileDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-sepia/30 rounded-lg p-3 text-center hover:border-terracotta transition-colors"
            >
              <label className="inline-block px-4 py-1.5 rounded-lg font-mono text-xs uppercase tracking-wider bg-ink/10 text-ink hover:bg-ink/20 cursor-pointer transition-colors">
                {photos.length > 0 ? 'Add another photo' : 'Choose file'}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handlePhotoUpload(file);
                    e.target.value = '';
                  }}
                />
              </label>
              <p className="font-mono text-[9px] text-sepia/40 mt-1">or drag and drop</p>
            </div>

            {/* Position controls for active photo */}
            {photos.length > 0 && photos[activePhotoIndex] && (
              <div className="mt-3 space-y-2 p-3 bg-paper-light rounded-lg border border-sepia/15">
                <p className="font-mono text-[10px] text-sepia uppercase tracking-wider">
                  Adjust photo {activePhotoIndex + 1}
                </p>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-sepia w-8 text-right shrink-0">L/R</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={photos[activePhotoIndex].position?.x ?? 50}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setPhotos((prev) => prev.map((p, i) =>
                        i === activePhotoIndex ? { ...p, position: { ...(p.position ?? { x: 50, y: 50, zoom: 1 }), x: val } } : p
                      ));
                    }}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-sepia w-8 text-right shrink-0">U/D</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={photos[activePhotoIndex].position?.y ?? 50}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setPhotos((prev) => prev.map((p, i) =>
                        i === activePhotoIndex ? { ...p, position: { ...(p.position ?? { x: 50, y: 50, zoom: 1 }), y: val } } : p
                      ));
                    }}
                    className="flex-1"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-sepia w-8 text-right shrink-0">Zoom</span>
                  <input
                    type="range"
                    min={50}
                    max={200}
                    value={(photos[activePhotoIndex].position?.zoom ?? 1) * 100}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) / 100;
                      setPhotos((prev) => prev.map((p, i) =>
                        i === activePhotoIndex ? { ...p, position: { ...(p.position ?? { x: 50, y: 50, zoom: 1 }), zoom: val } } : p
                      ));
                    }}
                    className="flex-1"
                  />
                </div>
                <button
                  onClick={() =>
                    setPhotos((prev) => prev.map((p, i) =>
                      i === activePhotoIndex ? { ...p, position: { x: 50, y: 50, zoom: 1 } } : p
                    ))
                  }
                  className="font-mono text-[10px] text-terracotta underline underline-offset-2"
                >
                  Reset position
                </button>
              </div>
            )}
          </div>

          {/* Angela's Fav toggle */}
          <div className="flex items-center gap-3">
            <label className="font-mono text-xs text-sepia uppercase tracking-wider">
              Angela's Fav
            </label>
            <button
              onClick={() => setMustTry(!mustTry)}
              className={`w-10 h-6 rounded-full transition-colors relative ${
                mustTry ? 'bg-mustard' : 'bg-ink/15'
              }`}
            >
              <div
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-paper shadow transition-transform ${
                  mustTry ? 'translate-x-4' : 'translate-x-0.5'
                }`}
              />
            </button>
            {mustTry && <span className="text-mustard">&#9733;</span>}
          </div>

          {/* Rating sliders */}
          <div>
            <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-2">
              Ratings
            </label>
            <div className="space-y-3">
              {spectrumLabels.map((label) => (
                <div key={label.key} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] text-sepia w-20 text-right shrink-0">
                    {label.left}
                  </span>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    value={ratings[label.key] ?? 3}
                    onChange={(e) =>
                      setRatings((prev) => ({
                        ...prev,
                        [label.key]: parseInt(e.target.value),
                      }))
                    }
                    className="flex-1 accent-terracotta"
                  />
                  <span className="font-mono text-[10px] text-sepia w-20 shrink-0">
                    {label.right}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cuisine multi-select (food only) */}
          {category === 'food' && (
            <div>
              <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
                Cuisines
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CUISINE_OPTIONS.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => toggleCuisine(cuisine)}
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all ${
                      cuisines.includes(cuisine)
                        ? 'bg-moss text-paper'
                        : 'bg-moss/10 text-moss hover:bg-moss/20'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Activity tags multi-select (places only) */}
          {category === 'places' && (
            <div>
              <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
                Activity tags
              </label>
              <div className="flex flex-wrap gap-1.5">
                {ACTIVITY_TAG_OPTIONS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleActivityTag(tag)}
                    className={`px-2 py-0.5 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all ${
                      activityTags.includes(tag)
                        ? 'bg-moss text-paper'
                        : 'bg-moss/10 text-moss hover:bg-moss/20'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-dashed border-sepia/20">
          {isEditing && onDelete ? (
            <button
              onClick={() => {
                if (window.confirm('Delete this entry? This cannot be undone.')) {
                  onDelete(entry!.id);
                }
              }}
              className="font-mono text-xs text-red-600 hover:text-red-800 uppercase tracking-wider"
            >
              Delete
            </button>
          ) : (
            <div />
          )}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider text-sepia hover:text-ink"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider bg-terracotta text-paper hover:bg-coffee transition-colors"
            >
              {isEditing ? 'Save changes' : 'Add entry'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
