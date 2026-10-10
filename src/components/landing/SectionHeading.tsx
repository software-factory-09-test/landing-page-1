type SectionHeadingProps = {
  kicker?: string
  title: string
  description?: string
  id?: string
  testId?: string
}

export function SectionHeading({
  kicker,
  title,
  description,
  id,
  testId,
}: SectionHeadingProps) {
  return (
    <div className="mb-5 max-w-2xl">
      {kicker ? <p className="island-kicker mb-2">{kicker}</p> : null}
      <h2
        id={id}
        data-testid={testId}
        className="display-title m-0 text-3xl font-bold tracking-tight text-[var(--sea-ink)] sm:text-4xl"
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-3 text-sm text-[var(--sea-ink-soft)] sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  )
}
