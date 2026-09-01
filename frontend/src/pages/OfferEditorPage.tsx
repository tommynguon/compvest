import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { OfferForm, type OfferFormValues } from '../components/OfferForm'
import { api } from '../lib/api'
import { toOfferPayload } from '../lib/offerPayload'
import type { Offer } from '../lib/types'

export function OfferEditorPage() {
  const { offerId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const offerQuery = useQuery({
    queryKey: ['offer', offerId],
    queryFn: () => api<{ offer: Offer }>(`/api/v1/offers/${offerId}`),
    enabled: Boolean(offerId),
  })
  const mutation = useMutation({
    mutationFn: (values: OfferFormValues) => api<{ offer: Offer }>(offerId ? `/api/v1/offers/${offerId}` : '/api/v1/offers', {
      method: offerId ? 'PATCH' : 'POST',
      body: JSON.stringify({ offer: toOfferPayload(values) }),
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      navigate('/')
    },
  })

  if (offerId && offerQuery.isLoading) return <div className="page-state">Loading offer…</div>

  return (
    <div className="page-wrap editor-page">
      <Link to="/" className="back-link"><ArrowLeft size={16} /> Back to my offers</Link>
      <div className="page-heading"><span className="eyebrow">{offerId ? 'Edit offer' : 'New offer'}</span><h1>{offerId ? 'Update the numbers' : 'Add an offer'}</h1><p>Enter the offer in its native currency, then add the costs you expect for that location.</p></div>
      {mutation.isError && <div className="banner-error">We could not save this offer. Check the highlighted values and try again.</div>}
      <OfferForm key={offerQuery.data?.offer.id ?? 'new'} offer={offerQuery.data?.offer} onSubmit={(values) => mutation.mutate(values)} pending={mutation.isPending} />
    </div>
  )
}
