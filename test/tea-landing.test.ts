import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

import {
  TEAS,
  TEA_CATEGORIES,
  filterTeas,
  getTeaById,
  type TeaCategoryFilter,
} from '../src/data/teas.ts'
import {
  cartReducer,
  cartTotals,
  formatPrice,
  MAX_QTY,
  FLAT_SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  type CartLine,
} from '../src/lib/cart.ts'
import {
  isValidEmail,
  validateEmail,
  submitFinishedState,
  submitStarted,
  submitFailed,
  submitSucceeded,
  isSimulatedNetworkFailure,
  NETWORK_ERROR_MESSAGE,
  EMAIL_INVALID_MESSAGE,
  EMAIL_REQUIRED_MESSAGE,
  type SubscribeState,
} from '../src/lib/newsletter.ts'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..')

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), 'utf8')
}

// ---------------------------------------------------------------------------
// 6a. Data tests
// ---------------------------------------------------------------------------

test('TEAS has unique ids and slugs', () => {
  const ids = TEAS.map((tea) => tea.id)
  const slugs = TEAS.map((tea) => tea.slug)
  assert.equal(new Set(ids).size, ids.length)
  assert.equal(new Set(slugs).size, slugs.length)
})

test('every tea has positive integer price and weight', () => {
  for (const tea of TEAS) {
    assert.ok(Number.isInteger(tea.priceCents), `${tea.id} priceCents`)
    assert.ok(tea.priceCents > 0, `${tea.id} priceCents positive`)
    assert.ok(Number.isInteger(tea.weightGrams), `${tea.id} weightGrams`)
    assert.ok(tea.weightGrams > 0, `${tea.id} weightGrams positive`)
  }
})

test('every category (except all) is represented in TEAS', () => {
  for (const category of TEA_CATEGORIES) {
    if (category.id === 'all') {
      continue
    }
    assert.ok(
      TEAS.some((tea) => tea.category === category.id),
      `missing tea for ${category.id}`,
    )
  }
})

test('every tea has at least one tasting note', () => {
  for (const tea of TEAS) {
    assert.ok(tea.tastingNotes.length >= 1, `${tea.id} tasting notes`)
  }
})

test('getTeaById finds teas and returns undefined for unknown ids', () => {
  assert.equal(getTeaById(TEAS, TEAS[0].id)?.id, TEAS[0].id)
  assert.equal(getTeaById(TEAS, 'does-not-exist'), undefined)
})

// ---------------------------------------------------------------------------
// 6b. Filter tests
// ---------------------------------------------------------------------------

test("filterTeas('all') returns the full list", () => {
  assert.equal(filterTeas(TEAS, 'all').length, TEAS.length)
})

test('filterTeas returns only matching category members', () => {
  for (const category of TEA_CATEGORIES) {
    if (category.id === 'all') {
      continue
    }
    const result = filterTeas(TEAS, category.id)
    assert.ok(result.length >= 1)
    for (const tea of result) {
      assert.equal(tea.category, category.id)
    }
  }
})

test('filterTeas returns [] for a category with no matches', () => {
  const result = filterTeas(TEAS, 'matcha' as TeaCategoryFilter)
  assert.deepEqual(result, [])
})

// ---------------------------------------------------------------------------
// 6c. Cart reducer tests
// ---------------------------------------------------------------------------

const TEA_A = TEAS[0].id
const TEA_B = TEAS[1].id

function qtyOf(lines: CartLine[], teaId: string): number {
  return lines.find((line) => line.teaId === teaId)?.quantity ?? 0
}

test('add creates a line', () => {
  const next = cartReducer([], { type: 'add', teaId: TEA_A })
  assert.equal(next.length, 1)
  assert.equal(qtyOf(next, TEA_A), 1)
})

test('add same tea twice accumulates quantity', () => {
  let lines = cartReducer([], { type: 'add', teaId: TEA_A })
  lines = cartReducer(lines, { type: 'add', teaId: TEA_A })
  assert.equal(lines.length, 1)
  assert.equal(qtyOf(lines, TEA_A), 2)
})

test('increment and decrement adjust quantity', () => {
  let lines = cartReducer([], { type: 'add', teaId: TEA_A })
  lines = cartReducer(lines, { type: 'increment', teaId: TEA_A })
  assert.equal(qtyOf(lines, TEA_A), 2)
  lines = cartReducer(lines, { type: 'decrement', teaId: TEA_A })
  assert.equal(qtyOf(lines, TEA_A), 1)
})

test('decrement to zero removes the line', () => {
  const lines = cartReducer([{ teaId: TEA_A, quantity: 1 }], {
    type: 'decrement',
    teaId: TEA_A,
  })
  assert.deepEqual(lines, [])
})

test('remove deletes a line', () => {
  const lines = cartReducer(
    [
      { teaId: TEA_A, quantity: 1 },
      { teaId: TEA_B, quantity: 1 },
    ],
    { type: 'remove', teaId: TEA_A },
  )
  assert.equal(lines.length, 1)
  assert.equal(lines[0].teaId, TEA_B)
})

test('clear empties the cart', () => {
  const lines = cartReducer(
    [
      { teaId: TEA_A, quantity: 2 },
      { teaId: TEA_B, quantity: 3 },
    ],
    { type: 'clear' },
  )
  assert.deepEqual(lines, [])
})

test('unknown tea ids are ignored', () => {
  const lines = cartReducer([], { type: 'add', teaId: 'ghost-tea' })
  assert.deepEqual(lines, [])
  const untouched = cartReducer([{ teaId: TEA_A, quantity: 2 }], {
    type: 'increment',
    teaId: 'ghost-tea',
  })
  assert.deepEqual(untouched, [{ teaId: TEA_A, quantity: 2 }])
})

test('quantity is capped at MAX_QTY', () => {
  const lines = cartReducer([], { type: 'add', teaId: TEA_A, qty: 999 })
  assert.equal(qtyOf(lines, TEA_A), MAX_QTY)
})

// ---------------------------------------------------------------------------
// 6d. Totals tests
// ---------------------------------------------------------------------------

test('empty cart totals are all zero', () => {
  const totals = cartTotals([], TEAS)
  assert.equal(totals.itemCount, 0)
  assert.equal(totals.subtotalCents, 0)
  assert.equal(totals.shippingCents, 0)
  assert.equal(totals.totalCents, 0)
  assert.equal(totals.qualifiesForFreeShipping, false)
})

test('sub-threshold cart adds flat shipping', () => {
  const tea = TEAS.find((entry) => entry.priceCents < FREE_SHIPPING_THRESHOLD_CENTS)!
  const totals = cartTotals([{ teaId: tea.id, quantity: 1 }], TEAS)
  assert.equal(totals.subtotalCents, tea.priceCents)
  assert.ok(totals.subtotalCents < FREE_SHIPPING_THRESHOLD_CENTS)
  assert.equal(totals.shippingCents, FLAT_SHIPPING_CENTS)
  assert.equal(totals.totalCents, tea.priceCents + FLAT_SHIPPING_CENTS)
  assert.equal(totals.qualifiesForFreeShipping, false)
})

test('at or above threshold qualifies for free shipping', () => {
  const tea = TEAS.reduce((a, b) => (a.priceCents > b.priceCents ? a : b))
  const needed = Math.ceil(FREE_SHIPPING_THRESHOLD_CENTS / tea.priceCents)
  const totals = cartTotals([{ teaId: tea.id, quantity: needed }], TEAS)
  assert.ok(totals.subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS)
  assert.equal(totals.shippingCents, 0)
  assert.equal(totals.qualifiesForFreeShipping, true)
  assert.equal(totals.totalCents, totals.subtotalCents)
})

test('totals stay integer cents', () => {
  const totals = cartTotals(
    [
      { teaId: TEAS[0].id, quantity: 3 },
      { teaId: TEAS[1].id, quantity: 2 },
    ],
    TEAS,
  )
  assert.ok(Number.isInteger(totals.subtotalCents))
  assert.ok(Number.isInteger(totals.shippingCents))
  assert.ok(Number.isInteger(totals.totalCents))
  assert.equal(
    totals.totalCents,
    totals.subtotalCents + totals.shippingCents,
  )
})

test('formatPrice renders deterministic USD currency', () => {
  assert.equal(formatPrice(1500), '$15.00')
  assert.equal(formatPrice(0), '$0.00')
})

// ---------------------------------------------------------------------------
// 6e. Newsletter tests
// ---------------------------------------------------------------------------

test('email validation accepts a well-formed address', () => {
  assert.equal(isValidEmail('name@example.com'), true)
  assert.equal(validateEmail('name@example.com'), null)
})

test('email validation rejects malformed addresses', () => {
  const invalid = ['', 'a@b', 'a b@c.com', 'a@@b.com', 'a@b.c m']
  for (const value of invalid) {
    assert.equal(isValidEmail(value), false, `expected invalid: ${value}`)
    assert.notEqual(validateEmail(value), null, `expected error: ${value}`)
  }
})

test('validateEmail distinguishes required vs invalid', () => {
  assert.equal(validateEmail('   '), EMAIL_REQUIRED_MESSAGE)
  assert.equal(validateEmail('nope'), EMAIL_INVALID_MESSAGE)
})

test('submitStarted moves to submitting with no message', () => {
  const state = submitStarted({ status: 'idle', message: '', email: 'a@b.com' })
  assert.equal(state.status, 'submitting')
  assert.equal(state.message, '')
})

test('submitFailed on invalid email yields status error + message', () => {
  const state = submitFailed(
    { status: 'submitting', message: '', email: 'a@b' },
    EMAIL_INVALID_MESSAGE,
  )
  assert.equal(state.status, 'error')
  assert.equal(state.message, EMAIL_INVALID_MESSAGE)
})

test('simulated network failure is detected for @invalid.test', () => {
  assert.equal(isSimulatedNetworkFailure('someone@invalid.test'), true)
  assert.equal(isSimulatedNetworkFailure('someone@example.com'), false)

  const failed = submitFailed(
    { status: 'submitting', message: '', email: 'someone@invalid.test' },
    NETWORK_ERROR_MESSAGE,
  )
  assert.equal(failed.status, 'error')
  assert.equal(failed.message, NETWORK_ERROR_MESSAGE)
})

test('submitSucceeded yields status success with no error', () => {
  const state = submitSucceeded({
    status: 'submitting',
    message: '',
    email: 'name@example.com',
  })
  assert.equal(state.status, 'success')
  assert.notEqual(state.message, EMAIL_INVALID_MESSAGE)
  assert.notEqual(state.message, NETWORK_ERROR_MESSAGE)
})

test('submitFinishedState resolves validation and simulated failures', () => {
  const base: SubscribeState = { status: 'idle', message: '', email: '' }

  const invalid = submitFinishedState({ ...base, email: 'bad' })
  assert.equal(invalid.status, 'error')

  const network = submitFinishedState({ ...base, email: 'x@invalid.test' })
  assert.equal(network.status, 'error')
  assert.equal(network.message, NETWORK_ERROR_MESSAGE)

  const ok = submitFinishedState({ ...base, email: 'name@example.com' })
  assert.equal(ok.status, 'success')
})

// ---------------------------------------------------------------------------
// 6f. Component-structure verification (source contract checks)
// ---------------------------------------------------------------------------

test('TeaCatalog declares responsive grid and empty state', () => {
  const src = readSource('src/components/landing/TeaCatalog.tsx')
  assert.match(src, /data-testid="tea-grid"/)
  assert.match(src, /sm:grid-cols-2/)
  assert.match(src, /lg:grid-cols-3/)
  assert.match(src, /role="status"/)
  assert.match(src, /No teas in this category yet\./)
})

test('TeaCard exposes card testid, price and stock states', () => {
  const src = readSource('src/components/landing/TeaCard.tsx')
  assert.match(src, /data-testid="tea-card"/)
  assert.match(src, /formatPrice/)
  assert.match(src, /Sold out/)
  assert.match(src, /aria-label/)
})

test('TeaFilterTabs wires tablist and aria-selected', () => {
  const src = readSource('src/components/landing/TeaFilterTabs.tsx')
  assert.match(src, /role="tablist"/)
  assert.match(src, /aria-selected/)
})

test('HeroSection is responsive and links to key sections', () => {
  const src = readSource('src/components/landing/HeroSection.tsx')
  assert.match(src, /sm:/)
  assert.match(src, /text-4xl/)
  assert.match(src, /lg:text-6xl/)
  assert.match(src, /href="#teas"/)
  assert.match(src, /href="#newsletter"/)
})

test('OrderBuilder exposes cart panel, empty state and aria-live', () => {
  const src = readSource('src/components/landing/OrderBuilder.tsx')
  assert.match(src, /data-testid="cart-panel"/)
  assert.match(src, /data-testid="cart-empty"/)
  assert.match(src, /aria-live/)
  assert.match(src, /role="status"/)
  assert.match(src, /Checkout/)
})

test('NewsletterSignup wires form, alert and validation feedback', () => {
  const src = readSource('src/components/landing/NewsletterSignup.tsx')
  assert.match(src, /data-testid="newsletter-form"/)
  assert.match(src, /role="alert"/)
  assert.match(src, /aria-invalid/)
  assert.match(src, /aria-describedby/)
  assert.match(src, /disabled=\{state\.status === 'submitting'\}/)
})

test('Header nests mobile toggle and in-page anchors', () => {
  const src = readSource('src/components/Header.tsx')
  assert.match(src, /aria-expanded/)
  assert.match(src, /aria-controls/)
  assert.match(src, /'#top'/)
  assert.match(src, /'#teas'/)
  assert.match(src, /'#story'/)
  assert.match(src, /'#newsletter'/)
  assert.match(src, /ThemeToggle/)
})

test('index route composes the landing page from pure modules', () => {
  const src = readSource('src/routes/index.tsx')
  assert.match(src, /createFileRoute\('\/'\)/)
  assert.match(src, /useReducer\(cartReducer/)
  assert.match(src, /filterTeas\(TEAS/)
  assert.match(src, /cartTotals\(lines, TEAS\)/)
  assert.match(src, /<HeroSection \/>/)
  assert.match(src, /<TeaCatalog/)
  assert.match(src, /<OrderBuilder/)
  assert.match(src, /<StorySection \/>/)
  assert.match(src, /<NewsletterSignup \/>/)
})

test('root route carries tea-specific metadata', () => {
  const src = readSource('src/routes/__root.tsx')
  assert.match(src, /Steep & Co\./)
  assert.match(src, /description/)
})
