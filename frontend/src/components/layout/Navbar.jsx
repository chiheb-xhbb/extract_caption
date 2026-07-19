import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Settings, Zap, Sun } from 'lucide-react'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/config/constants'
import { ROUTES } from '@/config/routes'
import './Navbar.css'

const navItems = [
  { to: ROUTES.dashboard, label: 'Dashboard', Icon: LayoutDashboard },
  { to: ROUTES.settings,  label: 'Settings',  Icon: Settings },
]

export default function Navbar() {
  return (
    <div className="navbar-wrap">
      <header className="navbar">

        {/* Left: Brand */}
        <div className="navbar-brand">
          <div className="navbar-logo" aria-hidden="true">
            <Zap width={17} height={17} strokeWidth={2.5} style={{ fill: 'currentColor', color: '#fff' }} />
          </div>
          <span className="navbar-app-name">{APP_NAME}</span>
        </div>

        {/* Center: Navigation */}
        <nav className="navbar-nav" aria-label="Main navigation">
          {navItems.map(({ to, label, Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              aria-label={label}
              className={({ isActive }) =>
                cn('navbar-nav-link', isActive && 'active')
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className="navbar-nav-icon"
                    width={15}
                    height={15}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="navbar-actions">
          <button
            className="navbar-icon-btn"
            aria-label="Toggle theme"
          >
            <Sun width={15} height={15} strokeWidth={2} />
          </button>
        </div>

      </header>
    </div>
  )
}
