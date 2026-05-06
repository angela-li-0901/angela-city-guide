interface MustTryToggleProps {
  active: boolean;
  onChange: (active: boolean) => void;
}

export default function MustTryToggle({ active, onChange }: MustTryToggleProps) {
  return (
    <button
      onClick={() => onChange(!active)}
      className={`px-3 py-1 rounded-full font-mono text-xs uppercase tracking-wider transition-all inline-flex items-center gap-1.5 ${
        active
          ? 'bg-mustard text-paper'
          : 'bg-mustard/10 text-mustard hover:bg-mustard/20'
      }`}
    >
      <span className="text-sm leading-none">&#9733;</span>
      Angela's Fav
    </button>
  );
}
