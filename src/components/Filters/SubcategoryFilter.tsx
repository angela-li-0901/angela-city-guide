import {
  FOOD_SUBCATEGORY_LABELS,
  PLACES_SUBCATEGORY_LABELS,
} from '../../data/types';

interface SubcategoryFilterProps {
  category: 'food' | 'places';
  active: string | null; // null means "All"
  onChange: (subcategory: string | null) => void;
}

export default function SubcategoryFilter({
  category,
  active,
  onChange,
}: SubcategoryFilterProps) {
  const labels =
    category === 'food' ? FOOD_SUBCATEGORY_LABELS : PLACES_SUBCATEGORY_LABELS;

  const options = Object.entries(labels) as [string, string][];

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <button
        onClick={() => onChange(null)}
        className={`px-3 py-1 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
          active === null
            ? 'bg-ink text-paper'
            : 'bg-ink/5 text-sepia hover:bg-ink/10'
        }`}
      >
        All
      </button>
      {options.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          className={`px-3 py-1 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
            active === key
              ? 'bg-ink text-paper'
              : 'bg-ink/5 text-sepia hover:bg-ink/10'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
