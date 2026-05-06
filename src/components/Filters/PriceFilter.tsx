interface PriceFilterProps {
  selected: number[]; // Array of price levels (1-4)
  onChange: (prices: number[]) => void;
}

const PRICE_LEVELS = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' },
];

// Direct match: price level 1-4 maps directly to budgetToSplurge 1-4
export function ratingMatchesPriceLevel(rating: number, priceLevel: number): boolean {
  return rating === priceLevel;
}

export default function PriceFilter({ selected, onChange }: PriceFilterProps) {
  const toggle = (level: number) => {
    if (selected.includes(level)) {
      onChange(selected.filter((l) => l !== level));
    } else {
      onChange([...selected, level]);
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {PRICE_LEVELS.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => toggle(value)}
          className={`px-3 py-1 rounded-full font-mono text-xs tracking-wider transition-all ${
            selected.includes(value)
              ? 'bg-mustard text-paper'
              : 'bg-mustard/10 text-mustard hover:bg-mustard/20'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
