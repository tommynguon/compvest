import { describe, expect, it } from 'vitest'
import { centsToDollars, dollarsToCents, formatCad } from './money'

describe('money helpers', () => {
  it('converts dollars and cents without floating point leakage', () => {
    expect(dollarsToCents(1234.56)).toBe(123456)
    expect(centsToDollars(123456)).toBe(1234.56)
  })

  it('formats Canadian dollars for decision cards', () => {
    expect(formatCad(10_500_000)).toContain('105,000')
  })
})
