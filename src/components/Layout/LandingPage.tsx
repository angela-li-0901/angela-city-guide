import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CITIES } from '../../data/cities';
import {
  getGuestbookEntries,
  addGuestbookEntry,
  deleteGuestbookEntry,
  type GuestbookEntry,
} from '../../data/guestbook';

export default function LandingPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [message, setMessage] = useState('');

  const isAdmin =
    import.meta.env.DEV && window.location.search.includes('admin=true');

  const cityNameMap = Object.fromEntries(CITIES.map((c) => [c.slug, c.name]));

  useEffect(() => {
    loadEntries();
  }, []);

  async function loadEntries() {
    try {
      const data = await getGuestbookEntries();
      setEntries(data);
    } catch (err) {
      console.error('Failed to load guestbook:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      await addGuestbookEntry({
        name: name.trim(),
        city: city,
        message: message.trim(),
      });
      setName('');
      setCity('');
      setMessage('');
      setShowForm(false);
      await loadEntries();
    } catch (err) {
      console.error('Failed to submit:', err);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(entryId: string) {
    if (!window.confirm('Delete this guestbook entry?')) return;
    try {
      await deleteGuestbookEntry(entryId);
      setEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err) {
      console.error('Failed to delete:', err);
    }
  }

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Hero section */}
      <div className="flex flex-col items-center">
        {/* Cover illustration */}
        <div className="w-full max-w-2xl mb-8">
          <img
            src="/cover page.png"
            alt="Angela planning her city guide"
            className="w-full rounded-sm shadow-card border-pamphlet"
          />
        </div>

        {/* Title block */}
        <div className="text-center mb-4">
          <p className="font-mono text-[10px] text-terracotta uppercase tracking-[0.3em] mb-3">
            Est. 2026
          </p>
          <h1 className="font-display text-7xl sm:text-8xl lg:text-9xl text-ink leading-none mb-1">
            Angela's
          </h1>
          <p className="font-mono text-xs text-sepia uppercase tracking-[0.25em]">
            Very Personal
          </p>
          <h2 className="font-display text-5xl sm:text-6xl text-ink mt-1">
            City Guide
          </h2>
        </div>

        {/* Decorative flourish */}
        <div className="flex items-center gap-3 my-6">
          <div className="w-12 border-t border-sepia/30" />
          <span className="text-terracotta text-lg">&#10043;</span>
          <div className="w-12 border-t border-sepia/30" />
        </div>

        {/* Tagline */}
        <p className="font-body text-sm text-sepia max-w-sm text-center mb-10 leading-relaxed">
          A curated collection of my favorite restaurants, coffee shops,
          and places to explore in the cities I've called home.
        </p>

        {/* City cards */}
        <div className="flex flex-wrap justify-center gap-6 mb-8">
          {CITIES.map((city) => (
            <Link
              key={city.slug}
              to={`/${city.slug}`}
              className="group block w-60"
            >
              <div className="bg-cream border-pamphlet rounded-sm p-8 text-center shadow-soft transition-all duration-300 group-hover:shadow-card group-hover:-translate-y-1.5 relative overflow-hidden">
                <div className="absolute top-2 left-2 w-3 h-3 border-t border-l border-sepia/25" />
                <div className="absolute top-2 right-2 w-3 h-3 border-t border-r border-sepia/25" />
                <div className="absolute bottom-2 left-2 w-3 h-3 border-b border-l border-sepia/25" />
                <div className="absolute bottom-2 right-2 w-3 h-3 border-b border-r border-sepia/25" />

                <h3 className="font-display text-5xl text-ink mb-2">
                  {city.name}
                </h3>
                <p className="font-mono text-[10px] text-terracotta uppercase tracking-[0.2em]">
                  {city.subtitle}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <p className="font-mono text-[10px] text-sepia/50 uppercase tracking-widest mb-2">
          Pick a city &middot; Explore my picks
        </p>
      </div>

      {/* Guestbook section */}
      <div id="guestbook" className="max-w-2xl mx-auto mt-16">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="flex-1 max-w-24 border-t border-sepia/25" />
          <span className="font-mono text-[10px] text-sepia/50 uppercase tracking-[0.2em]">
            Guestbook
          </span>
          <div className="flex-1 max-w-24 border-t border-sepia/25" />
        </div>

        <p className="font-body text-sm text-sepia/70 text-center mb-6 max-w-md mx-auto">
          Been to a place on my guide? Have a suggestion for somewhere I should add?
          Or just want to say hi? Leave a note -- I'd love to hear from you!
        </p>

        {/* Sign the guestbook button */}
        {!showForm && (
          <div className="text-center mb-8">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-sm font-mono text-xs uppercase tracking-wider bg-terracotta text-paper hover:bg-coffee transition-colors shadow-soft"
            >
              &#9998; Leave a note
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-cream border-pamphlet rounded-sm p-6 mb-8 shadow-soft"
          >
            <div className="space-y-4">
              <div>
                <label className="block font-mono text-[10px] text-sepia uppercase tracking-wider mb-1">
                  Your name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink"
                  placeholder="Anonymous"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] text-sepia uppercase tracking-wider mb-1">
                  City visited (optional)
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink"
                >
                  <option value="">-- Select a city --</option>
                  {CITIES.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] text-sepia uppercase tracking-wider mb-1">
                  Your message
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink resize-none"
                  placeholder="Tried Neptune Oyster and the lobster roll was unreal... / You should add this amazing ramen spot in Cambridge... / Just wanted to say this guide is so cute!"
                  required
                />
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider text-sepia hover:text-ink"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !message.trim()}
                  className="px-4 py-2 rounded-lg font-mono text-xs uppercase tracking-wider bg-terracotta text-paper hover:bg-coffee transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Sending...' : 'Leave note'}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Guestbook entries */}
        {loading ? (
          <p className="text-center font-mono text-sm text-sepia animate-pulse">
            Loading notes...
          </p>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <p className="font-display text-3xl text-sepia/30 mb-2">
              No notes yet
            </p>
            <p className="font-body text-sm text-sepia/50">
              Be the first to leave a note!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-cream border-pamphlet rounded-sm p-5 shadow-soft relative"
              >
                <div className="absolute top-1.5 left-1.5 w-2 h-2 border-t border-l border-sepia/15" />
                <div className="absolute top-1.5 right-1.5 w-2 h-2 border-t border-r border-sepia/15" />

                <p className="font-body text-sm text-ink/80 leading-relaxed italic mb-3">
                  "{entry.message}"
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink font-semibold">
                      {entry.name}
                    </span>
                    {entry.city && cityNameMap[entry.city] && (
                      <span className="font-mono text-[10px] text-terracotta uppercase">
                        {cityNameMap[entry.city]}
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-[10px] text-sepia/50">
                    {entry.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {isAdmin && (
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="absolute bottom-1.5 right-1.5 font-mono text-[9px] text-red-500 hover:text-red-700"
                  >
                    delete
                  </button>
                )}

                <div className="absolute bottom-1.5 left-1.5 w-2 h-2 border-b border-l border-sepia/15" />
              </div>
            ))}
          </div>
        )}

        {/* Bottom decoration */}
        <div className="flex items-center justify-center gap-3 mt-10">
          <div className="flex-1 max-w-24 border-t border-sepia/25" />
          <span className="text-sepia/30 text-xs">&#9830;</span>
          <div className="flex-1 max-w-24 border-t border-sepia/25" />
        </div>
      </div>
    </div>
  );
}
