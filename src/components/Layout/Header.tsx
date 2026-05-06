import { Link, useParams } from 'react-router-dom';
import { CITIES } from '../../data/cities';

export default function Header() {
  const { city: activeCitySlug } = useParams<{ city: string }>();

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-dashed border-sepia/25 bg-cream/50">
      <Link
        to="/"
        className="font-display text-2xl text-ink hover:text-terracotta transition-colors"
      >
        Angela's Guide
      </Link>

      <nav className="flex items-center gap-1">
        {CITIES.map((city) => (
          <Link
            key={city.slug}
            to={`/${city.slug}`}
            className={`px-3 py-1.5 rounded-sm font-mono text-[11px] uppercase tracking-wider transition-all ${
              activeCitySlug === city.slug
                ? 'bg-terracotta text-paper shadow-sm'
                : 'text-sepia hover:text-ink hover:bg-paper-warm/50'
            }`}
          >
            {city.name}
          </Link>
        ))}
        <Link
          to="/#guestbook"
          className="px-3 py-1.5 rounded-sm font-mono text-[11px] uppercase tracking-wider text-sepia hover:text-ink hover:bg-paper-warm/50 transition-all"
        >
          Guestbook
        </Link>
      </nav>
    </header>
  );
}
