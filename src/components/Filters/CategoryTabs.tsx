interface CategoryTabsProps {
  activeTab: 'places' | 'food' | 'itineraries';
  onTabChange: (tab: 'places' | 'food' | 'itineraries') => void;
  showItineraries?: boolean;
}

export default function CategoryTabs({ activeTab, onTabChange, showItineraries }: CategoryTabsProps) {
  const tabs: { key: 'places' | 'food' | 'itineraries'; label: string }[] = [
    { key: 'places', label: 'Places' },
    { key: 'food', label: 'Food' },
  ];

  if (showItineraries) {
    tabs.push({ key: 'itineraries', label: 'Itineraries' });
  }

  return (
    <div className="flex justify-center gap-1 bg-ink/5 rounded-full p-1 w-fit mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className={`px-6 py-2 rounded-full font-mono text-sm uppercase tracking-wider transition-all ${
            activeTab === tab.key
              ? 'bg-terracotta text-paper shadow-sm'
              : 'text-sepia hover:text-ink'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
