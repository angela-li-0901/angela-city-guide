import type { Cuisine, ActivityTag } from '../../data/types';
import SubcategoryFilter from './SubcategoryFilter';
import CuisineFilter from './CuisineFilter';
import PriceFilter from './PriceFilter';
import MustTryToggle from './MustTryToggle';
import ActivityTagFilter from './ActivityTagFilter';

interface FilterBarProps {
  category: 'food' | 'places';
  subcategory: string | null;
  onSubcategoryChange: (sub: string | null) => void;
  cuisines: Cuisine[];
  onCuisinesChange: (cuisines: Cuisine[]) => void;
  prices: number[];
  onPricesChange: (prices: number[]) => void;
  activityTags: ActivityTag[];
  onActivityTagsChange: (tags: ActivityTag[]) => void;
  mustTry: boolean;
  onMustTryChange: (active: boolean) => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

export default function FilterBar({
  category,
  subcategory,
  onSubcategoryChange,
  cuisines,
  onCuisinesChange,
  prices,
  onPricesChange,
  activityTags,
  onActivityTagsChange,
  mustTry,
  onMustTryChange,
  hasActiveFilters,
  onClearFilters,
}: FilterBarProps) {
  return (
    <div className="space-y-3">
      {/* Subcategory filter + Angela's Fav toggle */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <SubcategoryFilter
          category={category}
          active={subcategory}
          onChange={onSubcategoryChange}
        />
        <MustTryToggle active={mustTry} onChange={onMustTryChange} />
      </div>

      {/* Food-specific filters */}
      {category === 'food' && (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono text-[10px] text-sepia uppercase tracking-widest">
              Price
            </span>
            <PriceFilter selected={prices} onChange={onPricesChange} />
          </div>
          <div>
            <p className="font-mono text-[10px] text-sepia uppercase tracking-widest text-center mb-1.5">
              Cuisine
            </p>
            <CuisineFilter selected={cuisines} onChange={onCuisinesChange} />
          </div>
        </div>
      )}

      {/* Places-specific filters */}
      {category === 'places' && (
        <div>
          <p className="font-mono text-[10px] text-sepia uppercase tracking-widest text-center mb-1.5">
            Activity
          </p>
          <ActivityTagFilter selected={activityTags} onChange={onActivityTagsChange} />
        </div>
      )}

      {/* Clear filters */}
      {hasActiveFilters && (
        <div className="text-center">
          <button
            onClick={onClearFilters}
            className="font-mono text-xs text-terracotta underline underline-offset-2 hover:text-ink transition-colors"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
