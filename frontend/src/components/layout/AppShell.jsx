import { Outlet } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import './AppShell.css'

/**
 * Root layout: floating navbar + scrollable main area.
 */
export default function AppShell() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="app-shell-main">
        <Outlet />
      </main>
    </div>
  )
}
