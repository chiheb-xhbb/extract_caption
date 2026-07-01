import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Settings, Zap } from 'lucide-react'
import { cn } from '@/lib/cn'
import { APP_NAME } from '@/config/constants'
import { ROUTES } from '@/config/routes'

const navItems = [
  { to: ROUTES.dashboard, label: 'Dashboard', Icon: LayoutDashboard },
  { to: ROUTES.settings,  label: 'Settings',  Icon: Settings },
]

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col w-[220px] shrink-0 h-screen"
      style={{
        background: 'var(--color-bg-elevated)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Brand */}
      <div
        className="flex items-center gap-2.5 px-4 h-14 border-b shrink-0"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 gradient-primary"
          style={{ boxShadow: 'var(--shadow-glow-sm)' }}
        >
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          {APP_NAME}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5" aria-label="Main navigation">
        {navItems.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            aria-label={label}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
                'transition-all duration-[var(--duration-fast)] select-none',
                isActive
                  ? 'text-white'
                  : 'hover:bg-white/5 hover:text-[var(--color-text-primary)]',
              )
            }
            style={({ isActive }) => ({
              background: isActive ? 'var(--color-primary-muted)' : undefined,
              color: isActive ? 'var(--color-primary-light)' : 'var(--color-text-secondary)',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className="w-4 h-4 shrink-0"
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {label}
                {isActive && (
                  <span
                    className="ml-auto w-1 h-4 rounded-full"
                    style={{ background: 'var(--color-primary)' }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div
        className="px-4 py-3 border-t"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <p className="text-xs" style={{ color: 'var(--color-text-disabled)' }}>
          v{import.meta.env.VITE_APP_VERSION ?? '1.0.0'}
        </p>
      </div>
    </aside>
  )
}
