import type { GuideEntry } from '../../data/types';
import GuideCard from './GuideCard';

interface CardGridProps {
  entries: GuideEntry[];
  onCardClick?: (entry: GuideEntry) => void;
  onCardHover?: (entry: GuideEntry | null) => void;
  highlightedId?: string | null;
}

export default function CardGrid({ entries, onCardClick, onCardHover, highlightedId }: CardGridProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-8 border-t border-sepia/20" />
          <span className="text-sepia/30 text-sm">&#10043;</span>
          <div className="w-8 border-t border-sepia/20" />
        </div>
        <p className="font-display text-4xl text-sepia/30 mb-2">
          Nothing here yet
        </p>
        <p className="font-body text-sm text-sepia/50">
          No matches found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      {entries.map((entry) => (
        <GuideCard
          key={entry.id}
          entry={entry}
          onClick={() => onCardClick?.(entry)}
          onHover={onCardHover}
          highlighted={highlightedId === entry.id}
        />
      ))}
    </div>
  );
}
