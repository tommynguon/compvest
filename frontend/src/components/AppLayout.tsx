import { HardDrive, Scale } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <Link className="brand" to="/">
          <span className="brand-mark"><Scale size={18} /></span>
          <span>CompVest</span>
        </Link>
        <div className="personal-indicator"><HardDrive size={16} /><span>Personal tool · stored locally</span></div>
      </header>
      <main>{children}</main>
    </div>
  )
}
