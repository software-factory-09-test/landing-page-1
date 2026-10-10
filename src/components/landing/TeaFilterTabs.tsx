import {
  TEA_CATEGORIES,
  type TeaCategoryFilter,
} from '../../data/teas.ts'

type TeaFilterTabsProps = {
  active: TeaCategoryFilter
  onChange: (category: TeaCategoryFilter) => void
  counts: Record<TeaCategoryFilter, number>
}

export function TeaFilterTabs({ active, onChange, counts }: TeaFilterTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter teas by category"
      data-testid="tea-filter-tabs"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {TEA_CATEGORIES.map((category) => {
        const selected = category.id === active
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-pressed={selected}
            onClick={() => onChange(category.id)}
            className={
              selected
                ? 'demo-button whitespace-nowrap px-4 py-2 text-sm'
                : 'demo-button demo-button-secondary whitespace-nowrap px-4 py-2 text-sm'
            }
          >
            {category.label}
            <span className="ml-1 text-xs opacity-70">
              ({counts[category.id] ?? 0})
            </span>
          </button>
        )
      })}
    </div>
  )
}
