export type SubscribeStatus = 'idle' | 'submitting' | 'success' | 'error'

export type SubscribeState = {
  status: SubscribeStatus
  message: string
  email: string
}

export const EMAIL_REQUIRED_MESSAGE =
  'Please enter your email address.'

export const EMAIL_INVALID_MESSAGE =
  'Please enter a valid email address like name@example.com.'

export const NETWORK_ERROR_MESSAGE =
  'Something went wrong on our end. Please try again in a moment.'

const SIMULATED_FAILURE_SUFFIX = '@invalid.test'

export function isValidEmail(value: string): boolean {
  const email = value.trim()

  if (email.length === 0) {
    return false
  }

  if (/\s/.test(email)) {
    return false
  }

  const atIndex = email.indexOf('@')
  if (atIndex <= 0) {
    return false
  }

  if (email.indexOf('@', atIndex + 1) !== -1) {
    return false
  }

  const local = email.slice(0, atIndex)
  const domain = email.slice(atIndex + 1)

  if (local.length === 0 || domain.length === 0) {
    return false
  }

  const lastDot = domain.lastIndexOf('.')
  if (lastDot <= 0 || lastDot === domain.length - 1) {
    return false
  }

  return true
}

export function validateEmail(value: string): string | null {
  if (value.trim().length === 0) {
    return EMAIL_REQUIRED_MESSAGE
  }

  if (!isValidEmail(value)) {
    return EMAIL_INVALID_MESSAGE
  }

  return null
}

export function isSimulatedNetworkFailure(value: string): boolean {
  return value.trim().toLowerCase().endsWith(SIMULATED_FAILURE_SUFFIX)
}

export function submitStarted(state: SubscribeState): SubscribeState {
  return { ...state, status: 'submitting', message: '' }
}

export function submitFailed(
  state: SubscribeState,
  message: string,
): SubscribeState {
  return { ...state, status: 'error', message }
}

export function submitSucceeded(state: SubscribeState): SubscribeState {
  return {
    ...state,
    status: 'success',
    message: `Thanks! We'll send fresh tea notes to ${state.email.trim()}.`,
  }
}

export function submitFinishedState(state: SubscribeState): SubscribeState {
  const validationError = validateEmail(state.email)
  if (validationError) {
    return submitFailed(state, validationError)
  }

  if (isSimulatedNetworkFailure(state.email)) {
    return submitFailed(state, NETWORK_ERROR_MESSAGE)
  }

  return submitSucceeded(state)
}
