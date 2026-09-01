import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronDown, Save } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { centsToDollars } from '../lib/money'
import type { CountryCode, Offer } from '../lib/types'

export const REGIONS = {
  CA: [
    ['AB', 'Alberta'], ['BC', 'British Columbia'], ['MB', 'Manitoba'], ['NB', 'New Brunswick'],
    ['NL', 'Newfoundland and Labrador'], ['NS', 'Nova Scotia'], ['NT', 'Northwest Territories'],
    ['NU', 'Nunavut'], ['ON', 'Ontario'], ['PE', 'Prince Edward Island'], ['QC', 'Quebec'],
    ['SK', 'Saskatchewan'], ['YT', 'Yukon'],
  ],
  US: [
    ['AL', 'Alabama'], ['AK', 'Alaska'], ['AZ', 'Arizona'], ['AR', 'Arkansas'], ['CA', 'California'],
    ['CO', 'Colorado'], ['CT', 'Connecticut'], ['DE', 'Delaware'], ['DC', 'District of Columbia'],
    ['FL', 'Florida'], ['GA', 'Georgia'], ['HI', 'Hawaii'], ['ID', 'Idaho'], ['IL', 'Illinois'],
    ['IN', 'Indiana'], ['IA', 'Iowa'], ['KS', 'Kansas'], ['KY', 'Kentucky'], ['LA', 'Louisiana'],
    ['ME', 'Maine'], ['MD', 'Maryland'], ['MA', 'Massachusetts'], ['MI', 'Michigan'], ['MN', 'Minnesota'],
    ['MS', 'Mississippi'], ['MO', 'Missouri'], ['MT', 'Montana'], ['NE', 'Nebraska'], ['NV', 'Nevada'],
    ['NH', 'New Hampshire'], ['NJ', 'New Jersey'], ['NM', 'New Mexico'], ['NY', 'New York'],
    ['NC', 'North Carolina'], ['ND', 'North Dakota'], ['OH', 'Ohio'], ['OK', 'Oklahoma'], ['OR', 'Oregon'],
    ['PA', 'Pennsylvania'], ['RI', 'Rhode Island'], ['SC', 'South Carolina'], ['SD', 'South Dakota'],
    ['TN', 'Tennessee'], ['TX', 'Texas'], ['UT', 'Utah'], ['VT', 'Vermont'], ['VA', 'Virginia'],
    ['WA', 'Washington'], ['WV', 'West Virginia'], ['WI', 'Wisconsin'], ['WY', 'Wyoming'],
  ],
} as const

const money = z.number().min(0, 'Enter zero or a positive amount')
const optionalMoney = z.number().min(0).optional()
const schema = z.object({
  company: z.string().min(1, 'Company is required'), role: z.string().min(1, 'Role is required'),
  city: z.string().min(1, 'City is required'), country_code: z.enum(['CA', 'US']),
  jurisdiction: z.string().length(2), employment_type: z.enum(['full_time', 'internship']),
  pay_basis: z.enum(['annual', 'hourly']), work_mode: z.enum(['remote', 'hybrid', 'onsite']), notes: z.string(),
  salary: money, hourly_rate: money, hours_per_week: z.number().min(1).max(80), term_weeks: z.number().int().min(1).max(52),
  annual_bonus: money, signing_bonus: money, retirement_match: money,
  taxable_benefits: money, non_taxable_benefits: money,
  equity_1: money, equity_2: money, equity_3: money, equity_4: money,
  monthly_rent: money, monthly_other_living_costs: money, relocation_cost: money, commute_cost: money,
  office_days: z.number().min(0).max(7), working_weeks: z.number().int().min(1).max(52),
  tax_override_1: optionalMoney, tax_override_2: optionalMoney, tax_override_3: optionalMoney, tax_override_4: optionalMoney,
  payroll_override_1: optionalMoney, payroll_override_2: optionalMoney,
  payroll_override_3: optionalMoney, payroll_override_4: optionalMoney,
})

export type OfferFormValues = z.infer<typeof schema>

const defaults = (offer?: Offer): OfferFormValues => ({
  company: offer?.company ?? '', role: offer?.role ?? '', city: offer?.city ?? '',
  country_code: offer?.country_code ?? 'CA', jurisdiction: offer?.jurisdiction ?? 'ON',
  employment_type: offer?.employment_type ?? 'full_time', pay_basis: offer?.pay_basis ?? 'annual',
  work_mode: offer?.work_mode ?? 'hybrid', notes: offer?.notes ?? '', salary: centsToDollars(offer?.salary_cents),
  hourly_rate: centsToDollars(offer?.hourly_rate_cents), hours_per_week: Number(offer?.hours_per_week ?? 40),
  term_weeks: offer?.term_weeks ?? 16, annual_bonus: centsToDollars(offer?.annual_bonus_cents),
  signing_bonus: centsToDollars(offer?.signing_bonus_cents), retirement_match: centsToDollars(offer?.retirement_match_cents),
  taxable_benefits: centsToDollars(offer?.taxable_benefits_cents), non_taxable_benefits: centsToDollars(offer?.non_taxable_benefits_cents),
  equity_1: centsToDollars(offer?.equity_vesting_cents[0]), equity_2: centsToDollars(offer?.equity_vesting_cents[1]),
  equity_3: centsToDollars(offer?.equity_vesting_cents[2]), equity_4: centsToDollars(offer?.equity_vesting_cents[3]),
  monthly_rent: centsToDollars(offer?.monthly_rent_cents),
  monthly_other_living_costs: centsToDollars(offer?.monthly_other_living_costs_cents),
  relocation_cost: centsToDollars(offer?.relocation_cost_cents),
  commute_cost: centsToDollars(offer?.commute_cost_per_office_day_cents),
  office_days: Number(offer?.office_days_per_week ?? 2), working_weeks: offer?.working_weeks_per_year ?? 48,
  tax_override_1: overrideDollars(offer, '1', 'income_tax_cents'),
  tax_override_2: overrideDollars(offer, '2', 'income_tax_cents'),
  tax_override_3: overrideDollars(offer, '3', 'income_tax_cents'),
  tax_override_4: overrideDollars(offer, '4', 'income_tax_cents'),
  payroll_override_1: overrideDollars(offer, '1', 'payroll_deductions_cents'),
  payroll_override_2: overrideDollars(offer, '2', 'payroll_deductions_cents'),
  payroll_override_3: overrideDollars(offer, '3', 'payroll_deductions_cents'),
  payroll_override_4: overrideDollars(offer, '4', 'payroll_deductions_cents'),
})

function overrideDollars(offer: Offer | undefined, period: string, field: string) {
  const value = offer?.deduction_overrides_cents?.[period]?.[field]
  return value === undefined ? undefined : centsToDollars(value)
}

export function OfferForm({ offer, onSubmit, pending }: { offer?: Offer; onSubmit: (values: OfferFormValues) => void; pending: boolean }) {
  const [advanced, setAdvanced] = useState(false)
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<OfferFormValues>({
    resolver: zodResolver(schema), defaultValues: defaults(offer),
  })
  const country = watch('country_code') as CountryCode
  const employment = watch('employment_type')
  const payBasis = watch('pay_basis')
  const currency = country === 'US' ? 'USD' : 'CAD'
  const numeric = { valueAsNumber: true }

  useEffect(() => {
    const validCodes = REGIONS[country].map(([code]) => code as string)
    if (!validCodes.includes(watch('jurisdiction'))) setValue('jurisdiction', country === 'US' ? 'CA' : 'ON')
  }, [country, setValue, watch])

  const overridePeriods = employment === 'internship' ? [1] : [1, 2, 3, 4]

  return (
    <form className="offer-form" onSubmit={handleSubmit(onSubmit)}>
      <section className="form-section">
        <div className="section-title"><span>01</span><div><h2>Offer details</h2><p>Enter where, how, and for how long you would work.</p></div></div>
        <div className="form-grid three-col">
          <label>Company<input {...register('company')} placeholder="e.g. Wealthsimple" />{errors.company && <small>{errors.company.message}</small>}</label>
          <label>Role<input {...register('role')} placeholder="e.g. Software Developer Intern" />{errors.role && <small>{errors.role.message}</small>}</label>
          <label>City<input {...register('city')} placeholder="e.g. Toronto" />{errors.city && <small>{errors.city.message}</small>}</label>
          <label>Country<select {...register('country_code')}><option value="CA">Canada</option><option value="US">United States</option></select></label>
          <label>{country === 'US' ? 'State or DC' : 'Province or territory'}<select {...register('jurisdiction')}>{REGIONS[country].map(([code, name]) => <option key={code} value={code}>{name}</option>)}</select></label>
          <label>Employment type<select {...register('employment_type')}><option value="full_time">Full-time</option><option value="internship">Internship</option></select></label>
          <label>Pay basis<select {...register('pay_basis')}><option value="annual">Annual salary</option><option value="hourly">Hourly rate</option></select></label>
          <label>Work arrangement<select {...register('work_mode')}><option value="remote">Remote</option><option value="hybrid">Hybrid</option><option value="onsite">On-site</option></select></label>
          <label>Notes<input {...register('notes')} placeholder="Optional context" /></label>
          {employment === 'internship' && <><label>Term length (weeks)<input type="number" {...register('term_weeks', numeric)} /></label><label>Hours / week<input type="number" step="0.5" {...register('hours_per_week', numeric)} /></label></>}
        </div>
      </section>

      <section className="form-section">
        <div className="section-title"><span>02</span><div><h2>Pay and benefits</h2><p>Keep each offer in its native currency: {currency}.</p></div></div>
        <div className="form-grid three-col">
          {payBasis === 'annual' ? <MoneyField label={`Annual salary (${currency})`} name="salary" register={register} options={numeric} /> : <MoneyField label={`Hourly rate (${currency})`} name="hourly_rate" register={register} options={numeric} step="0.01" />}
          {payBasis === 'hourly' && employment === 'full_time' && <label>Hours / week<input type="number" step="0.5" {...register('hours_per_week', numeric)} /></label>}
          <MoneyField label={`Annual bonus (${currency})`} name="annual_bonus" register={register} options={numeric} />
          <MoneyField label={`Signing bonus (${currency})`} name="signing_bonus" register={register} options={numeric} hint="One time" />
          <MoneyField label={`Retirement match (${currency})`} name="retirement_match" register={register} options={numeric} />
          <MoneyField label={`Taxable benefits (${currency})`} name="taxable_benefits" register={register} options={numeric} />
          <MoneyField label={`Non-taxable benefits (${currency})`} name="non_taxable_benefits" register={register} options={numeric} />
        </div>
      </section>

      <section className="form-section">
        <div className="section-title"><span>03</span><div><h2>Equity value</h2><p>{employment === 'internship' ? `Expected ${currency} value during the term.` : `Expected ${currency} value when shares vest each year.`}</p></div></div>
        <div className="form-grid four-col">
          {(employment === 'internship' ? [1] : [1, 2, 3, 4]).map((period) => <MoneyField key={period} label={employment === 'internship' ? 'Term equity' : `Year ${period}`} name={`equity_${period}` as keyof OfferFormValues} register={register} options={numeric} />)}
        </div>
      </section>

      <section className="form-section">
        <div className="section-title"><span>04</span><div><h2>Living costs</h2><p>Use your own assumptions for the location and term.</p></div></div>
        <div className="form-grid three-col">
          <MoneyField label={`Monthly rent (${currency})`} name="monthly_rent" register={register} options={numeric} />
          <MoneyField label={`Other monthly costs (${currency})`} name="monthly_other_living_costs" register={register} options={numeric} hint="Food, utilities, insurance" />
          <MoneyField label={`Relocation (${currency})`} name="relocation_cost" register={register} options={numeric} hint="One time" />
          <MoneyField label={`Commute / office day (${currency})`} name="commute_cost" register={register} options={numeric} step="0.01" />
          <label>Office days / week<input type="number" step="0.5" {...register('office_days', numeric)} /></label>
          <label>Working weeks / year<input type="number" {...register('working_weeks', numeric)} /></label>
        </div>
      </section>

      <section className="advanced-section">
        <button type="button" className="advanced-toggle" onClick={() => setAdvanced(!advanced)}>Manual deduction overrides <ChevronDown size={17} className={advanced ? 'open' : ''} /></button>
        {advanced && <div className="advanced-body"><p>Leave blank to use CompVest estimates. Enter income tax or payroll deductions only when you have a better figure.</p><div className="form-grid four-col">{overridePeriods.flatMap((period) => [
          <MoneyField key={`tax-${period}`} label={`${employment === 'internship' ? 'Term' : `Year ${period}`} income tax`} name={`tax_override_${period}` as keyof OfferFormValues} register={register} options={numeric} optional />,
          <MoneyField key={`payroll-${period}`} label={`${employment === 'internship' ? 'Term' : `Year ${period}`} payroll`} name={`payroll_override_${period}` as keyof OfferFormValues} register={register} options={numeric} optional />,
        ])}</div></div>}
      </section>

      <div className="sticky-actions"><span>Inputs stay in {currency}; comparison display currency is chosen on My offers.</span><button className="primary-button" disabled={pending}><Save size={17} /> {pending ? 'Saving…' : offer ? 'Save changes' : 'Save offer'}</button></div>
    </form>
  )
}

type RegisterFn = ReturnType<typeof useForm<OfferFormValues>>['register']
function MoneyField({ label, name, register, options, hint, optional, step = '1' }: { label: string; name: keyof OfferFormValues; register: RegisterFn; options: { valueAsNumber: boolean }; hint?: string; optional?: boolean; step?: string }) {
  return <label>{label}{hint && <span className="field-hint">{hint}</span>}<div className="money-input"><span>$</span><input type="number" step={step} placeholder={optional ? 'Use estimate' : '0'} {...register(name, options)} /></div></label>
}
