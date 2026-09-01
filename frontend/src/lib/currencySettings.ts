import { useState } from 'react'
import type { CurrencyCode } from './types'

export const DEFAULT_USD_TO_CAD_RATE = 1.3888
export const DEFAULT_RATE_DATE = '2026-08-28'
const STORAGE_KEY = 'compvest.currency-settings'

export type CurrencySettings = {
  displayCurrency: CurrencyCode
  usdToCadRate: number
  rateDate: string
  rateSource: 'bank_of_canada' | 'manual'
}

const defaults: CurrencySettings = {
  displayCurrency: 'CAD',
  usdToCadRate: DEFAULT_USD_TO_CAD_RATE,
  rateDate: DEFAULT_RATE_DATE,
  rateSource: 'bank_of_canada',
}

function loadSettings(): CurrencySettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    const displayCurrency = saved.displayCurrency === 'USD' ? 'USD' : 'CAD'
    const rate = Number(saved.usdToCadRate)
    const rateDate = /^\d{4}-\d{2}-\d{2}$/.test(saved.rateDate) ? saved.rateDate : defaults.rateDate
    const rateSource = saved.rateSource === 'manual' ? 'manual' : 'bank_of_canada'
    return { displayCurrency, usdToCadRate: rate >= 0.1 && rate <= 10 ? rate : defaults.usdToCadRate, rateDate, rateSource }
  } catch {
    return defaults
  }
}

export function useCurrencySettings() {
  const [settings, setSettingsState] = useState<CurrencySettings>(loadSettings)
  const setSettings = (next: CurrencySettings) => {
    setSettingsState(next)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  }
  return { settings, setSettings }
}
