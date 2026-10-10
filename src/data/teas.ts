export type TeaCategory = 'green' | 'black' | 'oolong' | 'herbal'

export type TeaCaffeine = 'none' | 'low' | 'medium' | 'high'

export type Tea = {
  id: string
  slug: string
  name: string
  category: TeaCategory
  origin: string
  priceCents: number
  weightGrams: number
  tastingNotes: string[]
  caffeine: TeaCaffeine
  inStock: boolean
}

export type TeaCategoryFilter = 'all' | TeaCategory

export const TEA_CATEGORIES: { id: TeaCategoryFilter; label: string }[] = [
  { id: 'all', label: 'All teas' },
  { id: 'green', label: 'Green' },
  { id: 'black', label: 'Black' },
  { id: 'oolong', label: 'Oolong' },
  { id: 'herbal', label: 'Herbal' },
]

export const TEAS: Tea[] = [
  {
    id: 'tea-dragon-well',
    slug: 'dragon-well-green',
    name: 'Dragon Well',
    category: 'green',
    origin: 'Hangzhou, China',
    priceCents: 2400,
    weightGrams: 50,
    tastingNotes: ['chestnut', 'toasted rice', 'sweet finish'],
    caffeine: 'medium',
    inStock: true,
  },
  {
    id: 'tea-gyokuro',
    slug: 'shaded-gyokuro',
    name: 'Shaded Gyokuro',
    category: 'green',
    origin: 'Uji, Japan',
    priceCents: 3200,
    weightGrams: 40,
    tastingNotes: ['umami', 'edamame', 'sea breeze'],
    caffeine: 'high',
    inStock: true,
  },
  {
    id: 'tea-assam',
    slug: 'second-flush-assam',
    name: 'Second Flush Assam',
    category: 'black',
    origin: 'Assam, India',
    priceCents: 1900,
    weightGrams: 75,
    tastingNotes: ['malt', 'cocoa', 'brown sugar'],
    caffeine: 'high',
    inStock: true,
  },
  {
    id: 'tea-keemun',
    slug: 'keemun-hao-ya',
    name: 'Keemun Hao Ya',
    category: 'black',
    origin: 'Anhui, China',
    priceCents: 2100,
    weightGrams: 60,
    tastingNotes: ['dried plum', 'smoked honey', 'rose'],
    caffeine: 'medium',
    inStock: true,
  },
  {
    id: 'tea-dong-ding',
    slug: 'dong-ding-oolong',
    name: 'Dong Ding Oolong',
    category: 'oolong',
    origin: 'Nantou, Taiwan',
    priceCents: 2800,
    weightGrams: 55,
    tastingNotes: ['orchid', 'butter', 'roasted almond'],
    caffeine: 'medium',
    inStock: true,
  },
  {
    id: 'tea-milk-oolong',
    slug: 'milk-oolong',
    name: 'Milk Oolong',
    category: 'oolong',
    origin: 'Nantou, Taiwan',
    priceCents: 2600,
    weightGrams: 50,
    tastingNotes: ['cream', 'lactose', 'gardenia'],
    caffeine: 'medium',
    inStock: false,
  },
  {
    id: 'tea-chamomile',
    slug: 'chamomile-blossom',
    name: 'Chamomile Blossom',
    category: 'herbal',
    origin: 'Chamomile fields, Egypt',
    priceCents: 1500,
    weightGrams: 40,
    tastingNotes: ['apple', 'honey', 'warm straw'],
    caffeine: 'none',
    inStock: true,
  },
  {
    id: 'tea-rooibos',
    slug: 'rooibos-orange',
    name: 'Rooibos & Orange Peel',
    category: 'herbal',
    origin: 'Cederberg, South Africa',
    priceCents: 1600,
    weightGrams: 65,
    tastingNotes: ['vanilla', 'orange zest', 'cedar'],
    caffeine: 'none',
    inStock: true,
  },
]

export function filterTeas(
  teas: Tea[],
  category: TeaCategoryFilter,
): Tea[] {
  if (category === 'all') {
    return teas
  }

  return teas.filter((tea) => tea.category === category)
}

export function getTeaById(teas: Tea[], id: string): Tea | undefined {
  return teas.find((tea) => tea.id === id)
}
