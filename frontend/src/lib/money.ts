import type { CurrencyCode } from './types'

export const formatMoney = (cents: number, currency: CurrencyCode, compact = false) =>
  new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
    notation: compact ? 'compact' : 'standard',
  }).format(cents / 100)

export const dollarsToCents = (value: number | undefined) => Math.round((value || 0) * 100)
export const centsToDollars = (value: number | undefined) => (value || 0) / 100
