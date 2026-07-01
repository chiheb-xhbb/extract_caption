import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'

/**
 * AppShell — root layout for Dashboard and Settings pages.
 * Full-screen flex layout: fixed sidebar + scrollable main content.
 */
export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden"
         style={{ background: 'var(--color-bg-base)' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
