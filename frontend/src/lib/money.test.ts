import { describe, expect, it } from 'vitest'
import { centsToDollars, dollarsToCents, formatMoney } from './money'

describe('money helpers', () => {
  it('converts dollars and cents without floating point leakage', () => {
    expect(dollarsToCents(1234.56)).toBe(123456)
    expect(centsToDollars(123456)).toBe(1234.56)
  })

  it('formats CAD and USD for decision cards', () => {
    expect(formatMoney(10_500_000, 'CAD')).toContain('105,000')
    expect(formatMoney(10_500_000, 'USD')).toContain('US')
  })
})
