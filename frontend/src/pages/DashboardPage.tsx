import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, BriefcaseBusiness, Building2, Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { DEFAULT_RATE_DATE, useCurrencySettings } from '../lib/currencySettings'
import { formatMoney } from '../lib/money'
import type { Offer } from '../lib/types'

export function DashboardPage() {
  const [selected, setSelected] = useState<number[]>([])
  const { settings, setSettings } = useCurrencySettings()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const offersQuery = useQuery({ queryKey: ['offers'], queryFn: () => api<{ offers: Offer[] }>('/api/v1/offers') })
  const deleteOffer = useMutation({
    mutationFn: (id: number) => api(`/api/v1/offers/${id}`, { method: 'DELETE' }),
    onSuccess: (_data, id) => {
      setSelected((current) => current.filter((value) => value !== id))
      queryClient.invalidateQueries({ queryKey: ['offers'] })
    },
  })
  const offers = offersQuery.data?.offers ?? []

  const toggle = (id: number) => setSelected((current) => {
    if (current.includes(id)) return current.filter((value) => value !== id)
    if (current.length === 2) return [current[1], id]
    return [...current, id]
  })

  const openComparison = () => {
    const query = new URLSearchParams({
      ids: selected.join(','), currency: settings.displayCurrency, rate: String(settings.usdToCadRate),
    })
    navigate(`/compare?${query}`)
  }

  return (
    <div className="page-wrap dashboard-page">
      <div className="dashboard-hero compact-hero">
        <div><span className="eyebrow">Personal planning tool</span><h1>My offers</h1><p>Compare Canadian and U.S. compensation against taxes and the costs you expect to pay.</p></div>
        <div className="hero-stat"><span>Saved locally</span><strong>{String(offers.length).padStart(2, '0')}</strong><small>{selected.length}/2 selected</small></div>
      </div>

      <div className="toolbar">
        <div><h2>Saved offers</h2><p>Select two cards to compare.</p></div>
        <Link className="secondary-button" to="/offers/new"><Plus size={17} /> Add an offer</Link>
      </div>

      {offersQuery.isLoading ? <div className="page-state">Loading saved offers…</div> : offers.length === 0 ? (
        <div className="empty-state"><span className="empty-icon"><BriefcaseBusiness size={30} /></span><h2>No offers yet</h2><p>Add the details from an offer letter, then enter the living-cost assumptions that matter to you.</p><Link className="primary-button" to="/offers/new"><Plus size={17} /> Add an offer</Link></div>
      ) : (
        <div className="offer-grid">
          {offers.map((offer, index) => {
            const active = selected.includes(offer.id)
            const periodFactor = offer.employment_type === 'internship' ? offer.term_weeks / 52 : 1
            const basePay = offer.pay_basis === 'hourly'
              ? offer.hourly_rate_cents * Number(offer.hours_per_week) * (offer.employment_type === 'internship' ? offer.term_weeks : 52)
              : offer.salary_cents * periodFactor
            const packageValue = basePay + offer.annual_bonus_cents * periodFactor + offer.signing_bonus_cents +
              offer.equity_vesting_cents[0] * periodFactor +
              (offer.retirement_match_cents + offer.taxable_benefits_cents + offer.non_taxable_benefits_cents) * periodFactor
            return (
              <article key={offer.id} className={`offer-card ${active ? 'selected' : ''}`} onClick={() => toggle(offer.id)}>
                <div className="card-top"><span className="offer-number">{String(index + 1).padStart(2, '0')}</span><span className={`select-check ${active ? 'active' : ''}`}>{active && <Check size={15} />}</span></div>
                <div className="company-line"><span className="company-icon"><Building2 size={19} /></span><div><h3>{offer.company}</h3><p>{offer.role}</p></div></div>
                <div className="offer-location"><MapPin size={14} /> {offer.city}, {offer.jurisdiction}<span>·</span>{offer.country_code}<span>·</span>{offer.work_mode}</div>
                <div className="package-value"><span>{offer.employment_type === 'internship' ? `${offer.term_weeks}-week package` : 'Year 1 package'}</span><strong>{formatMoney(packageValue, offer.currency_code)}</strong></div>
                <div className="card-breakdown"><span><small>{offer.pay_basis === 'hourly' ? 'Hourly' : 'Base'}</small>{offer.pay_basis === 'hourly' ? `${formatMoney(offer.hourly_rate_cents, offer.currency_code)}/hr` : formatMoney(offer.salary_cents, offer.currency_code, true)}</span><span><small>Bonus</small>{formatMoney(offer.annual_bonus_cents + offer.signing_bonus_cents, offer.currency_code, true)}</span><span><small>Currency</small>{offer.currency_code}</span></div>
                <div className="card-actions"><Link to={`/offers/${offer.id}/edit`} onClick={(event) => event.stopPropagation()}><Pencil size={15} /> Edit</Link><button onClick={(event) => { event.stopPropagation(); if (window.confirm(`Delete the ${offer.company} offer?`)) deleteOffer.mutate(offer.id) }}><Trash2 size={15} /> Delete</button></div>
              </article>
            )
          })}
          <Link to="/offers/new" className="add-card"><Plus size={24} /><span>Add another offer</span><small>Save another scenario</small></Link>
        </div>
      )}

      {offers.length > 0 && <div className={`compare-dock ${selected.length === 2 ? 'ready' : ''}`}>
        <div className="fx-settings">
          <label>Show results in<select value={settings.displayCurrency} onChange={(event) => setSettings({ ...settings, displayCurrency: event.target.value as 'CAD' | 'USD' })}><option value="CAD">CAD</option><option value="USD">USD</option></select></label>
          <label>1 USD =<span className="rate-input"><input aria-label="USD to CAD exchange rate" type="number" min="0.1" max="10" step="0.0001" value={settings.usdToCadRate} onChange={(event) => setSettings({ ...settings, usdToCadRate: Number(event.target.value) })} /> CAD</span><small>Initial Bank of Canada rate · {DEFAULT_RATE_DATE}</small></label>
        </div>
        <div className="compare-action"><div><span>{selected.length === 2 ? 'Ready to compare' : 'Choose two offers'}</span><strong>{selected.length === 2 ? selected.map((id) => offers.find((offer) => offer.id === id)?.company).join(' vs. ') : `${2 - selected.length} remaining`}</strong></div><button className="primary-button" disabled={selected.length !== 2 || settings.usdToCadRate < 0.1 || settings.usdToCadRate > 10} onClick={openComparison}>Compare savings <ArrowRight size={17} /></button></div>
      </div>}
    </div>
  )
}
