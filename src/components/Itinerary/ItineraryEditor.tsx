import { useState, useRef } from 'react';
import type { Itinerary, ItineraryDay, GuideEntry } from '../../data/types';

interface ItineraryEditorProps {
  itinerary: Itinerary | null; // null = creating new
  entries: GuideEntry[];
  onSave: (itinerary: Itinerary) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function ItineraryEditor({
  itinerary,
  entries,
  onSave,
  onDelete,
  onClose,
}: ItineraryEditorProps) {
  const [name, setName] = useState(itinerary?.name ?? '');
  const [description, setDescription] = useState(itinerary?.description ?? '');
  const [days, setDays] = useState<ItineraryDay[]>(
    itinerary?.days ?? [{ title: 'Day 1', stops: [] }]
  );

  const entryMap = new Map(entries.map((e) => [e.id, e]));
  const dragStopRef = useRef<{ dayIdx: number; stopIdx: number } | null>(null);

  const addDay = () => {
    setDays((prev) => [...prev, { title: `Day ${prev.length + 1}`, stops: [] }]);
  };

  const removeDay = (dayIdx: number) => {
    if (!window.confirm('Remove this day and all its stops?')) return;
    setDays((prev) => prev.filter((_, i) => i !== dayIdx));
  };

  const updateDayTitle = (dayIdx: number, title: string) => {
    setDays((prev) => prev.map((d, i) => (i === dayIdx ? { ...d, title } : d)));
  };

  const addStop = (dayIdx: number, entryId: string) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, stops: [...d.stops, { entryId, note: '' }] }
          : d
      )
    );
  };

  const removeStop = (dayIdx: number, stopIdx: number) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? { ...d, stops: d.stops.filter((_, si) => si !== stopIdx) }
          : d
      )
    );
  };

  const updateStopNote = (dayIdx: number, stopIdx: number, note: string) => {
    setDays((prev) =>
      prev.map((d, i) =>
        i === dayIdx
          ? {
              ...d,
              stops: d.stops.map((s, si) =>
                si === stopIdx ? { ...s, note } : s
              ),
            }
          : d
      )
    );
  };

  // Get entry IDs already used in the itinerary
  const usedIds = new Set(days.flatMap((d) => d.stops.map((s) => s.entryId)));

  const handleSubmit = () => {
    if (!name.trim()) return;
    onSave({ name: name.trim(), description: description.trim(), days });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4">
      <div className="bg-paper rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-3xl text-ink">
            {itinerary ? 'Edit itinerary' : 'New itinerary'}
          </h2>
          <button
            onClick={onClose}
            className="text-sepia hover:text-ink text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
              Itinerary name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink"
              placeholder="Weekend in Boston"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block font-mono text-xs text-sepia uppercase tracking-wider mb-1">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink"
              placeholder="Two days hitting the highlights..."
            />
          </div>

          {/* Days */}
          <div className="space-y-6">
            {days.map((day, dayIdx) => (
              <div key={dayIdx} className="border border-sepia/20 rounded-lg p-4 bg-paper-light">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full bg-terracotta text-paper flex items-center justify-center font-mono text-xs font-bold shrink-0">
                    {dayIdx + 1}
                  </div>
                  <input
                    type="text"
                    value={day.title}
                    onChange={(e) => updateDayTitle(dayIdx, e.target.value)}
                    className="flex-1 px-2 py-1 rounded border border-sepia/20 bg-paper font-display text-xl text-ink"
                  />
                  {days.length > 1 && (
                    <button
                      onClick={() => removeDay(dayIdx)}
                      className="font-mono text-[10px] text-red-500 hover:text-red-700 uppercase"
                    >
                      Remove day
                    </button>
                  )}
                </div>

                {/* Stops */}
                <div className="space-y-2 mb-3">
                  {day.stops.map((stop, stopIdx) => {
                    const entry = entryMap.get(stop.entryId);
                    return (
                      <div
                        key={`${stop.entryId}-${stopIdx}`}
                        draggable
                        onDragStart={() => {
                          dragStopRef.current = { dayIdx, stopIdx };
                        }}
                        onDragOver={(e) => {
                          if (dragStopRef.current) e.preventDefault();
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const from = dragStopRef.current;
                          if (!from) return;
                          if (from.dayIdx === dayIdx && from.stopIdx === stopIdx) return;

                          setDays((prev) => {
                            const updated = prev.map((d) => ({ ...d, stops: [...d.stops] }));
                            const [moved] = updated[from.dayIdx].stops.splice(from.stopIdx, 1);
                            updated[dayIdx].stops.splice(stopIdx, 0, moved);
                            return updated;
                          });
                          dragStopRef.current = null;
                        }}
                        onDragEnd={() => { dragStopRef.current = null; }}
                        className="flex items-center gap-2 bg-cream rounded-sm p-2 border border-sepia/10 cursor-grab active:cursor-grabbing"
                      >
                        <span className="font-mono text-[10px] text-terracotta font-bold shrink-0 w-5 text-center">
                          {stopIdx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-body text-sm text-ink truncate">
                            {entry?.name ?? stop.entryId}
                          </p>
                          <input
                            type="text"
                            value={stop.note ?? ''}
                            onChange={(e) => updateStopNote(dayIdx, stopIdx, e.target.value)}
                            className="w-full mt-1 px-2 py-0.5 rounded border border-sepia/15 bg-paper font-body text-xs text-sepia"
                            placeholder="Add a tip..."
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                        <button
                          onClick={() => removeStop(dayIdx, stopIdx)}
                          className="text-red-400 hover:text-red-600 text-sm shrink-0"
                        >
                          &times;
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add stop dropdown */}
                <select
                  value=""
                  onChange={(e) => {
                    if (e.target.value) addStop(dayIdx, e.target.value);
                  }}
                  className="w-full px-3 py-2 rounded-lg border border-dashed border-sepia/30 bg-paper font-body text-sm text-sepia"
                >
                  <option value="">+ Add a stop...</option>
                  {entries
                    .filter((e) => !usedIds.has(e.id) || day.stops.some((s) => s.entryId === e.id))
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.name} ({e.category === 'food' ? 'Food' : 'Places'})
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>

          {/* Add day button */}
          <button
            onClick={addDay}
            className="w-full py-2 rounded-lg border border-dashed border-sepia/30 font-mono text-xs text-sepia hover:text-ink hover:border-sepia/50 uppercase tracking-wider transition-colors"
          >
            + Add another day
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-dashed border-sepia/20">
          {itinerary && onDelete ? (
            <button
              onClick={() => {
                if (window.confirm('Delete this itinerary?')) onDelete();
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
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider bg-terracotta text-paper hover:bg-coffee transition-colors disabled:opacity-50"
            >
              {itinerary ? 'Save changes' : 'Create itinerary'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
