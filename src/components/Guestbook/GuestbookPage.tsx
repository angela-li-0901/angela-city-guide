import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CITIES } from '../../data/cities';
import {
  getGuestbookEntries,
  addGuestbookEntry,
  deleteGuestbookEntry,
  type GuestbookEntry,
} from '../../data/guestbook';

export default function GuestbookPage() {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [city, setCity] = useState(CITIES[0]?.slug ?? '');
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const isAdmin =
    import.meta.env.DEV && window.location.search.includes('admin=true');

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
        city,
        message: message.trim(),
      });
      setName('');
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

  const cityNameMap = Object.fromEntries(CITIES.map((c) => [c.slug, c.name]));

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-dashed border-sepia/25 bg-cream/50">
        <Link
          to="/"
          className="font-display text-2xl text-ink hover:text-terracotta transition-colors"
        >
          Angela's Guide
        </Link>
        <nav className="flex items-center gap-1">
          {CITIES.map((c) => (
            <Link
              key={c.slug}
              to={`/${c.slug}`}
              className="px-3 py-1.5 rounded-sm font-mono text-[11px] uppercase tracking-wider text-sepia hover:text-ink hover:bg-paper-warm/50 transition-all"
            >
              {c.name}
            </Link>
          ))}
        </nav>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Title */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 border-t border-sepia/30" />
            <span className="text-terracotta text-sm">&#10043;</span>
            <div className="w-10 border-t border-sepia/30" />
          </div>
          <h1 className="font-display text-6xl text-ink mb-2">Guestbook</h1>
          <p className="font-body text-sm text-sepia/70 max-w-md mx-auto">
            Visited one of the cities in my guide? Leave a note!
            I'd love to hear about your experience.
          </p>
        </div>

        {/* Sign the guestbook button */}
        {!showForm && (
          <div className="text-center mb-10">
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2.5 rounded-sm font-mono text-xs uppercase tracking-wider bg-terracotta text-paper hover:bg-coffee transition-colors shadow-soft"
            >
              Sign the guestbook
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <form
            onSubmit={handleSubmit}
            className="bg-cream border-pamphlet rounded-sm p-6 mb-10 shadow-soft"
          >
            <h2 className="font-display text-2xl text-ink mb-4">
              Leave a note
            </h2>

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
                  Which city did you visit?
                </label>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink"
                >
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
                  rows={4}
                  className="w-full px-3 py-2 rounded-lg border border-sepia/30 bg-paper-light font-body text-sm text-ink resize-none"
                  placeholder="Tell me about your trip..."
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

        {/* Entries */}
        {loading ? (
          <p className="text-center font-mono text-sm text-sepia animate-pulse">
            Loading guestbook...
          </p>
        ) : entries.length === 0 ? (
          <div className="text-center py-12">
            <p className="font-display text-3xl text-sepia/30 mb-2">
              No notes yet
            </p>
            <p className="font-body text-sm text-sepia/50">
              Be the first to sign the guestbook!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="bg-cream border-pamphlet rounded-sm p-5 shadow-soft relative"
              >
                {/* Corner decorations */}
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
                    <span className="font-mono text-[10px] text-terracotta uppercase">
                      {cityNameMap[entry.city] ?? entry.city}
                    </span>
                  </div>
                  <span className="font-mono text-[10px] text-sepia/50">
                    {entry.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {/* Admin delete */}
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
      </div>
    </div>
  );
}
