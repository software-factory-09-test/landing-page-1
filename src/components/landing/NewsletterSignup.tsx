import { useEffect, useId, useRef, useState } from 'react'
import { SectionHeading } from './SectionHeading'
import {
  EMAIL_INVALID_MESSAGE,
  submitFailed,
  submitFinishedState,
  submitStarted,
  validateEmail,
  type SubscribeState,
} from '../../lib/newsletter.ts'

const INITIAL_STATE: SubscribeState = {
  status: 'idle',
  message: '',
  email: '',
}

export function NewsletterSignup() {
  const [state, setState] = useState<SubscribeState>(INITIAL_STATE)
  const inputId = useId()
  const errorId = useId()
  const statusId = useId()

  const hasError = state.status === 'error'
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
      }
    }
  }, [])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationError = validateEmail(state.email)
    if (validationError) {
      setState((prev) => submitFailed(prev, validationError))
      return
    }

    setState((prev) => submitStarted(prev))

    if (timerRef.current) {
      clearTimeout(timerRef.current)
    }

    timerRef.current = setTimeout(() => {
      setState((prev) => submitFinishedState(prev))
    }, 450)
  }

  return (
    <section
      id="newsletter"
      className="anchor-offset mt-14"
      aria-labelledby="newsletter-heading"
    >
      <SectionHeading
        id="newsletter-heading"
        kicker="Tea letter"
        title="Brewing notes, once a month"
        description="Brewing guides, harvest updates, and early access to limited lots. No spam, unsubscribe anytime."
      />

      <form
        data-testid="newsletter-form"
        onSubmit={handleSubmit}
        noValidate
        className="island-shell max-w-xl rounded-2xl p-5 sm:p-6"
      >
        <label
          htmlFor={inputId}
          className="mb-2 block text-sm font-semibold text-[var(--sea-ink)]"
        >
          Email address
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id={inputId}
            type="email"
            name="email"
            value={state.email}
            onChange={(event) =>
              setState((prev) => ({ ...prev, email: event.target.value }))
            }
            placeholder="name@example.com"
            autoComplete="email"
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : undefined}
            className="demo-input"
          />
          <button
            type="submit"
            disabled={state.status === 'submitting'}
            className="demo-button whitespace-nowrap"
          >
            {state.status === 'submitting' ? 'Subscribing…' : 'Subscribe'}
          </button>
        </div>

        {hasError ? (
          <p
            id={errorId}
            role="alert"
            data-testid="newsletter-error"
            className="mt-3 text-sm font-semibold text-[#9f3030]"
          >
            {state.message || EMAIL_INVALID_MESSAGE}
          </p>
        ) : null}

        <p
          id={statusId}
          role="status"
          aria-live="polite"
          data-testid="newsletter-status"
          className={
            state.status === 'success'
              ? 'mt-3 text-sm font-semibold text-[var(--palm)]'
              : 'sr-only'
          }
        >
          {state.status === 'success' ? state.message : ''}
        </p>
      </form>
    </section>
  )
}
