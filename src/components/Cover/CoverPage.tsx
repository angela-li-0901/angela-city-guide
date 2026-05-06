import type { CityConfig } from '../../data/types';

interface CoverPageProps {
  cityConfig: CityConfig;
  entryCount: number;
}

// Map city slugs to cover images in /public
const COVER_IMAGES: Record<string, string> = {
  'boston': '/Boston.png',
};

export default function CoverPage({ cityConfig, entryCount }: CoverPageProps) {
  const coverImage = COVER_IMAGES[cityConfig.slug];

  return (
    <div className="relative bg-cream border-b border-dashed border-sepia/25">
      <div className="max-w-3xl mx-auto px-4 py-8 text-center">
        {/* Top decorative line */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="flex-1 max-w-20 border-t border-sepia/25" />
          <span className="font-mono text-[9px] text-sepia/50 uppercase tracking-[0.3em]">
            Vol. 1 &middot; {new Date().getFullYear()}
          </span>
          <div className="flex-1 max-w-20 border-t border-sepia/25" />
        </div>

        {/* Cover illustration or fallback title */}
        {coverImage ? (
          <div className="mb-4">
            <img
              src={coverImage}
              alt={`${cityConfig.name} illustrated map`}
              className="w-full rounded-sm shadow-card border-pamphlet"
            />
          </div>
        ) : (
          <>
            <h1 className="font-display text-6xl sm:text-8xl text-ink leading-none mb-1">
              {cityConfig.name}
            </h1>
            <div className="flex items-center justify-center gap-3 my-3">
              <div className="w-10 border-t border-terracotta/40" />
              <span className="text-terracotta text-sm">&#10043;</span>
              <div className="w-10 border-t border-terracotta/40" />
            </div>
          </>
        )}

        {/* Subtitle */}
        <p className="font-mono text-[10px] text-terracotta uppercase tracking-[0.25em] mb-3">
          Angela's Very Personal Guide
        </p>

        {/* Stats */}
        <p className="font-body text-sm text-sepia/60">
          {entryCount} curated {entryCount === 1 ? 'recommendation' : 'recommendations'}
        </p>

        {/* Bottom decorative line */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <div className="flex-1 max-w-20 border-t border-sepia/25" />
          <span className="text-sepia/30 text-xs">&#9830;</span>
          <div className="flex-1 max-w-20 border-t border-sepia/25" />
        </div>
      </div>
    </div>
  );
}
