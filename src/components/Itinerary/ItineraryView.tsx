import type { Itinerary, GuideEntry } from '../../data/types';

interface ItineraryViewProps {
  itinerary: Itinerary;
  entries: GuideEntry[];
  onStopHover?: (entry: GuideEntry | null) => void;
}

function getGoogleMapsUrl(entry: GuideEntry): string {
  const query = encodeURIComponent(`${entry.name}, ${entry.address}`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
}

export default function ItineraryView({ itinerary, entries, onStopHover }: ItineraryViewProps) {
  const entryMap = new Map(entries.map((e) => [e.id, e]));

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-4xl text-ink mb-1">{itinerary.name}</h2>
        <p className="font-body text-sm text-sepia/70">{itinerary.description}</p>
      </div>

      <div className="space-y-8">
        {itinerary.days.map((day, dayIdx) => (
          <div key={dayIdx}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-terracotta text-paper flex items-center justify-center font-mono text-sm font-bold">
                {dayIdx + 1}
              </div>
              <h3 className="font-display text-2xl text-ink">{day.title}</h3>
            </div>

            <div className="ml-4 border-l-2 border-dashed border-sepia/20 pl-6 space-y-1">
              {day.stops.map((stop, stopIdx) => {
                const entry = entryMap.get(stop.entryId);
                if (!entry) return null;

                return (
                  <div
                    key={stop.entryId}
                    className="relative group"
                    onMouseEnter={() => onStopHover?.(entry)}
                    onMouseLeave={() => onStopHover?.(null)}
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-[31px] top-4 w-3 h-3 rounded-full bg-paper border-2 border-terracotta group-hover:bg-terracotta transition-colors" />

                    <div className="bg-cream border-pamphlet rounded-sm p-4 shadow-soft hover:shadow-card transition-all">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          {/* Stop number + name */}
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-mono text-[10px] text-terracotta font-bold">
                              {stopIdx + 1}.
                            </span>
                            <h4 className="font-display text-xl text-ink truncate">
                              {entry.name}
                            </h4>
                            {entry.mustTry && (
                              <span className="text-mustard text-sm shrink-0">&#9733;</span>
                            )}
                          </div>

                          {/* Neighborhood */}
                          <p className="font-mono text-[10px] text-sepia uppercase tracking-wider mb-1">
                            {entry.neighborhood}
                          </p>

                          {/* Tip/note */}
                          {stop.note && (
                            <p className="font-body text-xs text-ink/60 italic">
                              {stop.note}
                            </p>
                          )}
                        </div>

                        {/* Photo thumbnail */}
                        {(entry.photos?.[0]?.url || entry.photo) && (
                          <div
                            className="w-16 h-16 rounded-sm shrink-0 bg-paper-warm"
                            style={{
                              backgroundImage: `url(${entry.photos?.[0]?.url || entry.photo})`,
                              backgroundSize: 'cover',
                              backgroundPosition: 'center',
                            }}
                          />
                        )}
                      </div>

                      {/* Google Maps link */}
                      <a
                        href={getGoogleMapsUrl(entry)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 font-mono text-[10px] text-sepia/50 hover:text-terracotta uppercase tracking-wider transition-colors"
                      >
                        <span>&#9737;</span> Google Maps
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
