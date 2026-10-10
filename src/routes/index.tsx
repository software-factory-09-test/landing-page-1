import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useReducer, useState } from 'react'
import {
  TEAS,
  filterTeas,
  TEA_CATEGORIES,
  type Tea,
  type TeaCategoryFilter,
} from '../data/teas.ts'
import {
  cartReducer,
  cartTotals,
  type CartLine,
} from '../lib/cart.ts'
import { HeroSection } from '../components/landing/HeroSection'
import { TeaCatalog } from '../components/landing/TeaCatalog'
import { OrderBuilder } from '../components/landing/OrderBuilder'
import { StorySection } from '../components/landing/StorySection'
import { NewsletterSignup } from '../components/landing/NewsletterSignup'

export const Route = createFileRoute('/')({
  component: TeaLanding,
  head: () => ({
    meta: [
      {
        title: 'Steep & Co. — Small-batch loose-leaf tea',
      },
      {
        name: 'description',
        content:
          'Shop small-batch, single-origin loose-leaf tea from Steep & Co. Build a custom box, track your total, and join the monthly tea letter.',
      },
    ],
  }),
})

function TeaLanding() {
  const [lines, dispatch] = useReducer(cartReducer, [] as CartLine[])
  const [category, setCategory] = useState<TeaCategoryFilter>('all')
  const [notice, setNotice] = useState('')

  const visibleTeas = useMemo(() => filterTeas(TEAS, category), [category])
  const totals = useMemo(() => cartTotals(lines, TEAS), [lines])

  const categoryCounts = useMemo(() => {
    const counts = {} as Record<TeaCategoryFilter, number>
    for (const option of TEA_CATEGORIES) {
      counts[option.id] = filterTeas(TEAS, option.id).length
    }
    return counts
  }, [])

  const quantities = useMemo(() => {
    const map: Record<string, number> = {}
    for (const line of lines) {
      map[line.teaId] = line.quantity
    }
    return map
  }, [lines])

  function handleAdd(tea: Tea) {
    if (!tea.inStock) {
      setNotice(`${tea.name} is sold out right now — check back soon.`)
      return
    }

    setNotice('')
    dispatch({ type: 'add', teaId: tea.id })
  }

  return (
    <main className="page-wrap px-4 pb-8 pt-10">
      <HeroSection />
      <TeaCatalog
        teas={visibleTeas}
        activeCategory={category}
        onCategoryChange={setCategory}
        categoryCounts={categoryCounts}
        quantities={quantities}
        onAdd={handleAdd}
        onIncrement={(tea) => dispatch({ type: 'increment', teaId: tea.id })}
        onDecrement={(tea) => dispatch({ type: 'decrement', teaId: tea.id })}
      />
      <OrderBuilder
        lines={lines}
        teas={TEAS}
        totals={totals}
        notice={notice}
        onIncrement={(teaId) => dispatch({ type: 'increment', teaId })}
        onDecrement={(teaId) => dispatch({ type: 'decrement', teaId })}
        onRemove={(teaId) => dispatch({ type: 'remove', teaId })}
        onClear={() => {
          setNotice('')
          dispatch({ type: 'clear' })
        }}
      />
      <StorySection />
      <NewsletterSignup />
    </main>
  )
}
