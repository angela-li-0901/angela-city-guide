interface CategoryTabsProps {
  activeTab: 'food' | 'places';
  onTabChange: (tab: 'food' | 'places') => void;
}

export default function CategoryTabs({ activeTab, onTabChange }: CategoryTabsProps) {
  const tabs = [
    { key: 'places' as const, label: 'Places' },
    { key: 'food' as const, label: 'Food' },
  ];

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
