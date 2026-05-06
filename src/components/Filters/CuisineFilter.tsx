import { CUISINE_OPTIONS, type Cuisine } from '../../data/types';

interface CuisineFilterProps {
  selected: Cuisine[];
  onChange: (cuisines: Cuisine[]) => void;
}

export default function CuisineFilter({ selected, onChange }: CuisineFilterProps) {
  const toggle = (cuisine: Cuisine) => {
    if (selected.includes(cuisine)) {
      onChange(selected.filter((c) => c !== cuisine));
    } else {
      onChange([...selected, cuisine]);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {CUISINE_OPTIONS.map((cuisine) => (
        <button
          key={cuisine}
          onClick={() => toggle(cuisine)}
          className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all ${
            selected.includes(cuisine)
              ? 'bg-moss text-paper'
              : 'bg-moss/10 text-moss hover:bg-moss/20'
          }`}
        >
          {cuisine}
        </button>
      ))}
    </div>
  );
}
