import { ACTIVITY_TAG_OPTIONS, type ActivityTag } from '../../data/types';

interface ActivityTagFilterProps {
  selected: ActivityTag[];
  onChange: (tags: ActivityTag[]) => void;
}

export default function ActivityTagFilter({ selected, onChange }: ActivityTagFilterProps) {
  const toggle = (tag: ActivityTag) => {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {ACTIVITY_TAG_OPTIONS.map((tag) => (
        <button
          key={tag}
          onClick={() => toggle(tag)}
          className={`px-2.5 py-1 rounded-full font-mono text-[10px] uppercase tracking-wider transition-all ${
            selected.includes(tag)
              ? 'bg-moss text-paper'
              : 'bg-moss/10 text-moss hover:bg-moss/20'
          }`}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
