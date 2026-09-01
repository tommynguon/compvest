import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, BriefcaseBusiness, Building2, Check, MapPin, Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { formatCad } from '../lib/money'
import type { Offer } from '../lib/types'

export function DashboardPage() {
  const [selected, setSelected] = useState<number[]>([])
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

  return (
    <div className="page-wrap dashboard-page">
      <div className="dashboard-hero">
        <div><span className="eyebrow">Your decision workspace</span><h1>Offers, without<br />the guesswork.</h1><p>Choose two offers to compare what remains after taxes and real-life costs.</p></div>
        <div className="hero-stat"><span>Saved offers</span><strong>{String(offers.length).padStart(2, '0')}</strong><small>{selected.length}/2 selected</small></div>
      </div>

      <div className="toolbar">
        <div><h2>Select two offers</h2><p>The green outline marks your comparison set.</p></div>
        <Link className="secondary-button" to="/offers/new"><Plus size={17} /> Add an offer</Link>
      </div>

      {offersQuery.isLoading ? <div className="page-state">Loading your offers…</div> : offers.length === 0 ? (
        <div className="empty-state"><span className="empty-icon"><BriefcaseBusiness size={30} /></span><h2>Your first decision starts here.</h2><p>Add the details from one offer letter. You can refine costs and tax assumptions anytime.</p><Link className="primary-button" to="/offers/new"><Plus size={17} /> Add your first offer</Link></div>
      ) : (
        <div className="offer-grid">
          {offers.map((offer, index) => {
            const active = selected.includes(offer.id)
            const annualPackage = offer.salary_cents + offer.annual_bonus_cents + offer.signing_bonus_cents + offer.equity_vesting_cents[0] + offer.retirement_match_cents + offer.taxable_benefits_cents + offer.non_taxable_benefits_cents
            return (
              <article key={offer.id} className={`offer-card ${active ? 'selected' : ''}`} onClick={() => toggle(offer.id)}>
                <div className="card-top"><span className="offer-number">{String(index + 1).padStart(2, '0')}</span><span className={`select-check ${active ? 'active' : ''}`}>{active && <Check size={15} />}</span></div>
                <div className="company-line"><span className="company-icon"><Building2 size={19} /></span><div><h3>{offer.company}</h3><p>{offer.role}</p></div></div>
                <div className="offer-location"><MapPin size={14} /> {offer.city}, {offer.jurisdiction}<span>·</span>{offer.work_mode}</div>
                <div className="package-value"><span>Year 1 package</span><strong>{formatCad(annualPackage)}</strong></div>
                <div className="card-breakdown"><span><small>Base</small>{formatCad(offer.salary_cents, true)}</span><span><small>Bonus</small>{formatCad(offer.annual_bonus_cents + offer.signing_bonus_cents, true)}</span><span><small>Equity</small>{formatCad(offer.equity_vesting_cents[0], true)}</span></div>
                <div className="card-actions"><Link to={`/offers/${offer.id}/edit`} onClick={(event) => event.stopPropagation()}><Pencil size={15} /> Edit</Link><button onClick={(event) => { event.stopPropagation(); if (window.confirm(`Delete the ${offer.company} offer?`)) deleteOffer.mutate(offer.id) }}><Trash2 size={15} /> Delete</button></div>
              </article>
            )
          })}
          <Link to="/offers/new" className="add-card"><Plus size={24} /><span>Add another offer</span><small>Build a new scenario</small></Link>
        </div>
      )}

      {offers.length > 0 && <div className={`compare-dock ${selected.length === 2 ? 'ready' : ''}`}><div><span>{selected.length === 2 ? 'Ready to compare' : 'Build your comparison'}</span><strong>{selected.length === 2 ? selected.map((id) => offers.find((offer) => offer.id === id)?.company).join(' vs. ') : `Select ${2 - selected.length} more offer${selected.length === 0 ? 's' : ''}`}</strong></div><button className="primary-button" disabled={selected.length !== 2} onClick={() => navigate(`/compare?ids=${selected.join(',')}`)}>See the real difference <ArrowRight size={17} /></button></div>}
    </div>
  )
}
