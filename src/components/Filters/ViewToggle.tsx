interface ViewToggleProps {
  activeView: 'cards' | 'map';
  onViewChange: (view: 'cards' | 'map') => void;
}

export default function ViewToggle({ activeView, onViewChange }: ViewToggleProps) {
  const views = [
    { key: 'cards' as const, label: 'Cards' },
    { key: 'map' as const, label: 'Map' },
  ];

  return (
    <div className="flex justify-center gap-1 bg-ink/5 rounded-full p-1 w-fit mx-auto">
      {views.map((view) => (
        <button
          key={view.key}
          onClick={() => onViewChange(view.key)}
          className={`px-4 py-1.5 rounded-full font-mono text-xs uppercase tracking-wider transition-all ${
            activeView === view.key
              ? 'bg-ink text-paper shadow-sm'
              : 'text-sepia hover:text-ink'
          }`}
        >
          {view.label}
        </button>
      ))}
    </div>
  );
}
