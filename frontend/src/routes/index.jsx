import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import AppShell from '@/components/layout/AppShell'
import GlobalSpinner from '@/components/common/GlobalSpinner'
import ErrorBoundary from '@/components/common/ErrorBoundary'

// Lazy-load all pages for code splitting
const DashboardPage = lazy(() => import('@/pages/DashboardPage'))
const EditorPage    = lazy(() => import('@/pages/EditorPage'))
const SettingsPage  = lazy(() => import('@/pages/SettingsPage'))
const NotFoundPage  = lazy(() => import('@/pages/NotFoundPage'))

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<GlobalSpinner />}>
            <DashboardPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.settings,
        element: (
          <Suspense fallback={<GlobalSpinner />}>
            <SettingsPage />
          </Suspense>
        ),
      },
    ],
  },
  // Editor is a full-screen experience with its own layout
  {
    path: ROUTES.editor(),
    errorElement: <ErrorBoundary />,
    element: (
      <Suspense fallback={<GlobalSpinner />}>
        <EditorPage />
      </Suspense>
    ),
  },
  {
    path: ROUTES.notFound,
    element: (
      <Suspense fallback={<GlobalSpinner />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
])

export default function AppRouter() {
  return <RouterProvider router={router} />
}
