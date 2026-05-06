import type { GuideEntry } from '../../data/types';

interface AdminToolbarProps {
  citySlug: string;
  entries: GuideEntry[];
  onAdd: () => void;
  onImport: (entries: GuideEntry[]) => void;
}

export default function AdminToolbar({
  citySlug,
  entries,
  onAdd,
  onImport,
}: AdminToolbarProps) {
  const handleExport = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${citySlug}-guide.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target?.result as string);
          if (!Array.isArray(data)) {
            alert('Invalid format: expected an array of entries.');
            return;
          }
          if (
            !window.confirm(
              `Import ${data.length} entries? This will replace all current entries for this city.`
            )
          ) {
            return;
          }
          onImport(data as GuideEntry[]);
        } catch {
          alert('Failed to parse JSON file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
      {/* Admin indicator */}
      <span className="px-2 py-1 bg-sakura/20 text-sakura font-mono text-[10px] uppercase tracking-wider rounded-full">
        Admin Mode
      </span>

      <button
        onClick={handleExport}
        className="px-3 py-2 rounded-lg bg-ink/10 font-mono text-xs text-ink hover:bg-ink/20 transition-colors"
        title="Export JSON"
      >
        Export
      </button>

      <button
        onClick={handleImport}
        className="px-3 py-2 rounded-lg bg-ink/10 font-mono text-xs text-ink hover:bg-ink/20 transition-colors"
        title="Import JSON"
      >
        Import
      </button>

      <button
        onClick={onAdd}
        className="w-12 h-12 rounded-full bg-terracotta text-paper text-2xl shadow-lg hover:bg-coffee transition-colors flex items-center justify-center"
        title="Add new entry"
      >
        +
      </button>
    </div>
  );
}
