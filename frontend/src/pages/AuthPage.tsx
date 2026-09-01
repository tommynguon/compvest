import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Check, Scale, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { api, ApiError } from '../lib/api'
import type { User } from '../lib/types'

type AuthValues = { name: string; email: string; password: string }

export function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors } } = useForm<AuthValues>()
  const mutation = useMutation({
    mutationFn: (values: AuthValues) => api<{ user: User }>(mode === 'login' ? '/api/v1/login' : '/api/v1/register', {
      method: 'POST',
      body: JSON.stringify(mode === 'login' ? { email: values.email, password: values.password } : { user: values }),
    }),
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data)
      navigate('/')
    },
  })

  return (
    <div className="welcome-page">
      <header className="welcome-nav">
        <div className="brand"><span className="brand-mark"><Scale size={18} /></span> OfferLens <em>Canada</em></div>
        <span className="built-label">Built for Canadian offers</span>
      </header>
      <div className="welcome-grid">
        <section className="welcome-copy">
          <span className="eyebrow"><Sparkles size={14} /> Salary is only the first line</span>
          <h1>Know which offer<br /><span>actually pays off.</span></h1>
          <p className="welcome-lede">Compare salary, taxes, equity, rent, commuting, relocation and benefits—without hiding the assumptions.</p>
          <div className="mini-comparison" aria-hidden="true">
            <div className="mini-card mini-card-a"><span>TORONTO · HYBRID</span><strong>$118K</strong><small>headline package</small></div>
            <div className="versus">VS</div>
            <div className="mini-card mini-card-b"><span>MONTRÉAL · REMOTE</span><strong>$103K</strong><small>headline package</small></div>
            <div className="insight-pill"><Check size={14} /> Montréal leaves $9,420 more after costs</div>
          </div>
        </section>
        <section className="auth-panel">
          <div className="auth-tabs">
            <button className={mode === 'login' ? 'active' : ''} onClick={() => setMode('login')}>Sign in</button>
            <button className={mode === 'register' ? 'active' : ''} onClick={() => setMode('register')}>Create account</button>
          </div>
          <div className="auth-heading"><span>{mode === 'login' ? 'Welcome back' : 'Start comparing'}</span><h2>{mode === 'login' ? 'Your offers are waiting.' : 'Make the whole offer count.'}</h2></div>
          <form onSubmit={handleSubmit((values) => mutation.mutate(values))} className="auth-form">
            {mode === 'register' && <label>Full name<input {...register('name', { required: mode === 'register' })} placeholder="Tommy Nguon" />{errors.name && <small>Name is required</small>}</label>}
            <label>Email address<input type="email" {...register('email', { required: true })} placeholder="you@example.com" />{errors.email && <small>Email is required</small>}</label>
            <label>Password<input type="password" {...register('password', { required: true, minLength: 8 })} placeholder="At least 8 characters" />{errors.password && <small>Use at least 8 characters</small>}</label>
            {mutation.error && <div className="form-error">{mutation.error instanceof ApiError && mutation.error.message === 'invalid_credentials' ? 'That email and password do not match.' : 'Please check your information and try again.'}</div>}
            <button className="primary-button full-button" disabled={mutation.isPending}>{mutation.isPending ? 'One moment…' : mode === 'login' ? 'Open my offers' : 'Create my workspace'} <ArrowRight size={17} /></button>
          </form>
          <p className="auth-footnote">Your offer data stays in your account. No bank connection required.</p>
        </section>
      </div>
      <footer className="welcome-footer"><span>13 provinces & territories</span><span>2026 tax assumptions</span><span>1-year + 4-year views</span></footer>
    </div>
  )
}
