import { useState } from 'react'
import type { CurrencyCode } from './types'

export const DEFAULT_USD_TO_CAD_RATE = 1.3888
export const DEFAULT_RATE_DATE = '2026-08-28'
const STORAGE_KEY = 'compvest.currency-settings'

export type CurrencySettings = {
  displayCurrency: CurrencyCode
  usdToCadRate: number
}

const defaults: CurrencySettings = { displayCurrency: 'CAD', usdToCadRate: DEFAULT_USD_TO_CAD_RATE }

function loadSettings(): CurrencySettings {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
    const displayCurrency = saved.displayCurrency === 'USD' ? 'USD' : 'CAD'
    const rate = Number(saved.usdToCadRate)
    return { displayCurrency, usdToCadRate: rate >= 0.1 && rate <= 10 ? rate : defaults.usdToCadRate }
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
