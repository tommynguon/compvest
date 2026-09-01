import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthPage } from './AuthPage'

describe('AuthPage', () => {
  it('switches from sign in to account creation', async () => {
    render(<QueryClientProvider client={new QueryClient()}><MemoryRouter><AuthPage /></MemoryRouter></QueryClientProvider>)

    expect(screen.getByRole('heading', { name: 'Your offers are waiting.' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Create account' }))
    expect(screen.getByRole('heading', { name: 'Make the whole offer count.' })).toBeInTheDocument()
    expect(screen.getByLabelText('Full name')).toBeInTheDocument()
  })
})
