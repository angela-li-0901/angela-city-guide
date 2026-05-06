import { useState, useEffect } from 'react';
import { toggleHeart, getHeartCount, isHearted } from '../../data/hearts';

interface HeartButtonProps {
  entryId: string;
}

export default function HeartButton({ entryId }: HeartButtonProps) {
  const [count, setCount] = useState(0);
  const [hearted, setHearted] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    setHearted(isHearted(entryId));
    getHeartCount(entryId).then(setCount).catch(() => {});
  }, [entryId]);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setAnimating(true);
    setTimeout(() => setAnimating(false), 300);

    try {
      const result = await toggleHeart(entryId);
      setCount(result.count);
      setHearted(result.hearted);
    } catch {
      // Silently fail -- localStorage still tracks state
      setHearted(!hearted);
      setCount((c) => hearted ? Math.max(0, c - 1) : c + 1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm font-mono text-xs transition-all ${
        hearted
          ? 'text-sakura bg-sakura/8'
          : 'text-sepia/50 hover:text-sakura hover:bg-sakura/8'
      }`}
    >
      <span
        className={`text-lg leading-none transition-transform ${
          animating ? 'scale-150' : 'scale-100'
        }`}
      >
        {hearted ? '\u2764' : '\u2661'}
      </span>
      {count > 0 && <span>{count}</span>}
    </button>
  );
}
