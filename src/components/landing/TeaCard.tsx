import { formatPrice } from '../../lib/cart.ts'
import type { Tea } from '../../data/teas.ts'

type TeaCardProps = {
  tea: Tea
  quantityInCart: number
  onAdd: (tea: Tea) => void
  onIncrement: (tea: Tea) => void
  onDecrement: (tea: Tea) => void
}

const CAFFEINE_LABELS: Record<Tea['caffeine'], string> = {
  none: 'Caffeine free',
  low: 'Low caffeine',
  medium: 'Medium caffeine',
  high: 'High caffeine',
}

export function TeaCard({
  tea,
  quantityInCart,
  onAdd,
  onIncrement,
  onDecrement,
}: TeaCardProps) {
  const soldOut = !tea.inStock

  return (
    <article
      data-testid="tea-card"
      className="tea-card island-shell flex h-full flex-col rounded-2xl p-5"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-lg font-semibold text-[var(--sea-ink)]">
            {tea.name}
          </h3>
          <p className="mt-1 text-xs text-[var(--sea-ink-soft)]">{tea.origin}</p>
        </div>
        <span className="demo-pill">{CAFFEINE_LABELS[tea.caffeine]}</span>
      </div>

      <ul className="m-0 mb-4 flex flex-wrap list-none gap-1.5 p-0">
        {tea.tastingNotes.map((note) => (
          <li key={note} className="demo-pill">
            {note}
          </li>
        ))}
      </ul>

      <div className="mt-auto flex items-center justify-between gap-3">
        <div>
          <p className="m-0 text-base font-bold text-[var(--sea-ink)]">
            {formatPrice(tea.priceCents)}
          </p>
          <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
            {tea.weightGrams}g loose leaf
          </p>
        </div>

        {soldOut ? (
          <button
            type="button"
            disabled
            aria-label={`${tea.name} is sold out`}
            data-testid={`tea-add-${tea.id}`}
            className="demo-button"
          >
            Sold out
          </button>
        ) : quantityInCart > 0 ? (
          <div
            className="flex items-center gap-2"
            aria-label={`${tea.name} quantity in cart`}
          >
            <button
              type="button"
              onClick={() => onDecrement(tea)}
              aria-label={`Decrease quantity of ${tea.name}`}
              data-testid={`tea-decrement-${tea.id}`}
              className="demo-button demo-button-secondary h-9 w-9 p-0"
            >
              &minus;
            </button>
            <span
              data-testid={`tea-qty-${tea.id}`}
              className="min-w-6 text-center text-sm font-semibold text-[var(--sea-ink)]"
            >
              {quantityInCart}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(tea)}
              aria-label={`Increase quantity of ${tea.name}`}
              data-testid={`tea-increment-${tea.id}`}
              className="demo-button h-9 w-9 p-0"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => onAdd(tea)}
            aria-label={`Add ${tea.name} to your box`}
            data-testid={`tea-add-${tea.id}`}
            className="demo-button"
          >
            Add to box
          </button>
        )}
      </div>
    </article>
  )
}
