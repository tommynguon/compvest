import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LogOut, Scale } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import type { User } from '../lib/types'

export function AppLayout({ user, children }: { user: User; children: ReactNode }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const logout = useMutation({
    mutationFn: () => api('/api/v1/logout', { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.clear()
      navigate('/welcome')
    },
  })

  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark"><Scale size={18} /></span>
          <span>OfferLens <em>Canada</em></span>
        </Link>
        <div className="account-menu">
          <span className="user-dot">{user.name.charAt(0).toUpperCase()}</span>
          <span className="user-name">{user.name}</span>
          <button className="icon-button" onClick={() => logout.mutate()} aria-label="Sign out"><LogOut size={17} /></button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
