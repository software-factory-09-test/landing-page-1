import { useState } from 'react'
import { SectionHeading } from './SectionHeading'
import {
  MAX_QTY,
  formatPrice,
  type CartLine,
  type CartTotals,
} from '../../lib/cart.ts'
import type { Tea } from '../../data/teas.ts'

type OrderBuilderProps = {
  lines: CartLine[]
  teas: Tea[]
  totals: CartTotals
  notice?: string
  onIncrement: (teaId: string) => void
  onDecrement: (teaId: string) => void
  onRemove: (teaId: string) => void
  onClear: () => void
}

export function OrderBuilder({
  lines,
  teas,
  totals,
  notice,
  onIncrement,
  onDecrement,
  onRemove,
  onClear,
}: OrderBuilderProps) {
  const [checkoutMessage, setCheckoutMessage] = useState('')

  const teaById = new Map(teas.map((tea) => [tea.id, tea]))
  const atMaxQuantity = lines.some((line) => line.quantity >= MAX_QTY)
  const remainingForFreeShipping =
    totals.freeShippingThresholdCents - totals.subtotalCents

  return (
    <section
      id="order"
      className="anchor-offset mt-14"
      aria-labelledby="order-heading"
    >
      <SectionHeading
        id="order-heading"
        kicker="Your box"
        title="Build your order"
        description="Quantities update the running total instantly. No account needed."
      />

      <div
        data-testid="cart-panel"
        className="island-shell rounded-2xl p-5 sm:p-6"
      >
        <div
          role="status"
          aria-live="polite"
          data-testid="cart-status"
          className="sr-only"
        >
          {totals.itemCount === 0
            ? 'Your box is empty.'
            : `${totals.itemCount} item${totals.itemCount === 1 ? '' : 's'} in your box.`}
        </div>

        {notice ? (
          <p
            role="alert"
            data-testid="cart-notice"
            className="demo-alert demo-alert-danger mb-4 text-sm"
          >
            {notice}
          </p>
        ) : null}

        {lines.length === 0 ? (
          <p
            role="status"
            data-testid="cart-empty"
            className="m-0 text-sm text-[var(--sea-ink-soft)]"
          >
            Your box is empty. Add a tea from the catalog to get started.
          </p>
        ) : (
          <ul className="m-0 flex list-none flex-col gap-3 p-0">
            {lines.map((line) => {
              const tea = teaById.get(line.teaId)
              if (!tea) {
                return null
              }

              return (
                <li
                  key={line.teaId}
                  data-testid={`cart-line-${line.teaId}`}
                  className="demo-list-item flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="min-w-40">
                    <p className="m-0 text-sm font-semibold text-[var(--sea-ink)]">
                      {tea.name}
                    </p>
                    <p className="m-0 text-xs text-[var(--sea-ink-soft)]">
                      {formatPrice(tea.priceCents)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDecrement(line.teaId)}
                      aria-label={`Decrease quantity of ${tea.name}`}
                      className="demo-button demo-button-secondary h-8 w-8 p-0"
                    >
                      &minus;
                    </button>
                    <span className="min-w-6 text-center text-sm font-semibold text-[var(--sea-ink)]">
                      {line.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => onIncrement(line.teaId)}
                      disabled={line.quantity >= MAX_QTY}
                      aria-label={`Increase quantity of ${tea.name}`}
                      className="demo-button h-8 w-8 p-0"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-[var(--sea-ink)]">
                      {formatPrice(tea.priceCents * line.quantity)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(line.teaId)}
                      aria-label={`Remove ${tea.name} from your box`}
                      className="demo-button demo-button-danger px-3 py-2 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {atMaxQuantity ? (
          <p
            role="alert"
            data-testid="cart-max-warning"
            className="demo-alert mt-4 text-sm"
          >
            You have reached the maximum of {MAX_QTY} pouches per tea.
          </p>
        ) : null}

        <div className="mt-5 border-t border-[var(--line)] pt-4">
          {totals.itemCount > 0 && !totals.qualifiesForFreeShipping ? (
            <p
              role="status"
              data-testid="cart-shipping-progress"
              className="m-0 mb-3 text-sm text-[var(--sea-ink-soft)]"
            >
              Add {formatPrice(remainingForFreeShipping)} more for free
              shipping.
            </p>
          ) : null}

          {totals.qualifiesForFreeShipping ? (
            <p
              role="status"
              data-testid="cart-free-shipping"
              className="m-0 mb-3 text-sm font-semibold text-[var(--palm)]"
            >
              Nice — your order qualifies for free shipping.
            </p>
          ) : null}

          <dl className="m-0 grid gap-1 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-[var(--sea-ink-soft)]">
                Subtotal ({totals.itemCount} item
                {totals.itemCount === 1 ? '' : 's'})
              </dt>
              <dd className="m-0 font-semibold text-[var(--sea-ink)]">
                {formatPrice(totals.subtotalCents)}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-[var(--sea-ink-soft)]">Shipping</dt>
              <dd className="m-0 font-semibold text-[var(--sea-ink)]">
                {totals.shippingCents === 0
                  ? 'Free'
                  : formatPrice(totals.shippingCents)}
              </dd>
            </div>
            <div className="mt-1 flex items-center justify-between border-t border-[var(--line)] pt-2 text-base">
              <dt className="font-bold text-[var(--sea-ink)]">Total</dt>
              <dd className="m-0 font-bold text-[var(--sea-ink)]">
                {formatPrice(totals.totalCents)}
              </dd>
            </div>
          </dl>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() =>
                setCheckoutMessage(
                  `Checkout is a demo — we would now collect payment for ${totals.itemCount} pouch${
                    totals.itemCount === 1 ? '' : 'es'
                  }.`,
                )
              }
              disabled={totals.itemCount === 0}
              data-testid="checkout-button"
              className="demo-button"
            >
              Checkout
            </button>
            <button
              type="button"
              onClick={() => {
                onClear()
                setCheckoutMessage('')
              }}
              disabled={lines.length === 0}
              className="demo-button demo-button-secondary"
            >
              Clear box
            </button>
          </div>

          {checkoutMessage ? (
            <p
              role="status"
              data-testid="checkout-message"
              className="mt-3 text-sm text-[var(--sea-ink-soft)]"
            >
              {checkoutMessage}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}
