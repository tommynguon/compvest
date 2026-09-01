import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, ExternalLink, Info, TrendingUp } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../lib/api'
import { DEFAULT_USD_TO_CAD_RATE } from '../lib/currencySettings'
import { formatMoney } from '../lib/money'
import type { Comparison, CurrencyCode, OfferProjection, ProjectionPeriod } from '../lib/types'

export function ComparePage() {
  const [params] = useSearchParams()
  const ids = params.get('ids')?.split(',').map(Number).filter(Boolean) ?? []
  const displayCurrency = (params.get('currency') === 'USD' ? 'USD' : 'CAD') as CurrencyCode
  const usdToCadRate = Number(params.get('rate') ?? DEFAULT_USD_TO_CAD_RATE)
  const exchangeRateDate = params.get('rateDate')
  const exchangeRateSource = params.get('rateSource') === 'bank_of_canada' ? 'bank_of_canada' : 'manual'
  const comparisonQuery = useQuery({
    queryKey: ['comparison', ...ids, displayCurrency, usdToCadRate, exchangeRateDate, exchangeRateSource],
    queryFn: () => api<{ comparison: Comparison }>('/api/v1/comparisons', {
      method: 'POST',
      body: JSON.stringify({
        offer_ids: ids,
        display_currency: displayCurrency,
        usd_to_cad_rate: usdToCadRate,
        exchange_rate_date: exchangeRateDate,
        exchange_rate_source: exchangeRateSource,
      }),
    }),
    enabled: ids.length === 2,
  })

  if (ids.length !== 2) return <div className="page-state">Choose exactly two offers to compare.</div>
  if (comparisonQuery.isLoading) return <div className="page-state">Estimating taxes, costs, and savings…</div>
  if (!comparisonQuery.data) return <div className="page-state">This comparison could not be calculated. <Link to="/">Check your offers and exchange rate</Link>.</div>

  const result = comparisonQuery.data.comparison
  const [left, right] = result.offers
  const winner = result.offers.find((item) => item.offer.id === result.winner_offer_id)!
  const weekly = result.comparison_basis === 'weekly_savings'
  const chartData = result.offers.map((projection) => ({
    name: projection.offer.company,
    savings: Math.round((weekly ? projection.weekly_savings_cents : projection.totals.estimated_savings_cents) / 100),
  }))

  return (
    <div className="page-wrap compare-page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to my offers</Link>
      <div className="compare-heading"><div><span className="eyebrow">{weekly ? 'Internship comparison' : 'Four-year comparison'}</span><h1>{left.offer.company} <i>or</i> {right.offer.company}?</h1><p>Results normalized to {result.display_currency} at 1 USD = {result.usd_to_cad_rate} CAD.</p></div><div className="version-chip">Tax data {result.tax_data_version}</div></div>

      <section className="winner-banner"><span className="winner-icon"><TrendingUp size={25} /></span><div><small>HIGHER ESTIMATED SAVINGS</small><h2>{winner.offer.company} leads by {formatMoney(result.savings_difference_cents, result.display_currency)}{weekly ? ' per week' : ' over four years'}</h2><p>{weekly ? 'Weekly savings is used so internships of different lengths stay comparable.' : 'After estimated deductions and all entered living costs.'}</p></div><CheckCircle2 size={28} className="winner-check" /></section>

      <div className="comparison-cards">{[left, right].map((projection) => <ProjectionCard key={projection.offer.id} projection={projection} winner={projection.offer.id === result.winner_offer_id} currency={result.display_currency} />)}</div>

      <section className="chart-panel">
        <div className="panel-heading"><div><span className="eyebrow">Estimated savings</span><h2>{weekly ? 'Savings per week' : 'Savings across four years'}</h2></div><p>After estimated income tax, payroll deductions, rent, commute, relocation, and other entered costs.</p></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height={320}><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe3dc" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} /><Tooltip formatter={(value) => formatMoney(Number(value) * 100, result.display_currency)} cursor={{ fill: '#f3f1e9' }} /><Bar dataKey="savings" name={weekly ? 'Savings / week' : 'Four-year savings'} fill="#163f35" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </section>

      <section className="year-table-panel">
        <div className="panel-heading"><div><span className="eyebrow">Line by line</span><h2>{weekly ? 'Internship term breakdown' : 'Year 1 breakdown'}</h2></div><p>Each offer is calculated in its native currency, then converted for this view.</p></div>
        <div className="breakdown-table"><div className="table-row table-head"><span>Category</span><strong>{left.offer.company}</strong><strong>{right.offer.company}</strong></div>{([
          ['Gross cash', 'gross_cash_cents'], ['Vesting equity', 'equity_cents'], ['Federal income tax', 'federal_tax_cents'],
          ['Regional income tax', 'regional_tax_cents'], ['Payroll deductions', 'payroll_deductions_cents'],
          ['Rent + living + commute + relocation', 'location_costs_cents'], ['Estimated savings after entered costs', 'estimated_savings_cents'], ['Total package', 'total_package_cents'],
        ] as [string, keyof ProjectionPeriod][]).map(([label, key]) => <div className={`table-row ${key === 'estimated_savings_cents' ? 'emphasis' : ''}`} key={key}><span>{label}</span><strong>{formatMoney(left.periods[0][key] as number, result.display_currency)}</strong><strong>{formatMoney(right.periods[0][key] as number, result.display_currency)}</strong></div>)}</div>
        <div className="payroll-context"><span>{left.offer.country_code === 'CA' ? 'Canada payroll: CPP/QPP and EI/QPIP' : 'U.S. payroll: Social Security and Medicare'}</span><span>{right.offer.country_code === 'CA' ? 'Canada payroll: CPP/QPP and EI/QPIP' : 'U.S. payroll: Social Security and Medicare'}</span></div>
      </section>

      <section className="method-note"><Info size={20} /><div><h3>Planning estimate, not a tax return</h3><p>{result.disclaimer} Edit an offer to override income tax or payroll deductions.</p><p>FX rate saved for offline use · {result.exchange_rate_source === 'bank_of_canada' ? 'Bank of Canada daily rate' : 'Manual override'} dated {result.exchange_rate_date}.</p><div className="source-links">{result.exchange_rate_source_url && <a href={result.exchange_rate_source_url} target="_blank" rel="noreferrer">Exchange-rate source <ExternalLink size={13} /></a>}{result.source_urls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer">Calculation source {index + 1} <ExternalLink size={13} /></a>)}</div></div></section>
    </div>
  )
}

function ProjectionCard({ projection, winner, currency }: { projection: OfferProjection; winner: boolean; currency: CurrencyCode }) {
  const period = projection.periods[0]
  const internship = projection.offer.employment_type === 'internship'
  return <article className={`projection-card ${winner ? 'winner' : ''}`}><div className="projection-top"><div><span>{projection.offer.city}, {projection.offer.jurisdiction} · {projection.native_currency}</span><h2>{projection.offer.company}</h2><p>{projection.offer.role} · {projection.offer.work_mode}</p></div>{winner && <span className="best-badge"><CheckCircle2 size={14} /> Higher savings</span>}</div><div className="projection-primary"><span>{internship ? `Total ${projection.offer.term_weeks}-week savings` : 'Four-year estimated savings'}</span><strong>{formatMoney(projection.totals.estimated_savings_cents, currency)}</strong></div><div className="projection-metrics"><span><small>Savings / week</small><strong>{formatMoney(projection.weekly_savings_cents, currency)}</strong></span><span><small>{internship ? 'Term package' : 'Four-year package'}</small><strong>{formatMoney(projection.totals.total_package_cents, currency)}</strong></span><span><small>{internship ? 'Term deductions' : 'Year 1 deductions'}</small><strong>{formatMoney(period.income_tax_cents + period.payroll_deductions_cents, currency)}</strong></span></div></article>
}
