import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle2, ExternalLink, Info, TrendingUp } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../lib/api'
import { formatCad } from '../lib/money'
import type { Comparison, OfferProjection, ProjectionYear } from '../lib/types'

export function ComparePage() {
  const [params] = useSearchParams()
  const ids = params.get('ids')?.split(',').map(Number).filter(Boolean) ?? []
  const comparisonQuery = useQuery({
    queryKey: ['comparison', ...ids],
    queryFn: () => api<{ comparison: Comparison }>('/api/v1/comparisons', { method: 'POST', body: JSON.stringify({ offer_ids: ids }) }),
    enabled: ids.length === 2,
  })

  if (ids.length !== 2) return <div className="page-state">Choose exactly two offers to compare.</div>
  if (comparisonQuery.isLoading) return <div className="page-state">Calculating taxes, costs, and four years of value…</div>
  if (!comparisonQuery.data) return <div className="page-state">We could not build this comparison. <Link to="/">Choose offers again</Link>.</div>

  const result = comparisonQuery.data.comparison
  const [left, right] = result.offers
  const winner = result.offers.find((item) => item.offer.id === result.winner_offer_id)!
  const chartData = left.years.map((year, index) => ({
    name: `Year ${year.year}`,
    [left.offer.company]: Math.round(year.disposable_cash_cents / 100),
    [right.offer.company]: Math.round(right.years[index].disposable_cash_cents / 100),
  }))

  return (
    <div className="page-wrap compare-page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to offers</Link>
      <div className="compare-heading"><div><span className="eyebrow">Four-year decision view</span><h1>{left.offer.company} <i>or</i> {right.offer.company}?</h1><p>Same dollars, same timeline, every assumption visible.</p></div><div className="version-chip">Tax data {result.tax_data_version}</div></div>

      <section className="winner-banner"><span className="winner-icon"><TrendingUp size={25} /></span><div><small>STRONGER DISPOSABLE-CASH OUTCOME</small><h2>{winner.offer.company} leads by {formatCad(result.four_year_disposable_difference_cents)}</h2><p>Across four years, after estimated payroll deductions and the location costs you entered.</p></div><CheckCircle2 size={28} className="winner-check" /></section>

      <div className="comparison-cards">{[left, right].map((projection) => <ProjectionCard key={projection.offer.id} projection={projection} winner={projection.offer.id === result.winner_offer_id} />)}</div>

      <section className="chart-panel">
        <div className="panel-heading"><div><span className="eyebrow">Disposable cash</span><h2>What remains each year</h2></div><p>After estimated taxes, payroll deductions, rent, commute, and relocation.</p></div>
        <div className="chart-wrap"><ResponsiveContainer width="100%" height={340}><BarChart data={chartData} barGap={8}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dfe3dc" /><XAxis dataKey="name" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `$${Math.round(value / 1000)}k`} /><Tooltip formatter={(value) => formatCad(Number(value) * 100)} cursor={{ fill: '#f3f1e9' }} /><Legend /><Bar dataKey={left.offer.company} fill="#163f35" radius={[6, 6, 0, 0]} /><Bar dataKey={right.offer.company} fill="#d89b55" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div>
      </section>

      <section className="year-table-panel">
        <div className="panel-heading"><div><span className="eyebrow">Line by line</span><h2>Year 1 breakdown</h2></div><p>Equity is valued in its vesting year; signing and relocation apply only in year one.</p></div>
        <div className="breakdown-table"><div className="table-row table-head"><span>Category</span><strong>{left.offer.company}</strong><strong>{right.offer.company}</strong></div>{([
          ['Gross cash', 'gross_cash_cents'], ['Vesting equity', 'equity_cents'], ['Income tax', 'income_tax_cents'], ['CPP/QPP', 'cpp_qpp_cents'], ['EI/QPIP', 'ei_qpip_cents'], ['Rent + commute + relocation', 'location_costs_cents'], ['Disposable cash', 'disposable_cash_cents'], ['Total package', 'total_package_cents'],
        ] as [string, keyof ProjectionYear][]).map(([label, key]) => <div className={`table-row ${label === 'Disposable cash' ? 'emphasis' : ''}`} key={key}><span>{label}</span><strong>{formatCad(left.years[0][key] as number)}</strong><strong>{formatCad(right.years[0][key] as number)}</strong></div>)}</div>
      </section>

      <section className="method-note"><Info size={20} /><div><h3>Planning estimate, not a tax return</h3><p>{result.disclaimer} Standard/basic credits are assumed; edit an offer to override annual income tax.</p><div className="source-links">{result.source_urls.map((url, index) => <a key={url} href={url} target="_blank" rel="noreferrer">Official source {index + 1} <ExternalLink size={13} /></a>)}</div></div></section>
    </div>
  )
}

function ProjectionCard({ projection, winner }: { projection: OfferProjection; winner: boolean }) {
  const yearOne = projection.years[0]
  return <article className={`projection-card ${winner ? 'winner' : ''}`}><div className="projection-top"><div><span>{projection.offer.city}, {projection.offer.jurisdiction}</span><h2>{projection.offer.company}</h2><p>{projection.offer.role} · {projection.offer.work_mode}</p></div>{winner && <span className="best-badge"><CheckCircle2 size={14} /> Best outcome</span>}</div><div className="projection-primary"><span>4-year disposable cash</span><strong>{formatCad(projection.totals.disposable_cash_cents)}</strong></div><div className="projection-metrics"><span><small>Year 1 disposable</small><strong>{formatCad(yearOne.disposable_cash_cents)}</strong></span><span><small>4-year package</small><strong>{formatCad(projection.totals.total_package_cents)}</strong></span><span><small>Year 1 deductions</small><strong>{formatCad(yearOne.income_tax_cents + yearOne.cpp_qpp_cents + yearOne.ei_qpip_cents)}</strong></span></div></article>
}
