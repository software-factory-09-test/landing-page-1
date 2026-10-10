import { SectionHeading } from './SectionHeading'

const TESTIMONIALS = [
  {
    quote:
      'The gyokuro tastes like the first green of spring. I have never had a fresher cup from a mail-order box.',
    name: 'Priya R.',
    detail: 'Home brewer, Portland',
  },
  {
    quote:
      'Steep & Co. taught me to stop scalding my green tea. The tasting notes on every pouch genuinely helped.',
    name: 'Marcus L.',
    detail: 'Café owner, Austin',
  },
  {
    quote:
      'Fast shipping, thoughtful packaging, and a Keemun that converted my coffee-drinking partner. Sold.',
    name: 'Dana K.',
    detail: 'Tea letter subscriber',
  },
]

export function StorySection() {
  return (
    <section id="story" className="anchor-offset mt-14" aria-labelledby="story-heading">
      <SectionHeading
        id="story-heading"
        kicker="Our story"
        title="From garden to gaiwan"
        description="We work with a small circle of growers, pay above market, and roast in batches small enough to taste every lot before it ships."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="island-shell rounded-2xl p-5 sm:col-span-2 lg:col-span-1">
          <h3 className="mb-2 text-lg font-semibold text-[var(--sea-ink)]">
            Sourced with intention
          </h3>
          <p className="m-0 text-sm leading-7 text-[var(--sea-ink-soft)]">
            Every harvest is cupped blind, graded, and matched to the season. If
            a lot does not taste like the garden it came from, we do not list it.
          </p>
        </article>
        {TESTIMONIALS.map((testimonial) => (
          <figure
            key={testimonial.name}
            data-testid="testimonial"
            className="island-shell m-0 rounded-2xl p-5"
          >
            <blockquote className="m-0 text-sm leading-7 text-[var(--sea-ink)]">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>
            <figcaption className="mt-3 text-xs font-semibold text-[var(--sea-ink-soft)]">
              {testimonial.name} &middot; {testimonial.detail}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  )
}
