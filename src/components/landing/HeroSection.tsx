export function HeroSection() {
  return (
    <section
      id="top"
      className="island-shell anchor-offset rise-in relative overflow-hidden rounded-[2rem] px-6 py-10 sm:px-10 sm:py-14"
    >
      <div className="pointer-events-none absolute -left-20 -top-24 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(79,184,178,0.32),transparent_66%)]" />
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-[radial-gradient(circle,rgba(47,106,74,0.18),transparent_66%)]" />

      <p className="island-kicker mb-3">Steep &amp; Co. Tea Merchants</p>
      <h1 className="display-title mb-5 max-w-3xl text-4xl font-bold leading-[1.02] tracking-tight text-[var(--sea-ink)] sm:text-5xl lg:text-6xl">
        Small-batch loose-leaf tea, steeped right.
      </h1>
      <p className="mb-8 max-w-2xl text-base text-[var(--sea-ink-soft)] sm:text-lg">
        We source single-origin leaves from gardens we visit, pack them in small
        batches, and ship them within days of harvest. Build a box that fits
        your kettle and your morning ritual.
      </p>

      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <a
          href="#teas"
          className="rounded-full border border-[rgba(50,143,151,0.3)] bg-[rgba(79,184,178,0.14)] px-5 py-2.5 text-center text-sm font-semibold text-[var(--lagoon-deep)] no-underline transition hover:-translate-y-0.5 hover:bg-[rgba(79,184,178,0.24)]"
        >
          Shop the teas
        </a>
        <a
          href="#newsletter"
          className="rounded-full border border-[rgba(23,58,64,0.2)] bg-white/50 px-5 py-2.5 text-center text-sm font-semibold text-[var(--sea-ink)] no-underline transition hover:-translate-y-0.5 hover:border-[rgba(23,58,64,0.35)]"
        >
          Join the tea letter
        </a>
      </div>

      <dl className="m-0 grid gap-4 sm:grid-cols-3">
        <div>
          <dt className="island-kicker mb-1">Sourced</dt>
          <dd className="m-0 text-sm text-[var(--sea-ink-soft)]">
            Direct-trade gardens across Asia and Africa
          </dd>
        </div>
        <div>
          <dt className="island-kicker mb-1">Hand-picked</dt>
          <dd className="m-0 text-sm text-[var(--sea-ink-soft)]">
            Tasted and graded leaf by leaf, every harvest
          </dd>
        </div>
        <div>
          <dt className="island-kicker mb-1">Free shipping</dt>
          <dd className="m-0 text-sm text-[var(--sea-ink-soft)]">
            On orders over $45, always carbon-aware
          </dd>
        </div>
      </dl>
    </section>
  )
}
