import { SectionHeading } from './SectionHeading'
import { TeaFilterTabs } from './TeaFilterTabs'
import { TeaCard } from './TeaCard'
import type { Tea, TeaCategoryFilter } from '../../data/teas.ts'

type TeaCatalogProps = {
  teas: Tea[]
  activeCategory: TeaCategoryFilter
  onCategoryChange: (category: TeaCategoryFilter) => void
  categoryCounts: Record<TeaCategoryFilter, number>
  quantities: Record<string, number>
  onAdd: (tea: Tea) => void
  onIncrement: (tea: Tea) => void
  onDecrement: (tea: Tea) => void
}

export function TeaCatalog({
  teas,
  activeCategory,
  onCategoryChange,
  categoryCounts,
  quantities,
  onAdd,
  onIncrement,
  onDecrement,
}: TeaCatalogProps) {
  return (
    <section className="anchor-offset mt-14" aria-labelledby="teas">
      <SectionHeading
        id="teas"
        kicker="The catalog"
        title="Leaves worth lingering over"
        description="Filter by style, then add a pouch or two to your box. Availability updates as you build."
      />

      <div className="mb-6">
        <TeaFilterTabs
          active={activeCategory}
          onChange={onCategoryChange}
          counts={categoryCounts}
        />
      </div>

      {teas.length === 0 ? (
        <p
          role="status"
          data-testid="tea-catalog-empty"
          className="island-shell rounded-2xl p-6 text-sm text-[var(--sea-ink-soft)]"
        >
          No teas in this category yet.
        </p>
      ) : (
        <div
          data-testid="tea-grid"
          className="tea-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
          {teas.map((tea) => (
            <TeaCard
              key={tea.id}
              tea={tea}
              quantityInCart={quantities[tea.id] ?? 0}
              onAdd={onAdd}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
            />
          ))}
        </div>
      )}
    </section>
  )
}
