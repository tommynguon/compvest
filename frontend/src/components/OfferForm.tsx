import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, Save } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { centsToDollars } from '../lib/money'
import type { Offer } from '../lib/types'

const jurisdictions = [
  ['AB', 'Alberta'], ['BC', 'British Columbia'], ['MB', 'Manitoba'], ['NB', 'New Brunswick'],
  ['NL', 'Newfoundland and Labrador'], ['NS', 'Nova Scotia'], ['NT', 'Northwest Territories'],
  ['NU', 'Nunavut'], ['ON', 'Ontario'], ['PE', 'Prince Edward Island'], ['QC', 'Quebec'],
  ['SK', 'Saskatchewan'], ['YT', 'Yukon'],
]

const money = z.number().min(0, 'Enter zero or a positive amount')
const optionalMoney = z.number().min(0).optional()
const schema = z.object({
  company: z.string().min(1, 'Company is required'),
  role: z.string().min(1, 'Role is required'),
  city: z.string().min(1, 'City is required'),
  jurisdiction: z.string().length(2),
  work_mode: z.enum(['remote', 'hybrid', 'onsite']),
  notes: z.string(),
  salary: money,
  annual_bonus: money,
  signing_bonus: money,
  retirement_match: money,
  taxable_benefits: money,
  non_taxable_benefits: money,
  equity_1: money, equity_2: money, equity_3: money, equity_4: money,
  monthly_rent: money,
  relocation_cost: money,
  commute_cost: money,
  office_days: z.number().min(0).max(7),
  working_weeks: z.number().int().min(1).max(52),
  tax_override_1: optionalMoney, tax_override_2: optionalMoney, tax_override_3: optionalMoney, tax_override_4: optionalMoney,
})

export type OfferFormValues = z.infer<typeof schema>

const defaults = (offer?: Offer): OfferFormValues => ({
  company: offer?.company ?? '', role: offer?.role ?? '', city: offer?.city ?? '',
  jurisdiction: offer?.jurisdiction ?? 'ON', work_mode: offer?.work_mode ?? 'hybrid', notes: offer?.notes ?? '',
  salary: centsToDollars(offer?.salary_cents), annual_bonus: centsToDollars(offer?.annual_bonus_cents),
  signing_bonus: centsToDollars(offer?.signing_bonus_cents), retirement_match: centsToDollars(offer?.retirement_match_cents),
  taxable_benefits: centsToDollars(offer?.taxable_benefits_cents), non_taxable_benefits: centsToDollars(offer?.non_taxable_benefits_cents),
  equity_1: centsToDollars(offer?.equity_vesting_cents[0]), equity_2: centsToDollars(offer?.equity_vesting_cents[1]),
  equity_3: centsToDollars(offer?.equity_vesting_cents[2]), equity_4: centsToDollars(offer?.equity_vesting_cents[3]),
  monthly_rent: centsToDollars(offer?.monthly_rent_cents), relocation_cost: centsToDollars(offer?.relocation_cost_cents),
  commute_cost: centsToDollars(offer?.commute_cost_per_office_day_cents), office_days: Number(offer?.office_days_per_week ?? 2),
  working_weeks: offer?.working_weeks_per_year ?? 48,
  tax_override_1: overrideDollars(offer, '1'), tax_override_2: overrideDollars(offer, '2'),
  tax_override_3: overrideDollars(offer, '3'), tax_override_4: overrideDollars(offer, '4'),
})

function overrideDollars(offer: Offer | undefined, year: string) {
  const value = offer?.deduction_overrides_cents?.[year]?.income_tax_cents
  return value === undefined ? undefined : centsToDollars(value)
}

export function OfferForm({ offer, onSubmit, pending }: { offer?: Offer; onSubmit: (values: OfferFormValues) => void; pending: boolean }) {
  const [advanced, setAdvanced] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm<OfferFormValues>({ resolver: zodResolver(schema), defaultValues: defaults(offer) })
  const numeric = { valueAsNumber: true }

  return (
    <form className="offer-form" onSubmit={handleSubmit(onSubmit)}>
      <section className="form-section">
        <div className="section-title"><span>01</span><div><h2>The opportunity</h2><p>What is the role, and where will you do it?</p></div></div>
        <div className="form-grid three-col">
          <label>Company<input {...register('company')} placeholder="e.g. Wealthsimple" />{errors.company && <small>{errors.company.message}</small>}</label>
          <label>Role<input {...register('role')} placeholder="e.g. Software Developer" />{errors.role && <small>{errors.role.message}</small>}</label>
          <label>City<input {...register('city')} placeholder="e.g. Toronto" />{errors.city && <small>{errors.city.message}</small>}</label>
          <label>Province or territory<select {...register('jurisdiction')}>{jurisdictions.map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
          <label>Work arrangement<select {...register('work_mode')}><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label>
          <label>Notes<input {...register('notes')} placeholder="Optional context" /></label>
        </div>
      </section>

      <section className="form-section">
        <div className="section-title"><span>02</span><div><h2>Cash & benefits</h2><p>Annual amounts in Canadian dollars.</p></div></div>
        <div className="form-grid three-col">
          <MoneyField label="Base salary" name="salary" register={register} options={numeric} />
          <MoneyField label="Annual bonus" name="annual_bonus" register={register} options={numeric} />
          <MoneyField label="Signing bonus" name="signing_bonus" register={register} options={numeric} hint="Year 1 only" />
          <MoneyField label="Retirement match" name="retirement_match" register={register} options={numeric} />
          <MoneyField label="Taxable benefits" name="taxable_benefits" register={register} options={numeric} />
          <MoneyField label="Non-taxable benefits" name="non_taxable_benefits" register={register} options={numeric} />
        </div>
      </section>

      <section className="form-section">
        <div className="section-title"><span>03</span><div><h2>Equity vesting</h2><p>Expected CAD value when shares vest each year.</p></div></div>
        <div className="form-grid four-col">
          {([1, 2, 3, 4] as const).map((year) => <MoneyField key={year} label={`Year ${year}`} name={`equity_${year}` as keyof OfferFormValues} register={register} options={numeric} />)}
        </div>
      </section>

      <section className="form-section">
        <div className="section-title"><span>04</span><div><h2>Life around the offer</h2><p>Use your own assumptions—no generic city averages.</p></div></div>
        <div className="form-grid three-col">
          <MoneyField label="Monthly rent" name="monthly_rent" register={register} options={numeric} />
          <MoneyField label="Relocation cost" name="relocation_cost" register={register} options={numeric} hint="Year 1 only" />
          <MoneyField label="Commute per office day" name="commute_cost" register={register} options={numeric} />
          <label>Office days / week<input type="number" step="0.5" {...register('office_days', numeric)} /></label>
          <label>Working weeks / year<input type="number" {...register('working_weeks', numeric)} /></label>
        </div>
      </section>

      <section className="advanced-section">
        <button type="button" className="advanced-toggle" onClick={() => setAdvanced(!advanced)}>Advanced tax overrides <ChevronDown size={17} className={advanced ? 'open' : ''} /></button>
        {advanced && <div className="advanced-body"><p>Only use these if you already have a more precise annual income-tax estimate. Leave blank to use OfferLens.</p><div className="form-grid four-col">{([1, 2, 3, 4] as const).map((year) => <MoneyField key={year} label={`Year ${year} income tax`} name={`tax_override_${year}` as keyof OfferFormValues} register={register} options={numeric} optional />)}</div></div>}
      </section>

      <div className="sticky-actions"><span>Amounts are stored in CAD.</span><button className="primary-button" disabled={pending}><Save size={17} /> {pending ? 'Saving…' : offer ? 'Save changes' : 'Save offer'}</button></div>
    </form>
  )
}

type RegisterFn = ReturnType<typeof useForm<OfferFormValues>>['register']
function MoneyField({ label, name, register, options, hint, optional }: { label: string; name: keyof OfferFormValues; register: RegisterFn; options: { valueAsNumber: boolean }; hint?: string; optional?: boolean }) {
  return <label>{label}{hint && <span className="field-hint">{hint}</span>}<div className="money-input"><span>$</span><input type="number" step="1" placeholder={optional ? 'Use estimate' : '0'} {...register(name, options)} /></div></label>
}
