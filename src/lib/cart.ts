import { TEAS, type Tea } from '../data/teas.ts'

export type CartLine = {
  teaId: string
  quantity: number
}

export type CartAction =
  | { type: 'add'; teaId: string; qty?: number }
  | { type: 'increment'; teaId: string }
  | { type: 'decrement'; teaId: string }
  | { type: 'remove'; teaId: string }
  | { type: 'clear' }

export type CartTotals = {
  itemCount: number
  subtotalCents: number
  shippingCents: number
  totalCents: number
  freeShippingThresholdCents: number
  qualifiesForFreeShipping: boolean
}

export const MAX_QTY = 12
export const FLAT_SHIPPING_CENTS = 599
export const FREE_SHIPPING_THRESHOLD_CENTS = 4500

const VALID_TEA_IDS: ReadonlySet<string> = new Set(TEAS.map((tea) => tea.id))

const CURRENCY_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

function clampQuantity(quantity: number): number {
  if (!Number.isFinite(quantity)) {
    return 0
  }

  const floored = Math.floor(quantity)
  if (floored < 0) {
    return 0
  }
  if (floored > MAX_QTY) {
    return MAX_QTY
  }
  return floored
}

function isKnownTea(teaId: string): boolean {
  return VALID_TEA_IDS.has(teaId)
}

export function cartReducer(state: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case 'clear':
      return []

    case 'add': {
      if (!isKnownTea(action.teaId)) {
        return state
      }

      const qty = action.qty ?? 1
      if (!Number.isFinite(qty) || qty <= 0) {
        return state
      }

      const existing = state.find((line) => line.teaId === action.teaId)
      if (!existing) {
        const quantity = clampQuantity(qty)
        if (quantity <= 0) {
          return state
        }
        return [...state, { teaId: action.teaId, quantity }]
      }

      return state.map((line) =>
        line.teaId === action.teaId
          ? { ...line, quantity: clampQuantity(line.quantity + qty) }
          : line,
      )
    }

    case 'increment': {
      if (!isKnownTea(action.teaId)) {
        return state
      }

      const existing = state.find((line) => line.teaId === action.teaId)
      if (!existing) {
        return [...state, { teaId: action.teaId, quantity: 1 }]
      }

      return state.map((line) =>
        line.teaId === action.teaId
          ? { ...line, quantity: clampQuantity(line.quantity + 1) }
          : line,
      )
    }

    case 'decrement': {
      return state
        .map((line) =>
          line.teaId === action.teaId
            ? { ...line, quantity: clampQuantity(line.quantity - 1) }
            : line,
        )
        .filter((line) => line.quantity > 0)
    }

    case 'remove':
      return state.filter((line) => line.teaId !== action.teaId)

    default:
      return state
  }
}

export function cartTotals(lines: CartLine[], teas: Tea[]): CartTotals {
  const priceById = new Map(teas.map((tea) => [tea.id, tea.priceCents]))

  let itemCount = 0
  let subtotalCents = 0

  for (const line of lines) {
    const price = priceById.get(line.teaId)
    if (price === undefined) {
      continue
    }

    const quantity = Math.max(0, Math.floor(line.quantity))
    itemCount += quantity
    subtotalCents += price * quantity
  }

  const qualifiesForFreeShipping =
    itemCount > 0 && subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS
  const shippingCents =
    itemCount === 0 ? 0 : qualifiesForFreeShipping ? 0 : FLAT_SHIPPING_CENTS

  return {
    itemCount,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
    freeShippingThresholdCents: FREE_SHIPPING_THRESHOLD_CENTS,
    qualifiesForFreeShipping,
  }
}

export function formatPrice(cents: number): string {
  return CURRENCY_FORMATTER.format(cents / 100)
}
