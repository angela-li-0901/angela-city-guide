import { useState } from 'react';
import type { GuideEntry, FoodEntry, PlacesEntry, PhotoItem } from '../../data/types';
import HeartButton from './HeartButton';
import {
  FOOD_SPECTRUM_LABELS,
  PLACES_SPECTRUM_LABELS,
  FOOD_SUBCATEGORY_LABELS,
  PLACES_SUBCATEGORY_LABELS,
} from '../../data/types';
import SpectrumBar from './SpectrumBar';

interface GuideCardProps {
  entry: GuideEntry;
  onClick?: () => void;
  onHover?: (entry: GuideEntry | null) => void;
  highlighted?: boolean;
}

function isFoodEntry(entry: GuideEntry): entry is FoodEntry {
  return entry.category === 'food';
}

function isPlacesEntry(entry: GuideEntry): entry is PlacesEntry {
  return entry.category === 'places';
}

function getGoogleMapsUrl(entry: GuideEntry): string {
  const query = encodeURIComponent(`${entry.name}, ${entry.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

function getPhotos(entry: GuideEntry): PhotoItem[] {
  // Use photos array if available, fall back to legacy single photo
  if (entry.photos && entry.photos.length > 0) {
    return entry.photos;
  }
  if (entry.photo) {
    return [{ url: entry.photo, position: entry.photoPosition }];
  }
  return [];
}

export default function GuideCard({ entry, onClick, onHover, highlighted }: GuideCardProps) {
  const [photoIndex, setPhotoIndex] = useState(0);
  const rotation = ((entry.id.charCodeAt(entry.id.length - 1) % 5) - 2) * 0.6;

  const subcategoryLabel = isFoodEntry(entry)
    ? FOOD_SUBCATEGORY_LABELS[entry.subcategory]
    : PLACES_SUBCATEGORY_LABELS[entry.subcategory];

  const spectrumLabels = isFoodEntry(entry)
    ? FOOD_SPECTRUM_LABELS
    : PLACES_SPECTRUM_LABELS;

  const ratings = entry.ratings;
  const photos = getPhotos(entry);
  const currentPhoto = photos[photoIndex];
  const hasMultiplePhotos = photos.length > 1;

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((i) => (i - 1 + photos.length) % photos.length);
  };

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPhotoIndex((i) => (i + 1) % photos.length);
  };

  return (
    <div
      className={`card-tilt bg-cream rounded-sm shadow-card overflow-hidden cursor-pointer border-pamphlet relative transition-all duration-200 ${
        highlighted ? 'ring-2 ring-terracotta ring-offset-2 ring-offset-paper scale-[1.02]' : ''
      }`}
      style={{ transform: highlighted ? 'rotate(0deg)' : `rotate(${rotation}deg)` }}
      onClick={onClick}
      onMouseEnter={() => onHover?.(entry)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Corner decorations */}
      <div className="absolute top-1.5 left-1.5 w-2.5 h-2.5 border-t border-l border-sepia/20 z-10 pointer-events-none" />
      <div className="absolute top-1.5 right-1.5 w-2.5 h-2.5 border-t border-r border-sepia/20 z-10 pointer-events-none" />

      {/* Photo carousel */}
      <div className="relative h-44 bg-paper-warm overflow-hidden group">
        {currentPhoto ? (
          <div
            className="w-full h-full"
            role="img"
            aria-label={entry.name}
            style={{
              backgroundImage: `url(${currentPhoto.url})`,
              backgroundSize: `${(currentPhoto.position?.zoom ?? 1) * 100}%`,
              backgroundPosition: `${currentPhoto.position?.x ?? 50}% ${currentPhoto.position?.y ?? 50}%`,
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-paper-warm to-paper">
            <span className="font-display text-5xl text-sepia/20">
              {entry.name.charAt(0)}
            </span>
          </div>
        )}

        {/* Carousel arrows */}
        {hasMultiplePhotos && (
          <>
            <button
              onClick={prevPhoto}
              className="absolute left-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-paper/80 text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-paper text-sm"
            >
              &#8249;
            </button>
            <button
              onClick={nextPhoto}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-paper/80 text-ink flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-paper text-sm"
            >
              &#8250;
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === photoIndex ? 'bg-paper w-3' : 'bg-paper/50'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        {/* Angela's Fav badge */}
        {entry.mustTry && (
          <div className="absolute top-2 right-2 stamp text-mustard border-mustard bg-cream/90 shadow-sm">
            <span className="mr-1">&#9733;</span> Angela's Fav
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Subcategory badge + cuisine tags */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          <span className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-terracotta/12 text-terracotta rounded-sm">
            {subcategoryLabel}
          </span>
          {isFoodEntry(entry) &&
            entry.cuisines.map((cuisine) => (
              <span
                key={cuisine}
                className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-moss/12 text-moss rounded-sm"
              >
                {cuisine}
              </span>
            ))}
          {isPlacesEntry(entry) &&
            entry.activityTags?.map((tag) => (
              <span
                key={tag}
                className="inline-block px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider bg-moss/12 text-moss rounded-sm"
              >
                {tag}
              </span>
            ))}
        </div>

        {/* Name */}
        <h3 className="font-display text-3xl text-ink leading-tight mb-0.5">
          {entry.name}
        </h3>

        {/* Neighborhood */}
        <p className="font-mono text-[10px] text-terracotta uppercase tracking-[0.15em] mb-3">
          &#9702; {entry.neighborhood}
        </p>

        {/* Review */}
        {entry.review && (
          <p className="font-body text-[13px] text-ink/75 leading-relaxed mb-4 italic">
            "{entry.review}"
          </p>
        )}

        {/* Spectrum bars */}
        <div className="space-y-2 pt-3 border-t border-dashed border-sepia/20">
          {spectrumLabels.map((label) => (
            <SpectrumBar
              key={label.key}
              leftLabel={label.left}
              rightLabel={label.right}
              value={(ratings as unknown as Record<string, number>)[label.key]}
            />
          ))}
        </div>

        {/* Actions row */}
        <div className="mt-4 pt-3 border-t border-dashed border-sepia/15 flex items-center justify-between">
          <a
            href={getGoogleMapsUrl(entry)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm font-mono text-xs text-sepia hover:text-terracotta hover:bg-terracotta/8 uppercase tracking-wider transition-colors"
          >
            <span className="text-base">&#9737;</span> Google Maps
          </a>
          <HeartButton entryId={entry.id} />
        </div>
      </div>

      {/* Bottom corner decorations */}
      <div className="absolute bottom-1.5 left-1.5 w-2.5 h-2.5 border-b border-l border-sepia/20 pointer-events-none" />
      <div className="absolute bottom-1.5 right-1.5 w-2.5 h-2.5 border-b border-r border-sepia/20 pointer-events-none" />
    </div>
  );
}
